import { supabaseAdmin } from '../config/supabase';

export class AIFixService {
  private async callDeepSeek(messages: any[]): Promise<string> {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('[DEEPSEEK_DEBUG] DEEPSEEK_API_KEY is not defined in environment nodes');
    }

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          stream: false
        })
      });

      const data = await response.json() as any;

      if (!response.ok) {
        throw new Error(`[DEEPSEEK_DEBUG] API Error: ${data.error?.message || response.statusText}`);
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      console.error('[DEEPSEEK_DEBUG] Critical Failure:', error);
      throw {
        status: error.status || 500,
        error: error.message || 'Internal Intelligence Error',
        code: 'BLOCK_DEEPSEEK'
      };
    }
  }

  async getAiFix(userId: string, vulnerabilityId: string, userTier: 'free' | 'paid' | 'developer' = 'free'): Promise<string> {
    // 0. Cache Breach Check
    const { data: cached } = await supabaseAdmin
      .from('ai_fixes')
      .select('response_markdown')
      .eq('vulnerability_id', vulnerabilityId)
      .single();

    if (cached) return cached.response_markdown;

    // 1. Internal Rate Limit: 2 per 60s for FREE tier
    const { data: recentFixes } = await supabaseAdmin
      .from('ai_fixes')
      .select('created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(2);

    if (recentFixes && recentFixes.length >= 2 && userTier === 'free') {
      const oldestFixTime = new Date(recentFixes[1].created_at).getTime();
      const secondsSince = (Date.now() - oldestFixTime) / 1000;

      if (secondsSince < 60) {
        throw {
          status: 429,
          error: `[INTERNAL_RATE_LIMIT] 2 per minute quota reached. Matrix stabilizing in ${60 - Math.floor(secondsSince)}s.`,
          code: 'BLOCK_RATE_LIMIT'
        };
      }
    }

    // 2. Intelligence Quota Check
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: usageObj } = await supabaseAdmin
      .from('ai_fix_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    let currentCount = usageObj?.monthly_count || 0;

    if (usageObj && new Date(usageObj.last_reset) < firstDayOfMonth) {
      await supabaseAdmin.from('ai_fix_usage').update({ monthly_count: 0, last_reset: now.toISOString() }).eq('user_id', userId);
      currentCount = 0;
    } else if (!usageObj) {
      await supabaseAdmin.from('ai_fix_usage').insert({ user_id: userId, monthly_count: 0, last_reset: now.toISOString() });
    }

    const tierLimit = userTier === 'developer' ? 999999 : (userTier === 'paid' ? 100 : 10);

    if (currentCount >= tierLimit && userTier === 'free') {
      throw {
        status: 403,
        error: `[INTERNAL_QUOTA] Monthly Limit Reached (${currentCount}/${tierLimit}). Upgrade to Pro for unlimited fixes.`,
        code: 'BLOCK_QUOTA'
      };
    }

    // Verify vulnerability ownership
    const { data: vuln, error: vulnErr } = await supabaseAdmin
      .from('vulnerabilities')
      .select('*, scans!inner(user_id)')
      .eq('id', vulnerabilityId)
      .single();

    if (vulnErr || !vuln) {
      throw { status: 404, error: "Vulnerability not found" };
    }

    if (vuln.scans.user_id !== userId) {
      throw { status: 403, error: "Cannot access vulnerability from a scan you do not own" };
    }

    // Generation
    const systemPrompt = "You are a Cybersecurity Expert. Provide a production-hardened remediation patch in Markdown format including Before/After code blocks.";
    const userPrompt = `Vulnerability: ${vuln.title}
File: ${vuln.file_path}, Line: ${vuln.line_number}
Description: ${vuln.description}`;

    const textResp = await this.callDeepSeek([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]);

    // Storage & Usage Increment
    await supabaseAdmin.from('ai_fixes').insert({ user_id: userId, vulnerability_id: vulnerabilityId, response_markdown: textResp });
    await supabaseAdmin.from('ai_fix_usage').update({ monthly_count: currentCount + 1 }).eq('user_id', userId);

    return textResp;
  }

  async sendChatMessage(userId: string, vulnerability_id: string, content: string, userTier: 'free' | 'paid' | 'developer' = 'free'): Promise<string> {
    // 1. Check Total Message Limit for Free Tier
    const { count: msgCount } = await supabaseAdmin
      .from('ai_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (userTier === 'free' && msgCount && msgCount >= 10) {
      throw {
        status: 403,
        error: "Intelligence Quota Exceeded (10/10). Please upgrade to Pro for unlimited Deep-Audit sessions.",
        limit: 10,
        used: msgCount
      };
    }

    // 2. Fetch History
    const { data: history } = await supabaseAdmin
      .from('ai_chat_messages')
      .select('*')
      .eq('vulnerability_id', vulnerability_id)
      .order('created_at', { ascending: true });

    // 3. Fetch Base Vulnerability context
    const { data: vuln } = await supabaseAdmin
      .from('vulnerabilities')
      .select('*')
      .eq('id', vulnerability_id)
      .single();

    const messages = [];
    messages.push({ 
      role: 'system', 
      content: `You are a Cybersecurity Expert. You are assisting with a vulnerability report for ${vuln?.title} (${vuln?.type}) in file ${vuln?.file_path}. Description: ${vuln?.description}` 
    });

    if (history) {
      for (const m of history) {
        messages.push({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content });
      }
    }

    messages.push({ role: 'user', content: content });

    // 4. Execution
    const textResp = await this.callDeepSeek(messages);

    // 5. Persistence
    await supabaseAdmin.from('ai_chat_messages').insert([
      { user_id: userId, vulnerability_id, role: 'user', content: content },
      { user_id: userId, vulnerability_id, role: 'assistant', content: textResp }
    ]);

    return textResp;
  }

  async getChatHistory(userId: string, vulnerability_id: string) {
    const { data: history } = await supabaseAdmin
      .from('ai_chat_messages')
      .select('*')
      .eq('vulnerability_id', vulnerability_id)
      .order('created_at', { ascending: true });

    const { count: totalUsed } = await supabaseAdmin
      .from('ai_chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return {
      messages: history || [],
      totalUsed: totalUsed || 0
    };
  }
}
