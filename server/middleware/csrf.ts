import { Express, Request, Response, NextFunction } from 'express';
import csurf from 'csurf';
import winston from 'winston';

// Configure Winston logger for CSRF violations
const csrfLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'csrf-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/security.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// CSRF error handler
const handleCsrfError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Add custom type to handle CSRF specific error
  interface CsrfError extends Error {
    code?: string;
  }
  
  const csrfError = err as CsrfError;
  if (csrfError.code !== 'EBADCSRFTOKEN') return next(err);
  
  // Log CSRF violation attempt
  csrfLogger.warn('CSRF violation attempt', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer || 'unknown'
  });
  
  // Send error response
  res.status(403).json({
    message: 'Invalid or missing CSRF token',
    error: 'CSRF_ERROR'
  });
};

// Setup CSRF protection for the Express app
export function setupCsrf(app: Express) {
  // Skip CSRF for APIs that are expected to be called from external sources
  // or for specific methods that don't need CSRF protection
  const csrfExcludedPaths = [
    '/api/webhook',       // For webhook callbacks
    '/api/public',        // For public APIs
    '/api/auth/login',    // Auth endpoints
    '/api/auth/register',
  ];
  
  // Create CSRF protection middleware with cookie-based configuration
  const csrfProtection = csurf({
    cookie: {
      key: '_csrf',
      path: '/',
      httpOnly: true,
      // In Replit, we need to handle the secure flag specially
      secure: process.env.REPL_ID ? false : process.env.NODE_ENV === 'production',
      sameSite: process.env.REPL_ID ? 'none' : 'lax', // Use 'none' in Replit for HTTPS
      maxAge: 86400 // 24 hours
    },
    ignoreMethods: ['GET', 'HEAD', 'OPTIONS'] // Don't require CSRF for these methods
  });
  
  // Apply CSRF selectively
  app.use((req, res, next) => {
    // Skip CSRF for excluded paths
    if (csrfExcludedPaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // For development mode or Replit environment, disable CSRF to eliminate configuration issues
    if (process.env.NODE_ENV !== 'production' || process.env.REPL_ID) {
      return next();
    }
    
    // Apply CSRF protection
    csrfProtection(req, res, next);
  });
  
  // Handle CSRF errors
  app.use(handleCsrfError);
  
  // Provide CSRF token endpoint for client
  app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });
  
  return app;
}