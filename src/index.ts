import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

import scanRoutes from './routes/scanRoutes';
import fixRoutes from './routes/fixRoutes';

import stripeRoutes from './routes/stripeRoutes';
import { webhookHandler } from './controllers/stripeController';

const app = express();

// 1. Hardened Security Layer
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. Surgical CORS & Preflight Sequence
app.use(cors({
  origin: true, // Dynamically mirror the request origin to satisfy the Handshake
  credentials: true,
  optionsSuccessStatus: 200
}));

// Explicitly handle preflight for all routes
app.options('*', cors());

// Stripe Webhook MUST precede express.json() to maintain raw body signature requirements
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'VibeSec API - Operational', system: 'Surgical Security Grid' });
});

app.use('/api', scanRoutes);
app.use('/api', fixRoutes);
app.use('/api/stripe', stripeRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.error || err.message || 'Server Error', status });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend securely running on port ${PORT}`));
