import { supabase } from './supabaseClient';
import { Client, Environment } from 'square';

const square = new Client({
  accessToken: import.meta.env.VITE_SQUARE_ACCESS_TOKEN,
  environment: import.meta.env.VITE_SQUARE_ENVIRONMENT as Environment,
});

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
    // Implementation
    return '';
  }

  static async handleWebhook(event: any) {
    // Implementation
  }

  static async getPaymentHistory(userId: string) {
    // Implementation
    return [];
  }

  static async getSubscriptionPlans() {
    // Implementation
    return [];
  }

  static async getCurrentSubscription(userId: string) {
    // Implementation
    return null;
  }

  static async cancelSubscription(userId: string) {
    // Implementation
  }
} 