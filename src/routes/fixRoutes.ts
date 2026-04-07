import { Router } from 'express';
import { requestAIFix, getCachedFix, sendChat, fetchHistory } from '../controllers/fixController';
import { authMiddleware } from '../middleware/auth';
import { ipLimiter, userLimiter } from '../middleware/rateLimit';

const router = Router();

router.post('/fix/ai', authMiddleware, requestAIFix);
router.get('/fix/:vulnerability_id', authMiddleware, getCachedFix);
router.post('/fix/chat', authMiddleware, sendChat);
router.get('/fix/chat/:vulnerability_id', authMiddleware, fetchHistory);

export default router;
