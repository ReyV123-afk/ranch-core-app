import { NewsArticle } from './newsService';
import { sendEmail } from './emailService';

interface EmailJob {
  id: string;
  type: 'news' | 'welcome' | 'password-reset';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  data: {
    to: string;
    subject: string;
    template: string;
    params?: Record<string, any>;
  };
  createdAt: Date;
  updatedAt: Date;
}

class EmailJobService {
  private jobs: EmailJob[] = [];

  async createJob(job: Omit<EmailJob, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<EmailJob> {
    const newJob: EmailJob = {
      ...job,
      id: Math.random().toString(36).substring(7),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.jobs.push(newJob);
    return newJob;
  }

  async processJob(jobId: string): Promise<void> {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found');
    }

    try {
      job.status = 'processing';
      job.updatedAt = new Date();

      switch (job.type) {
        case 'news':
          await this.processNewsEmail(job);
          break;
        case 'welcome':
          await this.processWelcomeEmail(job);
          break;
        case 'password-reset':
          await this.processPasswordResetEmail(job);
          break;
      }

      job.status = 'completed';
      job.updatedAt = new Date();
    } catch (error) {
      job.status = 'failed';
      job.updatedAt = new Date();
      throw error;
    }
  }

  private async processNewsEmail(job: EmailJob): Promise<void> {
    const { to, subject, template, params } = job.data;
    const { articles } = params as { articles: NewsArticle[] };

    const html = this.generateNewsEmailTemplate(articles);
    await sendEmail({ to, subject, html });
  }

  private async processWelcomeEmail(job: EmailJob): Promise<void> {
    const { to, subject, template, params } = job.data;
    const { name } = params as { name: string };

    const html = this.generateWelcomeEmailTemplate(name);
    await sendEmail({ to, subject, html });
  }

  private async processPasswordResetEmail(job: EmailJob): Promise<void> {
    const { to, subject, template, params } = job.data;
    const { resetToken } = params as { resetToken: string };

    const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
    const html = this.generatePasswordResetEmailTemplate(resetUrl);
    await sendEmail({ to, subject, html });
  }

  private generateNewsEmailTemplate(articles: NewsArticle[]): string {
    return `
      <h1>Latest News from Ranch Core</h1>
      <p>Here are the latest articles for you:</p>
      ${articles.map(article => `
        <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ddd;">
          <h2>${article.title}</h2>
          <p>${article.description}</p>
          <a href="${article.url}">Read more</a>
        </div>
      `).join('')}
    `;
  }

  private generateWelcomeEmailTemplate(name: string): string {
    return `
      <h1>Welcome to Ranch Core, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `;
  }

  private generatePasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `;
  }

  async getJob(jobId: string): Promise<EmailJob | undefined> {
    return this.jobs.find(j => j.id === jobId);
  }

  async getJobsByStatus(status: EmailJob['status']): Promise<EmailJob[]> {
    return this.jobs.filter(j => j.status === status);
  }

  async deleteJob(jobId: string): Promise<void> {
    const index = this.jobs.findIndex(j => j.id === jobId);
    if (index !== -1) {
      this.jobs.splice(index, 1);
    }
  }
}

export const emailJobService = new EmailJobService(); 