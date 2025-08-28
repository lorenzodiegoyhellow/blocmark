import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../auth';
import { storage } from '../storage';
import { emailService, emailQueue } from '../services/email/email.service';
import { z } from 'zod';
import { insertEmailTemplateSchema, insertEmailCampaignSchema, insertUserEmailPreferencesSchema } from '@shared/schema';

const router = Router();

// Template management endpoints
router.get('/templates', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const templates = await storage.getEmailTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Failed to get email templates:', error);
    res.status(500).json({ error: 'Failed to get email templates' });
  }
});

router.get('/templates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const template = await storage.getEmailTemplateById(parseInt(req.params.id));
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    console.error('Failed to get email template:', error);
    res.status(500).json({ error: 'Failed to get email template' });
  }
});

router.post('/templates', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const templateData = insertEmailTemplateSchema.parse(req.body);
    const template = await storage.createEmailTemplate(templateData);
    res.json(template);
  } catch (error) {
    console.error('Failed to create email template:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create email template' });
  }
});

router.put('/templates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    delete updateData.id; // Remove id from update data
    delete updateData.createdAt; // Remove createdAt from update data
    const template = await storage.updateEmailTemplate(id, updateData);
    res.json(template);
  } catch (error) {
    console.error('Failed to update email template:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update email template' });
  }
});

router.delete('/templates/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    await storage.deleteEmailTemplate(parseInt(req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// Test email endpoint (simplified for testing)
router.post('/test', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      type: z.enum(['welcome', 'password-reset', 'booking-confirmation', 'booking-update', 'message-notification']),
      userId: z.number().optional(),
      email: z.string().email().optional(),
      bookingId: z.number().optional(),
      messageId: z.number().optional(),
      updateType: z.enum(['approved', 'rejected', 'cancelled', 'modified']).optional(),
    });

    const data = schema.parse(req.body);

    // Check if user is authenticated and is admin
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required. Please log in as an admin.' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required to send test emails.' });
    }
    
    // Validate email is provided
    if (!data.email || !data.email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // For test emails, use the email provided or fall back to test@example.com
    const testEmail = data.email || 'test@example.com';
    
    console.log('Sending test email to:', testEmail, 'Type:', data.type);
    
    // Send test email directly without database dependencies
    await emailService.sendTestEmail(data.type, testEmail);
    res.json({ success: true, message: `Test email sent successfully to ${testEmail}` });
  } catch (error) {
    console.error('Failed to queue test email:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to send test email' });
  }
});

// Password reset request
router.post('/password-reset', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
    });

    const { email } = schema.parse(req.body);

    // Add to email queue if available, otherwise send directly
    if (emailQueue) {
      await emailQueue.add('password-reset', {
        type: 'password-reset',
        payload: { email },
        priority: 1,
      });
    } else {
      // Send directly without queue
      await emailService.sendPasswordResetEmail(email);
    }

    // Always return success to prevent email enumeration
    res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link.' });
  } catch (error) {
    console.error('Failed to process password reset:', error);
    res.status(400).json({ error: 'Invalid email address' });
  }
});

// Verify password reset token
router.post('/verify-reset-token', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      token: z.string(),
    });

    const { token } = schema.parse(req.body);

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.json({ success: true, userId: resetToken.userId });
  } catch (error) {
    console.error('Failed to verify reset token:', error);
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      token: z.string(),
      password: z.string().min(8),
    });

    const { token, password } = schema.parse(req.body);

    const resetToken = await storage.getPasswordResetToken(token);
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Update user password
    await storage.updateUser(resetToken.userId, { password });

    // Mark token as used
    await storage.markPasswordResetTokenUsed(token);

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to reset password' });
  }
});

// Verify email address
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      token: z.string(),
    });

    const { token } = schema.parse(req.body);

    const verificationToken = await storage.getEmailVerificationToken(token);
    if (!verificationToken) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Mark user as verified
    await storage.updateUser(verificationToken.userId, { emailVerified: true });

    // Mark token as used
    await storage.markEmailVerificationTokenUsed(token);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error('Failed to verify email:', error);
    res.status(400).json({ error: 'Invalid token' });
  }
});

// Get user email preferences
router.get('/preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    let preferences = await storage.getUserEmailPreferences(userId);

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await storage.createUserEmailPreferences({
        userId,
        transactional: {
          bookingConfirmation: true,
          bookingUpdate: true,
          messageReceived: true,
          passwordReset: true,
          accountUpdate: true,
        },
        marketing: {
          newsletter: false,
          promotions: false,
          productUpdates: false,
          tips: false,
        },
        frequency: 'immediate',
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Failed to get email preferences:', error);
    res.status(500).json({ error: 'Failed to get email preferences' });
  }
});

// Update user email preferences
router.put('/preferences', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const updateSchema = z.object({
      transactional: z.object({
        bookingConfirmation: z.boolean().optional(),
        bookingUpdate: z.boolean().optional(),
        messageReceived: z.boolean().optional(),
        passwordReset: z.boolean().optional(),
        accountUpdate: z.boolean().optional(),
      }).optional(),
      marketing: z.object({
        newsletter: z.boolean().optional(),
        promotions: z.boolean().optional(),
        productUpdates: z.boolean().optional(),
        tips: z.boolean().optional(),
      }).optional(),
      frequency: z.enum(['immediate', 'daily', 'weekly', 'never']).optional(),
    });

    const updates = updateSchema.parse(req.body);

    // Get existing preferences
    let preferences = await storage.getUserEmailPreferences(userId);

    if (preferences) {
      // Update existing preferences
      preferences = await storage.updateUserEmailPreferences(userId, {
        transactional: { ...preferences.transactional, ...updates.transactional },
        marketing: { ...preferences.marketing, ...updates.marketing },
        frequency: updates.frequency || preferences.frequency,
      });
    } else {
      // Create new preferences
      preferences = await storage.createUserEmailPreferences({
        userId,
        transactional: updates.transactional || {
          bookingConfirmation: true,
          bookingUpdate: true,
          messageReceived: true,
          passwordReset: true,
          accountUpdate: true,
        },
        marketing: updates.marketing || {
          newsletter: false,
          promotions: false,
          productUpdates: false,
          tips: false,
        },
        frequency: updates.frequency || 'immediate',
      });
    }

    res.json(preferences);
  } catch (error) {
    console.error('Failed to update email preferences:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update preferences' });
  }
});

// Unsubscribe from marketing emails
router.post('/unsubscribe', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      token: z.string().optional(),
      reason: z.string().optional(),
    });

    const { email, reason } = schema.parse(req.body);

    // Update marketing subscription
    const subscription = await storage.getMarketingSubscription(email);
    if (subscription) {
      await storage.updateMarketingSubscription(email, {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        unsubscribeReason: reason,
      });
    }

    // Add to suppression list
    await emailService.addToSuppressionList(email, 'unsubscribe');

    res.json({ success: true, message: 'Successfully unsubscribed from marketing emails' });
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    res.status(400).json({ error: 'Failed to process unsubscribe request' });
  }
});

// Subscribe to marketing emails
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      source: z.string().optional(),
      tags: z.array(z.string()).optional(),
    });

    const data = schema.parse(req.body);

    // Check if already subscribed
    let subscription = await storage.getMarketingSubscription(data.email);

    if (subscription) {
      // Update existing subscription
      await storage.updateMarketingSubscription(data.email, {
        status: 'subscribed',
        unsubscribedAt: null,
        unsubscribeReason: null,
      });
    } else {
      // Create new subscription
      subscription = await storage.createMarketingSubscription({
        email: data.email,
        status: 'subscribed',
        source: data.source || 'website',
        tags: data.tags || [],
      });
    }

    // Remove from suppression list if present
    await storage.removeFromSuppressionList(data.email);

    res.json({ success: true, message: 'Successfully subscribed to marketing emails' });
  } catch (error) {
    console.error('Failed to subscribe:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to process subscription' });
  }
});

// Postmark webhook endpoint
router.post('/webhook/postmark', async (req: Request, res: Response) => {
  try {
    const eventType = req.body.RecordType;
    const payload = req.body;

    // Process webhook
    await emailService.processWebhook(eventType, payload);

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to process webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Admin endpoints

// Get email templates
router.get('/templates', requireAdmin, async (req: Request, res: Response) => {
  try {
    const templates = await storage.getEmailTemplates();
    res.json(templates);
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// Create email template
router.post('/templates', requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = insertEmailTemplateSchema.parse(req.body);
    const template = await storage.createEmailTemplate(data);
    res.json(template);
  } catch (error) {
    console.error('Failed to create template:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create template' });
  }
});

// Update email template
router.put('/templates/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const template = await storage.updateEmailTemplate(id, req.body);
    res.json(template);
  } catch (error) {
    console.error('Failed to update template:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to update template' });
  }
});

// Get email campaigns
router.get('/campaigns', requireAdmin, async (req: Request, res: Response) => {
  try {
    const campaigns = await storage.getEmailCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error('Failed to get campaigns:', error);
    res.status(500).json({ error: 'Failed to get campaigns' });
  }
});

// Create email campaign
router.post('/campaigns', requireAdmin, async (req: Request, res: Response) => {
  try {
    const data = insertEmailCampaignSchema.parse({
      ...req.body,
      createdBy: req.user!.id,
    });
    const campaign = await storage.createEmailCampaign(data);
    res.json(campaign);
  } catch (error) {
    console.error('Failed to create campaign:', error);
    res.status(400).json({ error: error instanceof Error ? error.message : 'Failed to create campaign' });
  }
});

// Get email events
router.get('/events', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.query;
    
    let events;
    if (userId) {
      events = await storage.getEmailEventsByUser(parseInt(userId as string));
    } else if (status) {
      events = await storage.getEmailEventsByStatus(status as string);
    } else {
      // Return recent events
      events = await storage.getEmailEventsByStatus('sent');
    }
    
    res.json(events);
  } catch (error) {
    console.error('Failed to get email events:', error);
    res.status(500).json({ error: 'Failed to get email events' });
  }
});

// Get suppression list
router.get('/suppression', requireAdmin, async (req: Request, res: Response) => {
  try {
    const list = await storage.getSuppressionList();
    res.json(list);
  } catch (error) {
    console.error('Failed to get suppression list:', error);
    res.status(500).json({ error: 'Failed to get suppression list' });
  }
});

// Remove from suppression list
router.delete('/suppression/:email', requireAdmin, async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    await storage.removeFromSuppressionList(email);
    res.json({ success: true, message: 'Email removed from suppression list' });
  } catch (error) {
    console.error('Failed to remove from suppression list:', error);
    res.status(500).json({ error: 'Failed to remove from suppression list' });
  }
});

export default router;