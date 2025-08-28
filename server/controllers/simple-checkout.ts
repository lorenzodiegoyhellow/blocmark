import { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';

// Initialize Stripe with latest stable API version (as of 2025)
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16', // This is the most stable version available for our needs
    })
  : null;

export async function createSimpleCheckoutSession(req: Request, res: Response) {
  console.log('Simple checkout request received');
  
  if (!stripe) {
    console.error('Stripe is not initialized - missing STRIPE_SECRET_KEY');
    return res.status(500).json({
      error: 'Payment system not configured',
      details: 'Stripe API key is missing'
    });
  }
  
  // Check authentication, but allow optional clientId fallback for integration scenarios
  let clientId: number | null = null;
  
  // First try to get the ID from the authenticated session
  if (req.user && req.user.id) {
    clientId = req.user.id;
    console.log(`Authenticated user from session: ${clientId}`);
  } 
  // Then check if a client ID was explicitly provided in the request body
  else if (req.body.clientId && !isNaN(Number(req.body.clientId))) {
    clientId = Number(req.body.clientId);
    console.log(`Using provided client ID from request body: ${clientId}`);
    
    // Verify this user exists
    try {
      const userExists = await storage.getUser(clientId);
      if (!userExists) {
        console.error(`Invalid client ID provided: ${clientId}`);
        return res.status(401).json({ 
          error: 'Authentication failed',
          details: 'Invalid user'
        });
      }
    } catch (err) {
      console.error(`Error verifying user ${clientId}:`, err);
      return res.status(401).json({ 
        error: 'Authentication error',
        details: 'Could not verify user'
      });
    }
  } else {
    console.error('Unauthorized checkout attempt - no valid authentication or client ID');
    return res.status(401).json({ 
      error: 'Authentication required',
      details: 'You must be logged in to create a checkout session'
    });
  }
  
  // Log request body safely (without sensitive information)
  try {
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Location ID:', req.body.locationId);
    console.log('Amount:', req.body.amount);
  } catch (err) {
    console.error('Error logging request body:', err);
  }
  
  try {
    const { locationId, bookingId, amount, description } = req.body;
    
    // Enhanced validation
    if (!locationId) {
      return res.status(400).json({ 
        error: 'Missing required field: locationId',
        details: 'The location ID is required to process the payment'
      });
    }
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        details: 'A valid payment amount greater than 0 is required'
      });
    }
    
    // Get location details
    const location = await storage.getLocation(locationId);
    if (!location) {
      return res.status(404).json({ 
        error: 'Location not found',
        details: `Location with ID ${locationId} does not exist`
      });
    }
    
    // Check if user is trying to book their own location
    if (location.ownerId === clientId) {
      console.error(`User ${clientId} attempted to book their own location ${locationId}`);
      return res.status(403).json({ 
        error: 'Booking your own location is not allowed',
        details: 'You cannot create a booking for a location you own'
      });
    }
    
    // Use the verified clientId for the Stripe session
    
    // Use the referer or origin header to determine the base URL
    // Fall back to host header if neither is available
    const referer = req.headers.referer || '';
    const origin = req.headers.origin || '';
    
    // Extract base URL from referer or origin, or fall back to host
    let baseUrl = '';
    if (referer) {
      const url = new URL(referer);
      baseUrl = `${url.protocol}//${url.host}`;
    } else if (origin) {
      baseUrl = origin;
    } else {
      baseUrl = `https://${req.headers.host}`;
    }
    
    // Ensure booking ID is valid and correctly formatted
    if (!bookingId || isNaN(Number(bookingId))) {
      console.error('Invalid booking ID for checkout:', bookingId);
      return res.status(400).json({
        error: 'Invalid booking ID',
        details: 'A valid booking ID is required to process payment'
      });
    }

    // Verify the booking exists
    const booking = await storage.getBooking(Number(bookingId));
    if (!booking) {
      console.error(`Booking with ID ${bookingId} not found`);
      return res.status(404).json({
        error: 'Booking not found',
        details: `No booking found with ID ${bookingId}`
      });
    }
    
    // Create a direct success URL to our new simplified confirmation page
    // This approach doesn't rely on complex redirects or URL parameters that can get lost
    const confirmationUrl = `${baseUrl}/payment-confirmation/${encodeURIComponent(bookingId.toString())}`;
    
    // Use the direct confirmation URL as our success URL
    const successUrl = confirmationUrl;
    
    const cancelUrl = `${baseUrl}/locations/${encodeURIComponent(locationId.toString())}`;
    
    console.log('Creating Stripe checkout session');
    console.log('Base URL detected:', baseUrl);
    console.log('Booking ID for redirect:', bookingId);
    console.log('Using confirmation URL:', confirmationUrl);
    console.log('Cancel URL:', cancelUrl);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || location.title,
            },
            unit_amount: Math.round(amount * 100), // Converting to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      customer_creation: 'always',
      metadata: {
        bookingId: bookingId?.toString() || '0',
        userId: clientId ? clientId.toString() : '0', // Use the verified clientId with fallback
        locationId: locationId.toString()
      }
    });
    
    console.log('Session created:', session.id);
    console.log('Checkout URL:', session.url);
    
    // Return the session details with the booking ID for client-side reference
    res.json({
      id: session.id,
      url: session.url,
      bookingId: bookingId
    });
    
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}