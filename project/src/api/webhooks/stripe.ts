import { Request, Response } from 'express';
import { paymentService } from '../../lib/paymentService';

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'No signature found' });
  }

  try {
    const { error } = await paymentService.handleWebhook(req.body);
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
} 