import { supabase } from './supabaseClient';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_id: string;
  price_amount: number;
  price_currency: string;
  interval: 'month' | 'year';
  features: string[];
  is_active: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export class PaymentService {
  static async createCheckoutSession(userId: string, planId: string) {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Create a checkout session in your database
    const { data: session, error } = await supabase
      .from('checkout_sessions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return session;
  }

  static async handleWebhook(event: any) {
    const { type, data } = event;

    switch (type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(data.object);
        break;
    }
  }

  static async getPaymentHistory(userId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  }

  static async getSubscriptionPlans() {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_amount', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  static async getCurrentSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async cancelSubscription(userId: string) {
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (fetchError) {
      throw fetchError;
    }

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id);

    if (updateError) {
      throw updateError;
    }
  }

  private static async handleCheckoutCompleted(session: any) {
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: session.metadata.userId,
        plan_id: session.metadata.planId,
        stripe_subscription_id: session.subscription,
        stripe_customer_id: session.customer,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false
      });

    if (error) {
      throw error;
    }
  }

  private static async handleSubscriptionUpdated(subscription: any) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw error;
    }
  }

  private static async handleSubscriptionDeleted(subscription: any) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      throw error;
    }
  }
} 