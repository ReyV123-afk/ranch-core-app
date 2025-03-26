import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PaymentService } from '../../lib/paymentService';

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia'
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'No signature found' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      import.meta.env.VITE_STRIPE_WEBHOOK_SECRET
    );

    await PaymentService.handleWebhook(event);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(400).json({ error: 'Webhook error' });
  }
}; 