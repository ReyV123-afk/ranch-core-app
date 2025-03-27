import { Request, Response } from 'express';
import { paymentService } from '../../lib/paymentService';

export const handleSquareWebhook = async (req: Request, res: Response) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-square-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Process the webhook event
    const event = req.body;
    await paymentService.handleWebhook(event);

    // Return success response
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Square webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 