import express from 'express';
import { insertReviewSchema } from '@shared/schema';
import { storage } from '../storage';

const router = express.Router();

// Middleware to ensure authentication
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

// Get reviews for a location
router.get('/location/:locationId', async (req, res) => {
  try {
    const locationId = parseInt(req.params.locationId);
    if (isNaN(locationId)) {
      return res.status(400).json({ error: 'Invalid location ID' });
    }

    const reviews = await storage.getReviewsByLocation(locationId);
    
    // Enhance reviews with user information and map fields
    const enhancedReviews = await Promise.all(
      reviews.map(async (review) => {
        const user = await storage.getUser(review.userId);
        return {
          ...review,
          content: review.comment, // Map comment field to content for frontend compatibility
          user: user ? {
            id: user.id,
            username: user.username,
            profileImage: user.profileImage
          } : null
        };
      })
    );
    
    res.json(enhancedReviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const reviews = await storage.getReviewsByUser(userId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

// Check user's review requirements (pending reviews they need to complete)
router.get('/requirements', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const requirements = await storage.getUserReviewRequirements(userId);
    res.json(requirements);
  } catch (error) {
    console.error('Error fetching review requirements:', error);
    res.status(500).json({ error: 'Failed to fetch review requirements' });
  }
});

// Check if user can make new bookings (all reviews completed)
router.get('/eligibility', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const canBook = await storage.canUserMakeBooking(userId);
    res.json({ eligible: canBook });
  } catch (error) {
    console.error('Error checking booking eligibility:', error);
    res.status(500).json({ error: 'Failed to check booking eligibility' });
  }
});

// Create a new review
router.post('/', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Log the incoming request body to debug the issue
    console.log('Review POST request body:', JSON.stringify(req.body, null, 2));
    
    // Remove userId from req.body if it exists (it should come from session)
    const { userId: bodyUserId, ...reviewPayload } = req.body;
    
    // Validate the review data
    const validationResult = insertReviewSchema.safeParse(reviewPayload);
    if (!validationResult.success) {
      console.error('Review validation failed:', validationResult.error.errors);
      console.error('Failed payload:', reviewPayload);
      
      // Enhanced error response for debugging
      const errorDetails = validationResult.error.errors.map(err => ({
        ...err,
        received: reviewPayload[err.path[0]]
      }));
      
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errorDetails
      });
    }

    const reviewData = validationResult.data;
    
    // Verify the user is part of this booking
    const booking = await storage.getBooking(reviewData.bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Check if user is authorized to review (either guest or host)
    const isGuest = booking.clientId === userId;
    const location = await storage.getLocation(booking.locationId);
    const isHost = location?.ownerId === userId;

    if (!isGuest && !isHost) {
      return res.status(403).json({ error: 'Not authorized to review this booking' });
    }

    // Verify review type matches user role
    if (isGuest && reviewData.reviewType !== 'guest_to_host') {
      return res.status(400).json({ error: 'Guests can only create guest_to_host reviews' });
    }
    if (isHost && reviewData.reviewType !== 'host_to_guest') {
      return res.status(400).json({ error: 'Hosts can only create host_to_guest reviews' });
    }

    // Check if user already reviewed this booking
    const existingReview = await storage.getUserReviewForBooking(userId, reviewData.bookingId);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this booking' });
    }

    // Create the review
    const review = await storage.createReview({
      ...reviewData,
      userId: userId
    });

    // Update review requirements
    await storage.updateReviewRequirement(reviewData.bookingId, reviewData.reviewType);

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Host response to a review
router.post('/:reviewId/response', ensureAuthenticated, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.user.id;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ error: 'Response is required' });
    }

    if (response.length > 1000) {
      return res.status(400).json({ error: 'Response must be 1000 characters or less' });
    }

    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Verify the user is the location owner
    const location = await storage.getLocation(review.locationId);
    if (!location || location.ownerId !== userId) {
      return res.status(403).json({ error: 'Only the location owner can respond to reviews' });
    }

    // Only allow responses to guest_to_host reviews
    if (review.reviewType !== 'guest_to_host') {
      return res.status(400).json({ error: 'Can only respond to guest reviews' });
    }

    const updatedReview = await storage.updateReviewResponse(reviewId, response);
    res.json(updatedReview);
  } catch (error) {
    console.error('Error adding review response:', error);
    res.status(500).json({ error: 'Failed to add review response' });
  }
});

// Get pending reviews for host
router.get('/host/pending', ensureAuthenticated, async (req, res) => {
  try {
    console.log('Starting host pending reviews endpoint');
    const userId = req.user.id;
    console.log('User ID:', userId);
    
    // Get all locations owned by the host
    const hostLocationsResult = await storage.getLocationsByOwner(userId);
    const locationIds = hostLocationsResult.data.map(loc => loc.id);
    
    if (locationIds.length === 0) {
      return res.json([]);
    }
    
    // Get all confirmed bookings for host's locations that have ended
    const hostBookings = [];
    for (const locationId of locationIds) {
      const locationBookingsResult = await storage.getLocationBookings(locationId);
      hostBookings.push(...locationBookingsResult.data);
    }
    const completedBookings = hostBookings.filter(booking => 
      booking.status === 'confirmed' && 
      new Date(booking.endDate) < new Date()
    );
    
    // Get existing reviews for these bookings
    const bookingIds = completedBookings.map(b => b.id);
    
    // If no bookings, return empty array
    if (bookingIds.length === 0) {
      return res.json([]);
    }
    
    // Get reviews for these specific bookings
    const existingReviews = await storage.getReviewsByBookingIds(bookingIds);
    
    // Filter to bookings where host hasn't left a review yet
    const pendingReviews = completedBookings.filter(booking => {
      const bookingReviews = existingReviews.filter(r => r.bookingId === booking.id);
      const hasHostReview = bookingReviews.some(r => r.reviewType === 'host_to_guest');
      
      // Debug logging
      if (booking.id === 119) {
        console.log(`Booking ${booking.id} - Reviews:`, bookingReviews.map(r => ({
          id: r.id,
          type: r.reviewType,
          reviewerId: r.userId
        })));
        console.log(`Has host review: ${hasHostReview}`);
      }
      
      return !hasHostReview;
    });
    
    // Enhance with client and location info
    const enhancedPendingReviews = await Promise.all(
      pendingReviews.map(async (booking) => {
        const location = hostLocationsResult.data.find(loc => loc.id === booking.locationId);
        const client = await storage.getUser(booking.clientId);
        return {
          ...booking,
          locationTitle: location?.title || 'Unknown Location',
          locationImage: location?.images?.[0] || null,
          clientName: client?.username || 'Unknown Guest',
          clientImage: client?.profileImage || null
        };
      })
    );
    
    res.json(enhancedPendingReviews);
  } catch (error) {
    console.error('Error fetching host pending reviews:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
});

export default router;