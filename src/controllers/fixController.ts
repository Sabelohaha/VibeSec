import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { AIFixService } from '../services/aiFixService';

const fixService = new AIFixService();

export const requestAIFix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vulnerability_id } = req.body;
    const userId = req.user.id;
    const userTier = req.user.user_metadata?.plan || 'free';

    if (!vulnerability_id) return res.status(400).json({ error: 'vulnerability_id required' });

    const markdown = await fixService.getAiFix(userId, vulnerability_id, userTier);
    return res.json({ response_markdown: markdown });
  } catch (err: any) {
    if (err.status) {
      return res.status(err.status).json(err);
    }
    next(err);
  }
};

export const getCachedFix = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vulnerability_id } = req.params;
    const { data: fix } = await supabaseAdmin
      .from('ai_fixes')
      .select('response_markdown')
      .eq('vulnerability_id', vulnerability_id)
      .single();

    if (!fix) return res.status(404).json({ error: 'Not found' });
    return res.json({ response_markdown: fix.response_markdown });
  } catch (err) {
    next(err);
  }
};

export const sendChat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vulnerability_id, content } = req.body;
    const userId = req.user.id;
    const userTier = req.user.user_metadata?.plan || 'free';

    if (!vulnerability_id || !content) return res.status(400).json({ error: 'Data missing' });

    const response = await fixService.sendChatMessage(userId, vulnerability_id, content, userTier);
    return res.json({ content: response });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json(err);
    next(err);
  }
};

export const fetchHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vulnerability_id } = req.params;
    const userId = req.user.id;

    const data = await fixService.getChatHistory(userId, vulnerability_id);
    return res.json(data);
  } catch (err) {
    next(err);
  }
};
