import { Request, Response } from 'express';
import { Client, Environment } from 'square';
import { PaymentService } from '../../lib/paymentService';

const square = new Client({
  accessToken: process.env.VITE_SQUARE_ACCESS_TOKEN,
  environment: process.env.VITE_SQUARE_ENVIRONMENT as Environment,
});

export const handleSquareWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-square-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Process the webhook event
    const event = req.body;
    await PaymentService.handleWebhook(event);

    // Return success response
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Square webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 