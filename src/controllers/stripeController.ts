import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../config/supabase';

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.preview' as any
});

export const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) throw new Error('Stripe Price ID not configured');

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      client_reference_id: userId,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=success`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?payment=cancel`,
      // @ts-ignore
      managed_payments: {
        enabled: true,
      }
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const webhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  try {
    // If webhookSecret is empty (local testing without forwarding), allow raw event
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
    } else {
      console.warn("⚠️ STRIPE_WEBHOOK_SECRET is missing. Bypassing validation (FOR LOCAL DEV ONLY).");
      event = JSON.parse(req.body.toString());
    }
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      const userId = session.client_reference_id;
      if (userId) {
        console.log(`[Stripe Webhook] Upgrading user ${userId} to Paid tier...`);
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: { plan: 'paid' }
        });
        
        if (error) throw error;
        console.log(`[Stripe Webhook] Successfully upgraded user ${userId}`);
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing failed:', err);
    res.status(500).send('Webhook Processing Error');
  }
};
