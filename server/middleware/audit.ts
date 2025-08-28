import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import { resolve } from 'path';
import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = resolve('./logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure the winston logger for audit logging
export const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'audit-service' },
  transports: [
    // Write all audit logs to the audit.log file
    new winston.transports.File({ 
      filename: resolve('./logs/audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Write errors to a separate file
    new winston.transports.File({ 
      filename: resolve('./logs/audit-error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    }),
  ],
});

// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
  auditLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// Classify the operation type based on the request
function classifyOperation(req: Request): string | null {
  const { method, path } = req;
  
  // User operations
  if (path.includes('/api/users') || path.includes('/api/auth')) {
    if (path.includes('/login')) return 'USER_LOGIN';
    if (path.includes('/register')) return 'USER_REGISTER';
    if (path.includes('/logout')) return 'USER_LOGOUT';
    if (method === 'GET') return 'USER_READ';
    if (method === 'POST') return 'USER_CREATE';
    if (method === 'PATCH' || method === 'PUT') return 'USER_UPDATE';
    if (method === 'DELETE') return 'USER_DELETE';
    return 'USER_OPERATION';
  }
  
  // Location operations
  if (path.includes('/api/locations')) {
    if (method === 'GET') return 'LOCATION_READ';
    if (method === 'POST') return 'LOCATION_CREATE';
    if (method === 'PATCH' || method === 'PUT') return 'LOCATION_UPDATE';
    if (method === 'DELETE') return 'LOCATION_DELETE';
    return 'LOCATION_OPERATION';
  }
  
  // Booking operations
  if (path.includes('/api/bookings')) {
    if (method === 'GET') return 'BOOKING_READ';
    if (method === 'POST') return 'BOOKING_CREATE';
    if (method === 'PATCH' || method === 'PUT') return 'BOOKING_UPDATE';
    if (method === 'DELETE') return 'BOOKING_DELETE';
    return 'BOOKING_OPERATION';
  }
  
  // Message operations
  if (path.includes('/api/messages')) {
    if (method === 'GET') return 'MESSAGE_READ';
    if (method === 'POST') return 'MESSAGE_CREATE';
    if (method === 'PATCH') return 'MESSAGE_UPDATE';
    return 'MESSAGE_OPERATION';
  }
  
  // Admin operations
  if (path.includes('/api/admin')) {
    return 'ADMIN_OPERATION';
  }
  
  // Spotlight operations
  if (path.includes('/api/spotlight')) {
    return 'SPOTLIGHT_OPERATION';
  }
  
  // Payment operations
  if (path.includes('/api/payment') || path.includes('/api/checkout')) {
    return 'PAYMENT_OPERATION';
  }
  
  // Security operations
  if (path.includes('/api/security')) {
    return 'SECURITY_OPERATION';
  }
  
  // Notification operations
  if (path.includes('/api/notifications')) {
    return 'NOTIFICATION_OPERATION';
  }

  // Default for unclassified operations
  return null;
}

// Redact sensitive data in request/response logs
function redactSensitiveData(data: any): any {
  if (!data) return data;
  
  // Handle different data types
  if (typeof data !== 'object') {
    return data;
  }
  
  // Clone the object to avoid modifying the original
  const clonedData = Array.isArray(data) ? [...data] : { ...data };
  
  // List of sensitive field names to redact
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'cookie', 'credential', 
    'ssn', 'creditCard', 'cardNumber', 'cvv', 'pin', 'access_token', 
    'refresh_token', 'private', 'secret', 'authorization'
  ];
  
  // Redact sensitive fields
  for (const key in clonedData) {
    if (typeof clonedData[key] === 'object' && clonedData[key] !== null) {
      // Recursively redact nested objects
      clonedData[key] = redactSensitiveData(clonedData[key]);
    } else if (
      sensitiveFields.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      )
    ) {
      // Redact sensitive field values
      clonedData[key] = '[REDACTED]';
    }
  }
  
  return clonedData;
}

// Express middleware for audit logging
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  // Get original URL path and HTTP method
  const { method, originalUrl, ip } = req;
  
  // Skip some paths that would generate too much noise
  if (
    originalUrl.startsWith('/attached_assets') || 
    originalUrl.startsWith('/static') ||
    originalUrl.includes('favicon.ico')
  ) {
    return next();
  }
  
  // Get the timestamp before processing
  const startTime = new Date();
  
  // Get operation type
  const operationType = classifyOperation(req);
  
  // Safely get user ID if available
  const userId = req.user ? (req.user as any).id : 'unauthenticated';
  
  // Store the original end method to intercept it
  const originalEnd = res.end;
  
  // Override the end method to log the response
  (res as any).end = function(chunk: any, encoding: string) {
    // Restore the original end method
    res.end = originalEnd;
    
    // Call the original end method
    res.end(chunk, encoding);
    
    // Calculate request processing time
    const endTime = new Date();
    const processingTime = endTime.getTime() - startTime.getTime();
    
    // Log relevant request information
    const logData = {
      timestamp: startTime.toISOString(),
      userId,
      ip,
      method,
      path: originalUrl,
      statusCode: res.statusCode,
      processingTime,
      userAgent: req.headers['user-agent'],
      operationType
    };
    
    // Determine log level based on status code
    if (res.statusCode >= 500) {
      auditLogger.error('Server error', logData);
    } else if (res.statusCode >= 400) {
      auditLogger.warn('Client error', logData);
    } else {
      auditLogger.info('Request processed', logData);
    }
  };
  
  next();
}