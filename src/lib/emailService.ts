import { createClient } from '@supabase/supabase-js';
import { NewsArticle } from './newsService';
import sgMail from '@sendgrid/mail';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_SENDGRID_API_KEY: string;
    readonly VITE_SENDGRID_FROM_EMAIL: string;
    readonly VITE_APP_URL: string;
  }
}

class EmailService {
  private supabase;
  private sendgridApiKey: string | null;
  private isDevelopment: boolean;

  constructor() {
    this.supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
    this.sendgridApiKey = import.meta.env.VITE_SENDGRID_API_KEY || null;
    this.isDevelopment = import.meta.env.DEV;
    
    if (this.sendgridApiKey) {
      sgMail.setApiKey(this.sendgridApiKey);
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (this.sendgridApiKey) {
      try {
        await sgMail.send({
          to,
          from: import.meta.env.VITE_SENDGRID_FROM_EMAIL,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      } catch (error) {
        console.error('Error sending email:', error);
        throw error;
      }
    } else {
      // Mock implementation for development
      console.log('Mock Email Sent:');
      console.log('To:', to);
      console.log('Subject:', template.subject);
      console.log('Text:', template.text);
      console.log('HTML:', template.html);
      console.log('-------------------');
    }
  }

  async sendNewsletter(to: string, newsletterTitle: string, content: string): Promise<void> {
    const template: EmailTemplate = {
      subject: newsletterTitle,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${newsletterTitle}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 {
                color: #e53e3e;
                margin-bottom: 20px;
              }
              .article {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid #eee;
              }
              .article:last-child {
                border-bottom: none;
              }
              .article h2 {
                color: #2d3748;
                margin-bottom: 10px;
              }
              .article p {
                margin-bottom: 15px;
              }
              .article a {
                color: #e53e3e;
                text-decoration: none;
              }
              .article a:hover {
                text-decoration: underline;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>${newsletterTitle}</h1>
            ${content}
            <div class="footer">
              <p>You received this email because you subscribed to our newsletter.</p>
              <p>To unsubscribe, click <a href="${import.meta.env.VITE_APP_URL}/unsubscribe?email=${encodeURIComponent(to)}">here</a>.</p>
            </div>
          </body>
        </html>
      `,
      text: content.replace(/<[^>]*>/g, '') // Strip HTML for plain text version
    };

    await this.sendEmail(to, template);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const template: EmailTemplate = {
      subject: 'Welcome to NewsApp!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to NewsApp</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 {
                color: #e53e3e;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #e53e3e;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>Welcome to NewsApp, ${name}!</h1>
            <p>Thank you for joining NewsApp. We're excited to help you stay informed with personalized news and updates.</p>
            <p>Here's what you can do with NewsApp:</p>
            <ul>
              <li>Customize your news preferences</li>
              <li>Get personalized article recommendations</li>
              <li>Track trending topics</li>
              <li>Create and manage newsletters (Premium feature)</li>
            </ul>
            <a href="${import.meta.env.VITE_APP_URL}/profile" class="button">Set Up Your Profile</a>
            <div class="footer">
              <p>If you have any questions, feel free to contact our support team.</p>
            </div>
          </body>
        </html>
      `,
      text: `Welcome to NewsApp, ${name}!\n\nThank you for joining NewsApp. We're excited to help you stay informed with personalized news and updates.\n\nHere's what you can do with NewsApp:\n- Customize your news preferences\n- Get personalized article recommendations\n- Track trending topics\n- Create and manage newsletters (Premium feature)\n\nVisit ${import.meta.env.VITE_APP_URL}/profile to set up your profile.\n\nIf you have any questions, feel free to contact our support team.`
    };

    await this.sendEmail(to, template);
  }

  async sendSubscriptionConfirmation(to: string, planType: string): Promise<void> {
    const template: EmailTemplate = {
      subject: 'Premium Subscription Confirmed',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Premium Subscription Confirmed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 {
                color: #e53e3e;
                margin-bottom: 20px;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #e53e3e;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <h1>Premium Subscription Confirmed</h1>
            <p>Thank you for upgrading to our ${planType} premium plan!</p>
            <p>You now have access to all premium features:</p>
            <ul>
              <li>Create and manage newsletters</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
            </ul>
            <a href="${import.meta.env.VITE_APP_URL}/profile" class="button">Access Premium Features</a>
            <div class="footer">
              <p>If you have any questions about your subscription, please contact our support team.</p>
            </div>
          </body>
        </html>
      `,
      text: `Premium Subscription Confirmed\n\nThank you for upgrading to our ${planType} premium plan!\n\nYou now have access to all premium features:\n- Create and manage newsletters\n- Advanced analytics\n- Priority support\n\nVisit ${import.meta.env.VITE_APP_URL}/profile to access your premium features.\n\nIf you have any questions about your subscription, please contact our support team.`
    };

    await this.sendEmail(to, template);
  }

  async scheduleNewsletter(userId: string, articles: NewsArticle[], schedule: 'daily' | 'weekly'): Promise<void> {
    const newsletterContent = articles.map(article => `
      <div class="article">
        <h2>${article.title}</h2>
        <p>${article.description}</p>
        <a href="${article.url}">Read more</a>
      </div>
    `).join('');

    const { error } = await this.supabase
      .from('newsletter_schedules')
      .upsert({
        user_id: userId,
        schedule,
        content: newsletterContent,
        last_sent: new Date().toISOString()
      });

    if (error) {
      console.error('Error scheduling newsletter:', error);
      throw error;
    }
  }
}

export const emailService = new EmailService(); 