import { Router } from 'express';
import { createCheckoutSession } from '../controllers/stripeController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/checkout', authMiddleware, createCheckoutSession);

export default router;
