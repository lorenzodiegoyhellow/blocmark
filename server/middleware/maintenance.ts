import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export async function maintenanceMode(req: Request, res: Response, next: NextFunction) {
  try {
    // Get maintenance mode setting
    const maintenanceSetting = await storage.getSiteSetting('maintenance_mode');
    const isMaintenanceMode = maintenanceSetting?.value === 'true';
    
    console.log(`[MAINTENANCE] Path: ${req.path}, Enabled: ${isMaintenanceMode}, User: ${req.user?.username || 'anonymous'}`);
    
    if (!isMaintenanceMode) {
      return next();
    }
    
    // Allow admin users to access during maintenance
    // Check if auth is initialized (req.isAuthenticated might not exist before passport setup)
    if (req.isAuthenticated?.() && req.user?.roles.includes('admin')) {
      return next();
    }
    
    // Define public pages that should be accessible during maintenance
    const publicPaths = [
      '/',
      '/host',
      '/secret-corners',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/sitemap'
    ];
    
    // Define auth-related endpoints to block during maintenance
    const authPaths = [
      '/api/login',
      '/api/register',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/google',
      '/api/auth/facebook',
      '/api/auth/oauth'
    ];
    
    // Allow static assets and public pages
    if (req.path.startsWith('/api/admin') || 
        req.path.startsWith('/attached_assets') || 
        req.path.startsWith('/src/') ||
        req.path.startsWith('/@') ||  // Vite development files
        req.path.includes('.') ||
        publicPaths.includes(req.path)) {
      return next();
    }
    
    // Allow public API endpoints needed for browsing
    const publicApiEndpoints = [
      '/api/locations',
      '/api/spotlight/current',
      '/api/user',  // Needed for auth check
      '/api/notifications'  // Needed for app layout
    ];
    
    // Allow essential authenticated user endpoints
    const authenticatedApiEndpoints = [
      '/api/bookings/user',
      '/api/bookings/host', 
      '/api/reviews/pending',
      '/api/reviews/host/pending',
      '/api/messages'
    ];
    
    // Check if it's a public endpoint (always allow)
    if (publicApiEndpoints.some(endpoint => req.path.startsWith(endpoint)) && req.method === 'GET') {
      return next();
    }
    
    // Check if it's an authenticated endpoint and user is logged in
    if (authenticatedApiEndpoints.some(endpoint => req.path.startsWith(endpoint)) && 
        req.isAuthenticated?.() && req.user) {
      return next();
    }
    
    // Block authentication attempts during maintenance
    if (authPaths.some(path => req.path.startsWith(path))) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'Login is currently disabled due to maintenance. Please try again later.'
      });
    }
    
    // Block other API requests during maintenance
    if (req.path.startsWith('/api/')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'The site is currently under maintenance. Please try again later.'
      });
    }
    
    // For non-API requests to protected pages, show maintenance page
    return res.status(503).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Site Maintenance</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .maintenance-container {
            text-align: center;
            max-width: 500px;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          .maintenance-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          .maintenance-title {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          .maintenance-message {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
            opacity: 0.9;
          }
          .maintenance-time {
            font-size: 14px;
            opacity: 0.7;
          }
        </style>
      </head>
      <body>
        <div class="maintenance-container">
          <div class="maintenance-icon">🔧</div>
          <h1 class="maintenance-title">Under Maintenance</h1>
          <p class="maintenance-message">
            We're currently performing scheduled maintenance to improve your experience. 
            We'll be back online shortly.
          </p>
          <p class="maintenance-time">
            Thank you for your patience.
          </p>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Error checking maintenance mode:', error);
    // On error, allow access to prevent site being broken
    next();
  }
}