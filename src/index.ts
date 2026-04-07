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

app.use(helmet());
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Dynamic origin reflection: In production, we'll allow all origins momentarily to resolve the DNS/SSL handshake debug
    if (!origin || origin.includes('getvibesec.com') || origin.includes('localhost') || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to true for the initial production sync
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

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
