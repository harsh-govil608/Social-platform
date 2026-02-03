import nodemailer from 'nodemailer';

/**
 * Email service using Nodemailer
 */

// Create transporter
const createTransporter = () => {
  // For development, use console logging or Ethereal (test email service)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
    console.log('⚠️  Email service not configured. Emails will be logged to console.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

const transporter = createTransporter();

/**
 * Send email
 * @param {Object} options - Email options
 */
export const sendEmail = async (options) => {
  try {
    const { to, subject, html, text } = options;

    if (!transporter) {
      console.log('📧 Email (development):', { to, subject });
      console.log(text || html);
      return { success: true, messageId: 'dev-' + Date.now() };
    }

    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || 'Social Platform'} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
export const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Social Learning Platform!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Welcome, ${user.fullName}! 🎉</h1>
      <p>Thank you for joining our learning community.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Find language exchange partners</li>
        <li>Join live conversations</li>
        <li>Track your progress with our AI tutor</li>
      </ul>
      <a href="${process.env.FRONTEND_URL}/onboarding"
         style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Get Started
      </a>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you have any questions, feel free to reply to this email.
      </p>
    </div>
  `;
  const text = `Welcome, ${user.fullName}! Thank you for joining our learning community.`;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} name - User's full name
 * @param {string} resetUrl - Complete reset URL with token
 */
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  const subject = 'Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Password Reset</h1>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <a href="${resetUrl}"
         style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #666;">This link will expire in 1 hour.</p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you didn't request this, please ignore this email. Your password won't change until you create a new one.
      </p>
    </div>
  `;
  const text = `Hi ${name}, reset your password using this link: ${resetUrl}. This link expires in 1 hour.`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

/**
 * Send subscription confirmation email
 */
export const sendSubscriptionConfirmationEmail = async (user, subscription) => {
  const subject = `Subscription Confirmed - ${subscription.planType.toUpperCase()} Plan`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Subscription Confirmed! 🎉</h1>
      <p>Hi ${user.fullName},</p>
      <p>Your ${subscription.planType.toUpperCase()} subscription is now active!</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Plan:</strong> ${subscription.planType.toUpperCase()}</p>
        <p><strong>Amount:</strong> $${(subscription.amount / 100).toFixed(2)}</p>
        <p><strong>Next billing date:</strong> ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
      </div>
      <p>You now have access to all premium features!</p>
      <a href="${process.env.FRONTEND_URL}/profile"
         style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        View Dashboard
      </a>
    </div>
  `;
  const text = `Your ${subscription.planType} subscription is now active!`;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });
};

/**
 * Send friend request notification
 */
export const sendFriendRequestEmail = async (recipient, sender) => {
  const subject = `${sender.fullName} sent you a friend request`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">New Friend Request</h1>
      <p>Hi ${recipient.fullName},</p>
      <p><strong>${sender.fullName}</strong> wants to connect with you!</p>
      <a href="${process.env.FRONTEND_URL}/friends"
         style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        View Request
      </a>
    </div>
  `;
  const text = `${sender.fullName} sent you a friend request. Visit ${process.env.FRONTEND_URL}/friends to respond.`;

  return sendEmail({
    to: recipient.email,
    subject,
    html,
    text,
  });
};

/**
 * Send weekly digest email
 */
export const sendWeeklyDigestEmail = async (user, stats) => {
  const subject = 'Your Weekly Learning Summary 📊';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Your Weekly Summary</h1>
      <p>Hi ${user.fullName},</p>
      <p>Here's what you accomplished this week:</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p>📚 Lessons completed: ${stats.lessonsCompleted || 0}</p>
        <p>💬 Conversations practiced: ${stats.conversationsPracticed || 0}</p>
        <p>🏆 Achievements unlocked: ${stats.achievementsUnlocked || 0}</p>
        <p>⏱️ Total study time: ${stats.totalStudyTime || 0} minutes</p>
      </div>
      <p>Keep up the great work! 🎉</p>
      <a href="${process.env.FRONTEND_URL}"
         style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Continue Learning
      </a>
    </div>
  `;
  const text = `Your weekly summary: ${stats.lessonsCompleted} lessons completed, ${stats.conversationsPracticed} conversations practiced.`;

  return sendEmail({
    to: user.email,
    subject,
    html,
    text,
  });
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendSubscriptionConfirmationEmail,
  sendFriendRequestEmail,
  sendWeeklyDigestEmail,
};
