interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { to, subject, text, html } = options;

  // Log the email details instead of sending
  console.log('Email would be sent:', {
    to,
    subject,
    text,
    html,
    timestamp: new Date().toISOString()
  });

  // Simulate a successful email send
  return Promise.resolve();
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetUrl = `${window.location.origin}/reset-password?token=${resetToken}`;
  
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Ranch Core!',
    html: `
      <h1>Welcome to Ranch Core, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board!</p>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    `
  });
}; 