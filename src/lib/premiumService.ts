import { supabase } from './supabaseClient';
import { NewsArticle } from './newsService';
import { emailService } from './emailService';

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
        emailService.sendNewsletter(
          subscriber.email,
          issue.title,
          issue.content
        )
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
}

export const premiumService = new PremiumService(); 