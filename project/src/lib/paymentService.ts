import { Client, Environment } from 'square';
import { supabase } from './supabaseClient';

class PaymentService {
  private square: Client;

  constructor() {
    this.square = new Client({
      accessToken: import.meta.env.VITE_SQUARE_ACCESS_TOKEN,
      environment: import.meta.env.VITE_SQUARE_ENVIRONMENT === 'production' 
        ? Environment.Production 
        : Environment.Sandbox
    });
  }

  async createCheckoutSession(userId: string, planId: string): Promise<{ url: string | null; error: Error | null }> {
    try {
      const response = await this.square.checkoutApi.createPaymentLink({
        idempotencyKey: `${userId}-${planId}-${Date.now()}`,
        quickPay: {
          name: 'Premium Subscription',
          priceMoney: {
            amount: BigInt(999), // $9.99
            currency: 'USD'
          },
          locationId: import.meta.env.VITE_SQUARE_LOCATION_ID
        }
      });

      if (!response.result?.paymentLink?.url) {
        throw new Error('Failed to create payment link');
      }

      return { url: response.result.paymentLink.url, error: null };
    } catch (err) {
      console.error('Error creating checkout session:', err);
      return { url: null, error: err as Error };
    }
  }

  async handleWebhook(event: any): Promise<{ error: Error | null }> {
    try {
      const { type, data } = event;

      switch (type) {
        case 'payment.created':
          await this.handlePaymentCreated(data);
          break;
        case 'payment.updated':
          await this.handlePaymentUpdated(data);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(data);
          break;
        case 'subscription.created':
          await this.handleSubscriptionCreated(data);
          break;
        case 'subscription.updated':
          await this.handleSubscriptionUpdated(data);
          break;
        case 'subscription.cancelled':
          await this.handleSubscriptionCancelled(data);
          break;
      }

      return { error: null };
    } catch (err) {
      console.error('Error handling webhook:', err);
      return { error: err as Error };
    }
  }

  async getPaymentHistory(userId: string): Promise<{ history: any[]; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { history: data || [], error: null };
    } catch (err) {
      console.error('Error getting payment history:', err);
      return { history: [], error: err as Error };
    }
  }

  async getCurrentSubscription(userId: string): Promise<{ subscription: any | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return { subscription: data || null, error: null };
    } catch (err) {
      console.error('Error getting current subscription:', err);
      return { subscription: null, error: err as Error };
    }
  }

  async cancelSubscription(userId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Error canceling subscription:', err);
      return { error: err as Error };
    }
  }

  private async handlePaymentCreated(data: any): Promise<void> {
    const { id, amount, status, customer_id } = data;
    await supabase.from('payments').insert({
      payment_id: id,
      user_id: customer_id,
      amount,
      status,
      created_at: new Date().toISOString()
    });
  }

  private async handlePaymentUpdated(data: any): Promise<void> {
    const { id, status } = data;
    await supabase
      .from('payments')
      .update({ status })
      .eq('payment_id', id);
  }

  private async handlePaymentFailed(data: any): Promise<void> {
    const { id, customer_id } = data;
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('payment_id', id)
      .eq('user_id', customer_id);
  }

  private async handleSubscriptionCreated(data: any): Promise<void> {
    const { id, customer_id, plan_id } = data;
    await supabase.from('subscriptions').insert({
      subscription_id: id,
      user_id: customer_id,
      plan_id,
      status: 'active',
      created_at: new Date().toISOString()
    });
  }

  private async handleSubscriptionUpdated(data: any): Promise<void> {
    const { id, status } = data;
    await supabase
      .from('subscriptions')
      .update({ status })
      .eq('subscription_id', id);
  }

  private async handleSubscriptionCancelled(data: any): Promise<void> {
    const { id } = data;
    await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('subscription_id', id);
  }
}

export const paymentService = new PaymentService(); 