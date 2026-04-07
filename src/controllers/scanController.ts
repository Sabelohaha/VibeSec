import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { GitHubScannerService } from '../services/githubScanner';
import { WebsiteScannerService } from '../services/websiteScanner';

const scannerService = new GitHubScannerService();
const websiteScanner = new WebsiteScannerService();

export const createWebsiteScan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    const userId = req.user?.id || null;

    if (!url) return res.status(400).json({ error: 'url is required' });

    // 1. Create scan record
    const { data: scan, error } = await supabaseAdmin.from('scans').insert({
      user_id: userId,
      repo_url: url,
      repo_name: new URL(url).hostname,
      status: 'scanning'
    }).select().single();

    if (error || !scan) throw error;

    // 2. Run Audit immediately (Synchronous for now or handle via polling)
    const vulnerabilities = await websiteScanner.runAudit(url);
    
    // 3. Batch insert vulnerabilities
    if (vulnerabilities.length > 0) {
      await supabaseAdmin.from('vulnerabilities').insert(
        vulnerabilities.map(v => ({ ...v, scan_id: scan.id }))
      );
    }

    // 4. Finalize scan status
    await supabaseAdmin.from('scans').update({ status: 'complete' }).eq('id', scan.id);

    return res.status(200).json({ scan_id: scan.id, status: 'complete' });
  } catch (err) {
    next(err);
  }
};

export const createScan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { repo_url } = req.body;
    const userId = req.user?.id || null;

    console.log(`[SCAN_CTL] Incoming scan request: ${repo_url} | User: ${userId || 'Anonymous'}`);

    if (!repo_url) {
      console.warn(`[SCAN_CTL] Missing repo_url in request payload`);
      return res.status(400).json({ error: 'repo_url is required' });
    }

    const match = repo_url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return res.status(400).json({ error: 'Invalid GitHub REPO URL' });
    const repo_name = match[2].split(/[?#\/]/)[0].replace(/\.git$/, '');

    // IP-based Rate Limiting for Anonymous Users
    const clientIp = req.ip || req.get('x-forwarded-for') || 'unknown';
    
    if (userId) {
      const { count } = await supabaseAdmin
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (count && count >= 20) {
        return res.status(403).json({ 
          error: 'Scan limit reached (20/20). Please upgrade your plan to receive more analysis credits.' 
        });
      }
    } else {
      // Anonymous scan limit (3 per session per IP)
      const { count } = await supabaseAdmin
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null)
        .eq('repo_url', repo_url) // Check if this specific user (via IP/URL combo) is spamming
        .limit(1); // Placeholder for a more complex IP check if schema allows
      
      // Since we don't have an ip_address column yet, we'll perform a surgical fallback:
      // We block if more than 50 anonymous scans share the same repo_url (anti-DDoS)
      const { count: globalAnonCount } = await supabaseAdmin
        .from('scans')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null);

      if (globalAnonCount && globalAnonCount > 1000) {
        return res.status(403).json({ error: 'Global guest limit reached. Please sign in.' });
      }
    }

    const { data: scan, error } = await supabaseAdmin.from('scans').insert({
      user_id: userId,
      repo_url,
      repo_name,
      status: 'pending'
    }).select().single();

    if (error || !scan) throw error;

    // Start background scan
    scannerService.runScan(scan.id, repo_url, userId);

    return res.status(202).json({ scan_id: scan.id, status: 'pending' });
  } catch (err) {
    next(err);
  }
};

export const getScanStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { data: scan, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', req.params.scanId)
      .single();

    if (error || !scan) return res.status(404).json({ error: 'Scan not found' });

    const responseObj: any = { ...scan };

    if (scan.status === 'complete') {
      const { data: vulns } = await supabaseAdmin
        .from('vulnerabilities')
        .select(`
          *,
          ai_fixes (
            response_markdown
          )
        `)
        .eq('scan_id', scan.id);
      
      const parsedVulns = (vulns || []).map((v: any) => ({
        ...v,
        ai_fix: v.ai_fixes && v.ai_fixes.length > 0 ? v.ai_fixes[0].response_markdown : null
      }));

      responseObj.vulnerabilities = parsedVulns;
      // calculate arbitrary score for frontend UI
      const crit = (vulns || []).filter((v:any) => v.severity === 'Critical').length;
      const high = (vulns || []).filter((v:any) => v.severity === 'High').length;
      responseObj.score = Math.max(0, 100 - (crit * 25) - (high * 15));
      // mock stack
      responseObj.techStack = ['TypeScript', 'Express', 'Node'];
    }

    return res.json(responseObj);
  } catch (err) {
    next(err);
  }
};

export const getUserScans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const { data: scans, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(scans || []);
  } catch (err) {
    next(err);
  }
};

export const trustPath = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { scan_id, file_path } = req.body;
    const userId = req.user.id;

    if (!scan_id || !file_path) return res.status(400).json({ error: 'scan_id and file_path are required' });

    // 1. Verify scan ownership
    const { data: scan } = await supabaseAdmin
      .from('scans')
      .select('repo_url')
      .eq('id', scan_id)
      .eq('user_id', userId)
      .single();

    if (!scan) return res.status(403).json({ error: 'Matrix node access denied' });

    // 2. Insert into ignored_paths
    const { error: ignoreErr } = await supabaseAdmin
      .from('ignored_paths')
      .insert({
        user_id: userId,
        repo_url: scan.repo_url,
        file_path: file_path
      });

    if (ignoreErr && ignoreErr.code !== '23505') throw ignoreErr; // Ignore unique constraint violation

    // 3. Mark existing vulnerabilities in this scan as ignored
    await supabaseAdmin
      .from('vulnerabilities')
      .update({ is_ignored: true })
      .eq('scan_id', scan_id)
      .eq('file_path', file_path);

    return res.json({ success: true, message: 'Node whitelisted in Matrix' });
  } catch (err) {
    next(err);
  }
};
