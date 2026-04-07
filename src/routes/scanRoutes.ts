import { Router } from 'express';
import { createScan, getScanStatus, getUserScans, trustPath } from '../controllers/scanController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/scan', authMiddleware, createScan);
router.post('/scan/trust', authMiddleware, trustPath);
router.get('/scan/:scanId', authMiddleware, getScanStatus);
router.get('/scans', authMiddleware, getUserScans);

export default router;
