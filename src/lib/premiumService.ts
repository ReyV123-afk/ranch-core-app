import { supabase } from './supabaseClient';
import { NewsArticle } from './newsService';
import { sendEmail } from './emailService';

export interface Newsletter {
  id: string;
  title: string;
  description: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  keywords: string[];
  subscriberCount: number;
  isActive: boolean;
}

export interface NewsletterIssue {
  id: string;
  newsletterId: string;
  title: string;
  content: string;
  sentAt: string | null;
}

interface PremiumSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  end_date: string;
  payment_provider: 'square' | 'stripe';
  payment_id: string;
  created_at: string;
  updated_at: string;
}

interface PremiumPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  created_at: string;
  updated_at: string;
}

class PremiumService {
  async isPremiumUser(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_premium_user', {
        p_user_id: userId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  async createNewsletter(
    userId: string,
    title: string,
    description: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    categories: string[],
    keywords: string[]
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_newsletter', {
        p_user_id: userId,
        p_title: title,
        p_description: description,
        p_schedule: schedule,
        p_categories: categories,
        p_keywords: keywords
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating newsletter:', error);
      throw error;
    }
  }

  async getNewsletters(userId: string): Promise<Newsletter[]> {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(newsletter => ({
        id: newsletter.id,
        title: newsletter.title,
        description: newsletter.description,
        schedule: newsletter.schedule,
        categories: newsletter.categories,
        keywords: newsletter.keywords,
        subscriberCount: newsletter.subscriber_count,
        isActive: newsletter.is_active
      }));
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      return [];
    }
  }

  async addSubscriber(newsletterId: string, email: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          newsletter_id: newsletterId,
          email: email
        });

      if (error) throw error;

      // Update subscriber count
      await supabase.rpc('increment_subscriber_count', {
        p_newsletter_id: newsletterId
      });
    } catch (error) {
      console.error('Error adding subscriber:', error);
      throw error;
    }
  }

  async createNewsletterIssue(
    newsletterId: string,
    title: string,
    articles: NewsArticle[]
  ): Promise<string> {
    try {
      // Generate newsletter content
      const content = this.generateNewsletterContent(articles);

      const { data, error } = await supabase
        .from('newsletter_issues')
        .insert({
          newsletter_id: newsletterId,
          title: title,
          content: content
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating newsletter issue:', error);
      throw error;
    }
  }

  private generateNewsletterContent(articles: NewsArticle[]): string {
    return articles.map(article => `
      <h2>${article.title}</h2>
      <p>${article.description}</p>
      <p><a href="${article.url}">Read more</a></p>
      <hr>
    `).join('\n');
  }

  async sendNewsletterIssue(issueId: string): Promise<void> {
    try {
      // Get newsletter issue and subscribers
      const { data: issue, error: issueError } = await supabase
        .from('newsletter_issues')
        .select(`
          *,
          newsletters (
            id,
            title
          )
        `)
        .eq('id', issueId)
        .single();

      if (issueError) throw issueError;

      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('newsletter_id', issue.newsletters.id)
        .eq('is_active', true);

      if (subscribersError) throw subscribersError;

      // Send emails to subscribers
      const sendPromises = subscribers.map(subscriber =>
        sendEmail({
          to: subscriber.email,
          subject: issue.title,
          html: issue.content
        })
      );

      await Promise.all(sendPromises);

      // Update sent_at timestamp
      const { error: updateError } = await supabase
        .from('newsletter_issues')
        .update({ sent_at: new Date().toISOString() })
        .eq('id', issueId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error sending newsletter issue:', error);
      throw error;
    }
  }

  async createSubscription(userId: string, planId: string, paymentDetails: {
    provider: 'square' | 'stripe';
    paymentId: string;
  }): Promise<PremiumSubscription> {
    const { data: plan, error: planError } = await supabase
      .from('premium_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (planError || !plan) {
      throw new Error('Plan not found');
    }

    const startDate = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (plan.interval === 'yearly' ? 12 : 1));

    const { data: subscription, error: subscriptionError } = await supabase
      .from('premium_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        start_date: startDate,
        end_date: endDate.toISOString(),
        payment_provider: paymentDetails.provider,
        payment_id: paymentDetails.paymentId
      })
      .select()
      .single();

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Send welcome email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (!userError && user) {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Premium!',
        html: `
          <h1>Welcome to Premium, ${user.full_name}!</h1>
          <p>Thank you for upgrading to our premium plan. You now have access to all premium features.</p>
          <p>Your subscription details:</p>
          <ul>
            <li>Plan: ${plan.name}</li>
            <li>Interval: ${plan.interval}</li>
            <li>Start Date: ${new Date(startDate).toLocaleDateString()}</li>
            <li>End Date: ${new Date(endDate.toISOString()).toLocaleDateString()}</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
        `
      });
    }

    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('premium_subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (error) {
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<PremiumSubscription | null> {
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getUserSubscription(userId: string): Promise<PremiumSubscription | null> {
    const { data, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getPlans(): Promise<PremiumPlan[]> {
    const { data, error } = await supabase
      .from('premium_plans')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  async getPlan(planId: string): Promise<PremiumPlan | null> {
    const { data, error } = await supabase
      .from('premium_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

export const premiumService = new PremiumService(); 