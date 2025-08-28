import { Router } from 'express';
import { storage } from '../storage';
import { secretCornersApplicationSchema } from '@shared/schema';
import { authenticateUser, requireAuth, requireAdmin } from '../auth';
import { validate } from '../validators';
import { z } from 'zod';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Check Secret Corners access status for current user
router.get('/api/secret-corners/access', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Debug user information
    console.log('USER ACCESS DEBUG:', {
      userId,
      roles: req.user!.roles,
      isAdmin: req.user!.roles?.includes('admin')
    });
    
    // Special case: Admin users always have access
    if (req.user!.roles?.includes('admin')) {
      console.log('ADMIN ACCESS GRANTED FOR:', userId);
      console.log('User roles:', req.user!.roles);
      return res.json({
        hasAccess: true,
        status: 'admin',
        message: 'Admin access granted'
      });
    }
    
    const hasAccess = await storage.hasSecretCornersAccess(userId);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({
      hasAccess,
      status: user.secretCornersAccess || 'not_applied',
      appliedAt: user.secretCornersAppliedAt,
      approvedAt: user.secretCornersApprovedAt,
      application: user.secretCornersApplication,
      rejectionReason: user.secretCornersRejectionReason
    });
  } catch (error) {
    console.error('Error checking Secret Corners access:', error);
    return res.status(500).json({ error: 'Failed to check Secret Corners access status' });
  }
});

// Apply for Secret Corners access
router.post('/api/secret-corners/apply', 
  requireAuth, 
  // Debug the request body
  (req, res, next) => {
    console.log('Received application request body:', req.body);
    next();
  },
  // Skip validation for now to debug the exact request structure
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const { application } = req.body;
      
      console.log('Processing application for user', userId);
      console.log('Application text:', application);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user has already applied
      if (user.secretCornersAccess && user.secretCornersAccess !== 'not_applied' && user.secretCornersAccess !== 'rejected') {
        return res.status(400).json({ 
          error: `You have already applied for Secret Corners access. Your application status is: ${user.secretCornersAccess}` 
        });
      }
      
      // Submit application
      const updatedUser = await storage.applyForSecretCornersAccess(userId, application);
      
      return res.json({
        success: true,
        status: updatedUser.secretCornersAccess,
        message: 'Your application for Secret Corners access has been submitted successfully and is pending review.'
      });
      
    } catch (error) {
      console.error('Error applying for Secret Corners access:', error);
      console.error('Error details:', error instanceof Error ? error.stack : String(error));
      return res.status(500).json({ error: 'Failed to submit application for Secret Corners access' });
    }
});

// Admin: Get all Secret Corners applications with specific status
router.get('/api/admin/secret-corners/applications/:status', 
  requireAuth, 
  requireAdmin, 
  // Fix validation to correctly handle req.params from Express
  async (req, res) => {
    console.log("Secret Corners Applications Request: ", {
      path: req.path,
      params: req.params,
      user: req.user ? { id: req.user.id, roles: req.user.roles } : null,
      isAuthenticated: req.isAuthenticated()
    });
    
    // Manual validation since the validate middleware isn't working correctly with URL params
    const status = req.params.status;
    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: "Invalid status parameter", 
        message: "Status must be one of: pending, approved, rejected" 
      });
    }

    try {
      const { status } = req.params;
      
      // Use the NEW storage method for the applications table
      console.log(`Fetching applications with status ${status} from new applications table`);
      const applications = await storage.getSecretCornersApplicationsByStatus(status as 'pending' | 'approved' | 'rejected');
      console.log(`Retrieved ${applications.length} applications with status ${status} from new applications table`);
      
      // Return the applications with user information
      const applicationsWithUsers = await Promise.all(
        applications.map(async (app) => {
          const user = await storage.getUser(app.userId);
          return {
            id: app.id,
            userId: app.userId,
            username: user?.username || 'Unknown',
            email: user?.email || null,
            phoneNumber: user?.phoneNumber || null,
            bio: user?.bio || null,
            profileImage: user?.profileImage || null,
            location: app.location,
            motivation: app.motivation,
            contribution: app.contribution,
            status: app.status,
            createdAt: app.createdAt,
            reviewedAt: app.reviewedAt,
            reviewedBy: app.reviewedBy,
            rejectionReason: app.rejectionReason
          };
        })
      );
      
      return res.json(applicationsWithUsers);
    } catch (error) {
      console.error(`Error getting ${req.params.status} Secret Corners applications:`, error);
      return res.status(500).json({ error: `Failed to retrieve ${req.params.status} Secret Corners applications` });
    }
});

// Admin: Approve Secret Corners application
router.post('/api/admin/secret-corners/applications/:applicationId/approve',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    console.log('APPROVE ENDPOINT HIT:', {
      path: req.path,
      applicationId: req.params.applicationId,
      user: req.user ? { id: req.user.id, roles: req.user.roles } : null
    });
    
    try {
      const adminId = req.user!.id;
      const applicationIdNum = parseInt(req.params.applicationId, 10);
      
      if (isNaN(applicationIdNum)) {
        return res.status(400).json({ error: 'Invalid application ID' });
      }
      
      // Update application status in the new applications table
      const updatedApplication = await storage.updateSecretCornersApplication(
        applicationIdNum, 
        'approved', 
        adminId,
        '' 
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Also update user's access status
      await storage.updateSecretCornersAccessStatus(
        updatedApplication.userId,
        'approved',
        '',
        adminId
      );
      
      return res.json({
        success: true,
        status: 'approved',
        message: 'Secret Corners application has been approved'
      });
      
    } catch (error) {
      console.error('Error approving Secret Corners application:', error);
      return res.status(500).json({ error: 'Failed to approve Secret Corners application' });
    }
});

// Admin: Reject Secret Corners application
router.post('/api/admin/secret-corners/applications/:applicationId/reject',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    try {
      const adminId = req.user!.id;
      const applicationIdNum = parseInt(req.params.applicationId, 10);
      const { reason = 'Not suitable for Secret Corners' } = req.body;
      
      if (isNaN(applicationIdNum)) {
        return res.status(400).json({ error: 'Invalid application ID' });
      }
      
      // Update application status in the new applications table
      const updatedApplication = await storage.updateSecretCornersApplication(
        applicationIdNum, 
        'rejected', 
        adminId,
        reason 
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      return res.json({
        success: true,
        status: 'rejected',
        message: 'Secret Corners application has been rejected'
      });
      
    } catch (error) {
      console.error('Error rejecting Secret Corners application:', error);
      return res.status(500).json({ error: 'Failed to reject Secret Corners application' });
    }
});

// Admin: Update Secret Corners application status (general endpoint)
router.post('/api/admin/secret-corners/applications/:applicationId/status',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    // Manual validation since the validate middleware is causing issues
    const applicationId = req.params.applicationId;
    if (!applicationId || isNaN(parseInt(applicationId, 10))) {
      return res.status(400).json({
        error: "Invalid application ID",
        message: "Application ID must be a valid number"
      });
    }

    const { status, reason } = req.body;
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        error: "Invalid status parameter",
        message: "Status must be one of: approved, rejected, pending"
      });
    }
    try {
      const adminId = req.user!.id;
      const applicationIdNum = parseInt(req.params.applicationId, 10);
      const { status, reason = '' } = req.body;
      
      // Update application status in the new applications table
      const updatedApplication = await storage.updateSecretCornersApplication(
        applicationIdNum, 
        status, 
        adminId,
        reason 
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Also update user's access status based on the new status
      if (status === 'approved') {
        await storage.updateSecretCornersAccessStatus(
          updatedApplication.userId,
          'approved',
          '',
          adminId
        );
      } else if (status === 'pending') {
        // Revoke access by setting status back to pending
        await storage.updateSecretCornersAccessStatus(
          updatedApplication.userId,
          'pending',
          '',
          adminId
        );
      } else if (status === 'rejected') {
        // Set rejected status with reason
        await storage.updateSecretCornersAccessStatus(
          updatedApplication.userId,
          'rejected',
          reason || 'Application rejected',
          adminId
        );
      }
      
      return res.json({
        success: true,
        status: status,
        message: `Secret Corners application has been ${status}`
      });
      
    } catch (error) {
      console.error('Error updating Secret Corners application status:', error);
      return res.status(500).json({ error: 'Failed to update Secret Corners application status' });
    }
});

// Get Secret Corners locations (specific to the Secret Corners feature)
router.get('/api/secret-corners/locations', 
  requireAuth, 
  async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Special case: Admin users always have access
      if (req.user!.roles?.includes('admin')) {
        // Get approved secret locations for admin
        const locations = await storage.getSecretLocationsByStatus('approved');
        return res.json(locations);
      }
      
      // Check if regular user has access
      const hasAccess = await storage.hasSecretCornersAccess(userId);
      if (!hasAccess) {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You do not have access to Secret Corners. Please apply for access first.' 
        });
      }
      
      // Get approved secret locations
      const locations = await storage.getSecretLocationsByStatus('approved');
      
      return res.json(locations);
    } catch (error) {
      console.error('Error getting Secret Corners locations:', error);
      return res.status(500).json({ error: 'Failed to retrieve Secret Corners locations' });
    }
});

// Create Secret Corners subscription
router.post('/api/secret-corners/subscribe',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const { tier, priceId, isYearly } = req.body;
      
      // Validate tier
      if (!['wanderer', 'explorer', 'architect'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid subscription tier' });
      }
      
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if user has been approved for Secret Corners
      if (user.secretCornersAccess !== 'approved') {
        return res.status(403).json({ 
          error: 'Access denied', 
          message: 'You must be approved for Secret Corners before subscribing' 
        });
      }
      
      // Create or retrieve Stripe customer
      let stripeCustomerId = user.stripeCustomerId;
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId.toString(),
            username: user.username
          }
        });
        stripeCustomerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUserStripeCustomerId(userId, stripeCustomerId);
      }
      
      // Handle missing price ID for testing
      let finalPriceId = priceId;
      if (!finalPriceId) {
        // Create test prices based on tier
        const priceMap = {
          wanderer: { monthly: 400, yearly: 4000 }, // $4/month, $40/year in cents
          explorer: { monthly: 1400, yearly: 14000 }, // $14/month, $140/year in cents  
          architect: { monthly: 3400, yearly: 34000 } // $34/month, $340/year in cents
        };
        
        const amount = isYearly ? priceMap[tier].yearly : priceMap[tier].monthly;
        const interval = isYearly ? 'year' : 'month';
        
        const price = await stripe.prices.create({
          unit_amount: amount,
          currency: 'usd',
          recurring: {
            interval: interval,
          },
          product_data: {
            name: `Secret Corners ${tier.charAt(0).toUpperCase() + tier.slice(1)}`,
            description: `Access to Secret Corners premium locations - ${tier} tier`
          }
        });
        finalPriceId = price.id;
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: finalPriceId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent']
      });
      
      // Update user's subscription details
      await storage.updateUserSecretCornersSubscription(userId, {
        tier,
        status: 'active',
        stripeSubscriptionId: subscription.id,
        startedAt: new Date(),
        endsAt: isYearly 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      
      // Return client secret for payment confirmation
      const latestInvoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = latestInvoice.payment_intent as Stripe.PaymentIntent;
      
      return res.json({
        clientSecret: paymentIntent.client_secret,
        subscriptionId: subscription.id
      });
      
    } catch (error) {
      console.error('Error creating subscription:', error);
      return res.status(500).json({ error: 'Failed to create subscription' });
    }
});

// Cancel Secret Corners subscription
router.post('/api/secret-corners/cancel-subscription',
  requireAuth,
  async (req, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (!user.stripeSubscriptionId) {
        return res.status(400).json({ error: 'No active subscription found' });
      }
      
      // Cancel subscription at period end
      const subscription = await stripe.subscriptions.update(
        user.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );
      
      // Update user's subscription status
      await storage.updateUserSecretCornersSubscription(userId, {
        status: 'cancelled'
      });
      
      return res.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period',
        endsAt: subscription.current_period_end
      });
      
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      return res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

export default router;