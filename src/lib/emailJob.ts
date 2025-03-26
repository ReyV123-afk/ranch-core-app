import { supabase } from './supabaseClient';
import { emailService } from './emailService';
import { newsService } from './newsService';

interface EmailJob {
  id: string;
  user_id: string;
  email_frequency: 'daily' | 'weekly' | 'monthly';
  categories: string[];
  keywords: string[];
  last_sent_at: string | null;
}

class EmailJobService {
  async processEmailJobs(): Promise<void> {
    try {
      // Get all active email settings
      const { data: settings, error: settingsError } = await supabase
        .from('email_settings')
        .select('*')
        .eq('is_active', true);

      if (settingsError) throw settingsError;

      for (const setting of settings) {
        const shouldSend = this.shouldSendEmail(setting);
        if (shouldSend) {
          await this.sendEmailDigest(setting);
        }
      }
    } catch (error) {
      console.error('Error processing email jobs:', error);
    }
  }

  private shouldSendEmail(setting: EmailJob): boolean {
    if (!setting.last_sent_at) return true;

    const lastSent = new Date(setting.last_sent_at);
    const now = new Date();

    switch (setting.email_frequency) {
      case 'daily':
        return now.getDate() !== lastSent.getDate() || 
               now.getMonth() !== lastSent.getMonth() || 
               now.getFullYear() !== lastSent.getFullYear();
      case 'weekly':
        const weekDiff = Math.floor((now.getTime() - lastSent.getTime()) / (7 * 24 * 60 * 60 * 1000));
        return weekDiff >= 1;
      case 'monthly':
        return now.getMonth() !== lastSent.getMonth() || 
               now.getFullYear() !== lastSent.getFullYear();
      default:
        return false;
    }
  }

  private async sendEmailDigest(setting: EmailJob): Promise<void> {
    try {
      // Get articles based on user's preferences
      const articles = await newsService.searchNews(
        setting.keywords.join(' OR '),
        {
          category: setting.categories[0] || 'all',
          date: 'week',
          source: 'all',
          sortBy: 'relevance'
        },
        1,
        10
      );

      if (articles.length === 0) return;

      // Generate email content
      const content = this.generateEmailContent(articles);

      // Get user's email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', setting.user_id)
        .single();

      if (userError || !user?.email) {
        throw new Error('User email not found');
      }

      // Send email
      await emailService.sendNewsletter(
        user.email,
        `Your ${setting.email_frequency} News Digest`,
        content
      );

      // Log email delivery
      await supabase.rpc('log_email_delivery', {
        p_user_id: setting.user_id,
        p_email_type: 'newsletter',
        p_subject: `Your ${setting.email_frequency} News Digest`,
        p_status: 'sent'
      });

      // Update last sent timestamp
      await supabase
        .from('email_settings')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', setting.id);

    } catch (error) {
      console.error('Error sending email digest:', error);
      
      // Log failed delivery
      await supabase.rpc('log_email_delivery', {
        p_user_id: setting.user_id,
        p_email_type: 'newsletter',
        p_subject: `Your ${setting.email_frequency} News Digest`,
        p_status: 'failed',
        p_error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private generateEmailContent(articles: any[]): string {
    return articles.map(article => `
      <div class="article">
        <h2>${article.title}</h2>
        <p>${article.description}</p>
        <p><a href="${article.url}">Read more</a></p>
      </div>
    `).join('\n');
  }
}

export const emailJobService = new EmailJobService(); 