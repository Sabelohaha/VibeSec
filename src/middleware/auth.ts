import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Allow unauthenticated access to scan creation and polling
  if (req.path.startsWith('/scan')) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
