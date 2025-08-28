import { ServerClient } from 'postmark';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { storage } from '../../storage';
import { renderWelcomeEmail } from './templates/welcome';
import { renderPasswordResetEmail } from './templates/password-reset';
import { renderBookingConfirmationEmail } from './templates/booking-confirmation';
import { renderMessageNotificationEmail } from './templates/message-notification';
import { renderBookingUpdateEmail } from './templates/booking-update';
import { v4 as uuidv4 } from 'uuid';
import { randomBytes } from 'crypto';

// Initialize Redis connection with BullMQ requirements (optional)
let redis: Redis | null = null;
let emailQueue: Queue | null = null;

try {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableOfflineQueue: false,
    lazyConnect: true,
  });
  
  // Try to connect
  redis.connect().then(() => {
    console.log('Redis connected for email queue');
  }).catch((err) => {
    console.warn('Redis connection failed, email queue disabled:', err.message);
    redis = null;
  });

  // Initialize email queue only if Redis is available
  if (redis) {
    emailQueue = new Queue('emails', {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });
  }
} catch (error) {
  console.warn('Failed to initialize Redis/Queue, emails will be sent synchronously:', error);
}

// Initialize Postmark client
const postmarkClient = new ServerClient(process.env.POSTMARK_API_KEY || 'POSTMARK_API_TEST');

// Export queue (might be null)
export { emailQueue };

// Email job types
export interface EmailJob {
  type: 'welcome' | 'password-reset' | 'booking-confirmation' | 'booking-update' | 'message-notification' | 'marketing' | 'email-verification';
  payload: any;
  userId?: number;
  priority?: number;
}

class EmailService {
  private fromEmail: string;
  private replyToEmail: string;
  private baseUrl: string;
  private emailEnabled: boolean;
  private previewMode: boolean;

  constructor() {
    // Fix: Use the actual email address instead of the UUID from env variable
    this.fromEmail = 'hello@blocmark.com'; // Fixed: Was getting UUID from env variable
    this.replyToEmail = process.env.POSTMARK_REPLY_TO || 'support@blocmark.com';
    this.baseUrl = process.env.BASE_URL || 'https://blocmark.com';
    this.emailEnabled = process.env.EMAIL_ENABLED !== 'false';
    this.previewMode = process.env.EMAIL_PREVIEW_MODE === 'true';
    
    // Log configuration for debugging
    console.log('Email Service Configuration:');
    console.log('- From Email:', this.fromEmail);
    console.log('- Email Enabled:', this.emailEnabled);
    console.log('- Preview Mode:', this.previewMode);
    console.log('- Postmark API Key:', process.env.POSTMARK_API_KEY ? 'SET (hidden)' : 'NOT SET - using test key');
    
    // Note: POSTMARK_FROM_EMAIL env contains UUID, using hardcoded email instead
  }

  // Generate a unique message ID for tracking
  private generateMessageId(): string {
    return `${uuidv4()}@blocmark.com`;
  }

  // Generate a secure token
  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Send email via Postmark
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    messageId: string;
    tag?: string;
    metadata?: any;
  }): Promise<void> {
    console.log('\n=== Attempting to send email ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Tag:', options.tag);
    
    if (!this.emailEnabled) {
      console.log('❌ Email sending is disabled (EMAIL_ENABLED=false)');
      return;
    }

    if (this.previewMode) {
      console.log('👁️ Email Preview Mode - Email would be sent:');
      console.log('To:', options.to);
      console.log('Subject:', options.subject);
      console.log('MessageID:', options.messageId);
      console.log('HTML Preview:', options.html.substring(0, 200) + '...');
      return;
    }

    console.log('📧 Sending email via Postmark...');
    console.log('From:', this.fromEmail);
    
    try {
      const response = await postmarkClient.sendEmail({
        From: this.fromEmail,
        To: options.to,
        Subject: options.subject,
        HtmlBody: options.html,
        TextBody: options.text || this.stripHtml(options.html),
        MessageStream: 'outbound',
        Tag: options.tag,
        Metadata: options.metadata,
        Headers: [
          {
            Name: 'X-Message-ID',
            Value: options.messageId,
          },
        ],
      });

      console.log('✅ Email sent successfully!');
      console.log('Postmark MessageID:', response.MessageID);
      console.log('Postmark Response:', JSON.stringify(response, null, 2));
    } catch (error: any) {
      console.error('❌ Failed to send email via Postmark!');
      console.error('Error details:', error.message || error);
      if (error.ErrorCode) {
        console.error('Postmark Error Code:', error.ErrorCode);
      }
      if (error.Message) {
        console.error('Postmark Error Message:', error.Message);
      }
      
      // Provide clearer error messages for common issues
      if (error.message && error.message.includes('inactive')) {
        throw new Error(`Email address is suppressed: ${options.to} is on the suppression list. This happens when an email address bounces, marks emails as spam, or is manually suppressed. Please use a different, valid email address.`);
      }
      
      throw error;
    }
  }

  // Strip HTML tags for text version
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
  }

  // Check if email is suppressed
  private async checkSuppression(email: string): Promise<boolean> {
    return await storage.isEmailSuppressed(email);
  }

  // Send welcome email
  async sendWelcomeEmail(userId: number, options?: { requireVerification?: boolean }): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user || !user.email) {
      console.error('User not found or email missing:', userId);
      return;
    }

    // Check suppression list
    if (await this.checkSuppression(user.email)) {
      console.log('Email suppressed:', user.email);
      return;
    }

    const messageId = this.generateMessageId();
    let verificationToken: string | undefined;
    let verificationUrl: string | undefined;

    if (options?.requireVerification) {
      // Create verification token
      verificationToken = this.generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await storage.createEmailVerificationToken({
        userId,
        email: user.email,
        token: verificationToken,
        expiresAt,
      });

      verificationUrl = `${this.baseUrl}/verify-email?token=${verificationToken}`;
    }

    // Render email template
    const { html, subject } = await renderWelcomeEmail({
      name: user.username,
      verificationUrl,
    });

    // Track email event
    await storage.createEmailEvent({
      messageId,
      userId,
      recipientEmail: user.email,
      templateName: 'welcome',
      subject,
      status: 'queued',
    });

    // Send email
    await this.sendEmail({
      to: user.email,
      subject,
      html,
      messageId,
      tag: 'welcome',
      metadata: { userId: userId.toString() },
    });

    // Update email event status
    await storage.updateEmailEvent(messageId, { status: 'sent', sentAt: new Date() });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<void> {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      console.log('Password reset requested for non-existent email:', email);
      return;
    }

    // Check suppression list
    if (await this.checkSuppression(email)) {
      console.log('Email suppressed:', email);
      return;
    }

    const messageId = this.generateMessageId();
    const resetToken = this.generateToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create reset token
    await storage.createPasswordResetToken({
      userId: user.id,
      email,
      token: resetToken,
      expiresAt,
    });

    const resetUrl = `${this.baseUrl}/reset-password?token=${resetToken}`;

    // Render email template
    const { html, subject } = await renderPasswordResetEmail({
      name: user.username,
      resetUrl,
      expiryTime: '1 hour',
    });

    // Track email event
    await storage.createEmailEvent({
      messageId,
      userId: user.id,
      recipientEmail: email,
      templateName: 'password-reset',
      subject,
      status: 'queued',
    });

    // Send email
    await this.sendEmail({
      to: email,
      subject,
      html,
      messageId,
      tag: 'password-reset',
      metadata: { userId: user.id.toString() },
    });

    // Update email event status
    await storage.updateEmailEvent(messageId, { status: 'sent', sentAt: new Date() });
  }

  // Send booking confirmation email
  async sendBookingConfirmation(bookingId: number): Promise<void> {
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    const client = await storage.getUser(booking.clientId);
    const location = await storage.getLocation(booking.locationId);
    const host = location ? await storage.getUser(location.ownerId) : null;

    if (!client || !client.email || !location || !host || !host.email) {
      console.error('Missing data for booking confirmation email');
      return;
    }

    // Check user preferences
    const clientPrefs = await storage.getUserEmailPreferences(client.id);
    if (clientPrefs?.transactional?.bookingConfirmation === false) {
      console.log('User has disabled booking confirmation emails');
      return;
    }

    const hostPrefs = await storage.getUserEmailPreferences(host.id);

    // Send to guest
    if (!await this.checkSuppression(client.email)) {
      const messageId = this.generateMessageId();
      const bookingUrl = `${this.baseUrl}/dashboard/bookings/${bookingId}`;

      const { html, subject } = await renderBookingConfirmationEmail({
        recipientType: 'guest',
        guestName: client.username,
        hostName: host.username,
        locationName: location.title,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: booking.totalPrice,
        bookingUrl,
        status: booking.status,
      });

      await storage.createEmailEvent({
        messageId,
        userId: client.id,
        recipientEmail: client.email,
        templateName: 'booking-confirmation-guest',
        subject,
        status: 'queued',
        metadata: { bookingId },
      });

      await this.sendEmail({
        to: client.email,
        subject,
        html,
        messageId,
        tag: 'booking-confirmation',
        metadata: { bookingId: bookingId.toString(), recipientType: 'guest' },
      });

      await storage.updateEmailEvent(messageId, { status: 'sent', sentAt: new Date() });
    }

    // Send to host
    if (!await this.checkSuppression(host.email) && hostPrefs?.transactional?.bookingConfirmation !== false) {
      const messageId = this.generateMessageId();
      const approvalUrl = `${this.baseUrl}/dashboard/bookings/${bookingId}`;

      const { html, subject } = await renderBookingConfirmationEmail({
        recipientType: 'host',
        guestName: client.username,
        hostName: host.username,
        locationName: location.title,
        startDate: booking.startDate.toISOString(),
        endDate: booking.endDate.toISOString(),
        totalPrice: booking.totalPrice,
        bookingUrl: approvalUrl,
        status: booking.status,
      });

      await storage.createEmailEvent({
        messageId,
        userId: host.id,
        recipientEmail: host.email,
        templateName: 'booking-confirmation-host',
        subject,
        status: 'queued',
        metadata: { bookingId },
      });

      await this.sendEmail({
        to: host.email,
        subject,
        html,
        messageId,
        tag: 'booking-confirmation',
        metadata: { bookingId: bookingId.toString(), recipientType: 'host' },
      });

      await storage.updateEmailEvent(messageId, { status: 'sent', sentAt: new Date() });
    }
  }

  // Send booking update email
  async sendBookingUpdate(bookingId: number, updateType: 'approved' | 'rejected' | 'cancelled' | 'modified'): Promise<void> {
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      console.error('Booking not found:', bookingId);
      return;
    }

    const client = await storage.getUser(booking.clientId);
    const location = await storage.getLocation(booking.locationId);

    if (!client || !client.email || !location) {
      console.error('Missing data for booking update email');
      return;
    }

    // Check user preferences
    const clientPrefs = await storage.getUserEmailPreferences(client.id);
    if (clientPrefs?.transactional?.bookingUpdate === false) {
      console.log('User has disabled booking update emails');
      return;
    }

    // Check suppression
    if (await this.checkSuppression(client.email)) {
      console.log('Email suppressed:', client.email);
      return;
    }

    const messageId = this.generateMessageId();
    const bookingUrl = `${this.baseUrl}/dashboard/bookings/${bookingId}`;

    const { html, subject } = await renderBookingUpdateEmail({
      name: client.username,
      locationName: location.title,
      updateType,
      bookingUrl,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
    });

    await storage.createEmailEvent({
      messageId,
      userId: client.id,
      recipientEmail: client.email,
      templateName: `booking-${updateType}`,
      subject,
      status: 'queued',
      metadata: { bookingId, updateType },
    });

    await this.sendEmail({
      to: client.email,
      subject,
      html,
      messageId,
      tag: `booking-${updateType}`,
      metadata: { bookingId: bookingId.toString(), updateType },
    });

    await storage.updateEmailEvent(messageId, { status: 'sent', sentAt: new Date() });
  }

  // Send message notification email
  async sendMessageNotification(messageId: number): Promise<void> {
    const message = await storage.getMessage(messageId);
    if (!message) {
      console.error('Message not found:', messageId);
      return;
    }

    const sender = await storage.getUser(message.senderId);
    const receiver = await storage.getUser(message.receiverId);
    const location = await storage.getLocation(message.locationId);

    if (!sender || !receiver || !receiver.email || !location) {
      console.error('Missing data for message notification email');
      return;
    }

    // Check user preferences
    const receiverPrefs = await storage.getUserEmailPreferences(receiver.id);
    if (receiverPrefs?.transactional?.messageReceived === false) {
      console.log('User has disabled message notification emails');
      return;
    }

    // Check suppression
    if (await this.checkSuppression(receiver.email)) {
      console.log('Email suppressed:', receiver.email);
      return;
    }

    const emailMessageId = this.generateMessageId();
    const messageUrl = `${this.baseUrl}/dashboard/messages?location=${location.id}`;

    const { html, subject } = await renderMessageNotificationEmail({
      recipientName: receiver.username,
      senderName: sender.username,
      locationName: location.title,
      messagePreview: message.content.substring(0, 100),
      messageUrl,
    });

    await storage.createEmailEvent({
      messageId: emailMessageId,
      userId: receiver.id,
      recipientEmail: receiver.email,
      templateName: 'message-notification',
      subject,
      status: 'queued',
      metadata: { messageId },
    });

    await this.sendEmail({
      to: receiver.email,
      subject,
      html,
      messageId: emailMessageId,
      tag: 'message-notification',
      metadata: { messageId: messageId.toString() },
    });

    await storage.updateEmailEvent(emailMessageId, { status: 'sent', sentAt: new Date() });
  }

  // Send test email without database dependencies
  async sendTestEmail(type: string, recipientEmail: string): Promise<void> {
    const messageId = this.generateMessageId();
    let subject = '';
    let html = '';
    
    // Create test email content based on type
    switch (type) {
      case 'welcome':
        subject = 'Welcome to Blocmark - Test Email';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to Blocmark!</h1>
            <p>This is a test welcome email to verify your email configuration is working correctly.</p>
            <p>If you received this email, your Postmark integration is functioning properly.</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is a test email sent from the Blocmark admin panel.</p>
          </div>
        `;
        break;
      case 'password-reset':
        subject = 'Password Reset Request - Test Email';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Password Reset Request</h1>
            <p>This is a test password reset email.</p>
            <p>In a real password reset email, there would be a reset link here.</p>
            <p style="margin: 20px 0;">
              <a href="#" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password (Test)</a>
            </p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is a test email sent from the Blocmark admin panel.</p>
          </div>
        `;
        break;
      case 'booking-confirmation':
        subject = 'Booking Confirmation - Test Email';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Booking Confirmed!</h1>
            <p>This is a test booking confirmation email.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Test Booking Details:</h3>
              <p>Location: Test Location</p>
              <p>Check-in: Today</p>
              <p>Check-out: Tomorrow</p>
              <p>Total: $100.00</p>
            </div>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is a test email sent from the Blocmark admin panel.</p>
          </div>
        `;
        break;
      case 'booking-update':
        subject = 'Booking Update - Test Email';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Booking Updated</h1>
            <p>This is a test booking update email.</p>
            <p>Your booking has been approved (test).</p>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is a test email sent from the Blocmark admin panel.</p>
          </div>
        `;
        break;
      case 'message-notification':
        subject = 'New Message - Test Email';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">You have a new message!</h1>
            <p>This is a test message notification email.</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>From:</strong> Test User</p>
              <p><strong>Message:</strong> This is a test message to verify email notifications are working.</p>
            </div>
            <hr style="border: 1px solid #eee; margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is a test email sent from the Blocmark admin panel.</p>
          </div>
        `;
        break;
      default:
        throw new Error(`Unknown test email type: ${type}`);
    }
    
    console.log('\n🧪 Sending test email:');
    console.log('Type:', type);
    console.log('Recipient:', recipientEmail);
    
    // Send the test email
    await this.sendEmail({
      to: recipientEmail,
      subject,
      html,
      messageId,
      tag: `test-${type}`,
      metadata: { testEmail: true, type },
    });
    
    console.log('Test email process completed');
    
    console.log(`Test email sent successfully to ${recipientEmail}`);
  }

  // Process webhook from Postmark
  async processWebhook(eventType: string, payload: any): Promise<void> {
    const messageId = payload.MessageID || payload.Headers?.['X-Message-ID'];
    if (!messageId) {
      console.error('No message ID in webhook payload');
      return;
    }

    const statusMap: { [key: string]: string } = {
      'Delivery': 'delivered',
      'Open': 'opened',
      'Click': 'clicked',
      'Bounce': 'bounced',
      'SpamComplaint': 'complained',
    };

    const status = statusMap[eventType];
    if (!status) {
      console.log('Unknown webhook event type:', eventType);
      return;
    }

    // Update email event
    const updateData: any = {
      status,
      metadata: payload,
    };

    if (status === 'delivered') updateData.deliveredAt = new Date(payload.ReceivedAt);
    if (status === 'opened') updateData.openedAt = new Date(payload.ReceivedAt);
    if (status === 'clicked') updateData.clickedAt = new Date(payload.ReceivedAt);
    if (status === 'bounced') updateData.bouncedAt = new Date(payload.ReceivedAt);

    await storage.updateEmailEvent(messageId, updateData);

    // Handle bounces and complaints
    if (status === 'bounced' || status === 'complained') {
      await storage.addToSuppressionList({
        email: payload.Email,
        reason: status === 'bounced' ? 'bounce' : 'complaint',
        metadata: payload,
      });
    }
  }

  // Add to suppression list
  async addToSuppressionList(email: string, reason: 'bounce' | 'complaint' | 'unsubscribe' | 'manual'): Promise<void> {
    await storage.addToSuppressionList({
      email,
      reason,
    });
  }
}

// Create email worker to process queue (only if Redis is available)
let emailWorker: Worker | null = null;

if (redis) {
  emailWorker = new Worker('emails', async (job: Job<EmailJob>) => {
    const emailService = new EmailService();
    
    console.log(`Processing email job: ${job.data.type}`);
    
    try {
      switch (job.data.type) {
        case 'welcome':
          await emailService.sendWelcomeEmail(job.data.payload.userId, job.data.payload);
          break;
        case 'password-reset':
          await emailService.sendPasswordResetEmail(job.data.payload.email);
          break;
        case 'booking-confirmation':
          await emailService.sendBookingConfirmation(job.data.payload.bookingId);
          break;
        case 'booking-update':
          await emailService.sendBookingUpdate(job.data.payload.bookingId, job.data.payload.updateType);
          break;
        case 'message-notification':
          await emailService.sendMessageNotification(job.data.payload.messageId);
          break;
        default:
          console.error('Unknown email job type:', job.data.type);
      }
    } catch (error) {
      console.error('Failed to process email job:', error);
      throw error;
    }
  }, {
    connection: redis,
    concurrency: 5,
  });

  // Handle worker events
  emailWorker.on('completed', (job) => {
    console.log(`Email job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err);
  });
}

export const emailService = new EmailService();