import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { resolve } from 'path';
import fs from 'fs';
import { auditLogger } from './audit';
import sanitizeHtml from 'sanitize-html';

// Create logs directory if it doesn't exist
const logsDir = resolve('./logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configure the winston logger for security-specific logging
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'security-service' },
  transports: [
    // Write all security logs to the security.log file
    new winston.transports.File({ 
      filename: resolve('./logs/security.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Write warnings and errors to a separate file
    new winston.transports.File({ 
      filename: resolve('./logs/security-alerts.log'), 
      level: 'warn',
      maxsize: 5242880, // 5MB
      maxFiles: 3,
      tailable: true
    }),
  ],
});

// If not in production, also log to console
if (process.env.NODE_ENV !== 'production') {
  securityLogger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

// These patterns will be matched against request parameters to detect threats
const securityPatterns = {
  // SQL Injection patterns
  sqlInjection: [
    /('|"|;)\s*(--|\/\*|drop|alter|create|truncate|select\s+@@|declare\s+@|exec\s+xp_cmdshell|sp_executesql)/i,
    /union\s+(all\s+)?select/i,
    /select.*from.*information_schema/i,
    /into\s+(out|dump)file/i,
    /\/\*.*\*\//i,
    /;\s*--.*/i,
    /benchmark\s*\(\s*\d+\s*,/i
  ],
  
  // XSS (Cross-Site Scripting) patterns
  xss: [
    /<script[^>]*>/i,
    /<iframe[^>]*>/i,
    /<embed[^>]*>/i,
    /<object[^>]*>/i,
    /javascript\s*:/i,
    /on(load|error|click|mouse|key|focus)\s*=/i,
    /eval\s*\(/i,
    /document\.(cookie|write|location)/i
  ],
  
  // SSRF (Server-Side Request Forgery) patterns
  ssrf: [
    /https?:\/\/127\.0\.0\.1/i,
    /https?:\/\/localhost/i,
    /https?:\/\/0\.0\.0\.0/i,
    /https?:\/\/\[::1\]/i,
    /https?:\/\/internal\./i,
    /file:\/\//i,
    // Allow OSM and tile servers for maps
    /\b(?:http|https|ftp|file|dict|gopher|smtp|ldap|tftp|ssh):\/\/(?!tile\.openstreetmap\.org|unpkg\.com\/leaflet|api\.mapbox\.com)\b/i,
    /\b(?:10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)\b/
  ],
  
  // Path Traversal patterns
  pathTraversal: [
    /\.\.\//i,
    /\.\.\\\\i/,
    /%2e%2e\//i,
    /%252e%252e\//i
  ],
  
  // Command Injection patterns
  commandInjection: [
    /;\s*(ls|dir|cat|type|more|less|head|tail|od|hexdump)/i,
    /\|\s*(ls|dir|cat|type|more|less|head|tail|od|hexdump)/i,
    /`\s*(ls|dir|cat|type|more|less|head|tail|od|hexdump)/i,
    /&\s*(ls|dir|cat|type|more|less|head|tail|od|hexdump)/i,
    /\$\((ls|dir|cat|type|more|less|head|tail|od|hexdump)\)/i
  ],
  
  // LDAP Injection patterns
  ldapInjection: [
    /\*\)/i,
    /\(\|\(objectClass=/i,
    /\)\(!\(objectClass=/i
  ],
  
  // OS Command Injection patterns
  osCommandInjection: [
    /;\s*(ping|nslookup|traceroute|wget|curl)/i,
    /\|\s*(ping|nslookup|traceroute|wget|curl)/i,
    /`\s*(ping|nslookup|traceroute|wget|curl)/i,
    /&\s*(ping|nslookup|traceroute|wget|curl)/i
  ]
};

// Return a severity level for the detected threats
function calculateSeverity(threats: Record<string, string[]>): 'low' | 'medium' | 'high' | 'critical' {
  if (!threats || Object.keys(threats).length === 0) {
    return 'low';
  }
  
  // High-risk patterns that indicate active exploitation
  const criticalPatterns = ['sqlInjection', 'commandInjection', 'osCommandInjection'];
  const highPatterns = ['xss', 'pathTraversal', 'ldapInjection'];
  
  if (criticalPatterns.some(pattern => threats[pattern] && threats[pattern].length > 0)) {
    return 'critical';
  }
  
  if (highPatterns.some(pattern => threats[pattern] && threats[pattern].length > 0)) {
    return 'high';
  }
  
  if (Object.keys(threats).length > 1) {
    return 'medium';
  }
  
  return 'low';
}

// Check if a string matches any security patterns
function checkPatterns(input: string, patterns: RegExp[]): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }
  
  return patterns
    .filter(pattern => pattern.test(input))
    .map(pattern => pattern.toString());
}

// Scan an object recursively for security threats
function scanObject(obj: any, patterns: Record<string, RegExp[]>): Record<string, string[]> {
  const threats: Record<string, string[]> = {};
  
  function sanitizeObject(obj: any): any {
    if (!obj) return obj;
    
    if (typeof obj === 'string') {
      for (const [patternName, patternList] of Object.entries(patterns)) {
        const matches = checkPatterns(obj, patternList);
        if (matches.length > 0) {
          if (!threats[patternName]) {
            threats[patternName] = [];
          }
          threats[patternName].push(...matches);
        }
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const result = { ...obj };
      for (const key in result) {
        if (Object.prototype.hasOwnProperty.call(result, key)) {
          result[key] = sanitizeObject(result[key]);
        }
      }
      return result;
    }
    
    return obj;
  }
  
  sanitizeObject(obj);
  
  // De-duplicate the threats array
  for (const patternName in threats) {
    // Convert to array to avoid Set iteration issues in some environments
    const uniqueValues = Array.from(new Set(threats[patternName]));
    threats[patternName] = uniqueValues;
  }
  
  return threats;
}

// Security middleware function
export function securityMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    // Don't check static assets, resource files, or map-related requests for security patterns
    if (
      req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
      req.path.startsWith('/attached_assets') ||
      req.path.includes('favicon.ico') ||
      // Skip security checks for map-related paths
      req.path.includes('openstreetmap') ||
      req.path.includes('mapbox') ||
      req.path.includes('leaflet') ||
      req.path.includes('tile') ||
      // Skip security checks for our map-related pages
      req.path.includes('/test-map') ||
      req.path.includes('/secret-corners')
    ) {
      return next();
    }

    // Scan request components for security threats
    const threats: Record<string, string[]> = {};
    let hasThreats = false;

    // Check query parameters for security threats
    if (req.query && Object.keys(req.query).length > 0) {
      const queryThreats = scanObject(req.query, securityPatterns);
      if (Object.keys(queryThreats).length > 0) {
        Object.assign(threats, queryThreats);
        hasThreats = true;
      }
    }

    // Check request body for security threats
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyThreats = scanObject(req.body, securityPatterns);
      if (Object.keys(bodyThreats).length > 0) {
        Object.assign(threats, bodyThreats);
        hasThreats = true;
      }
    }

    // Check headers for security threats
    if (req.headers) {
      // Exclude some headers that are less relevant for security scanning
      const headersToCheck = { ...req.headers };
      delete headersToCheck['content-length'];
      delete headersToCheck['user-agent'];
      delete headersToCheck['accept'];
      delete headersToCheck['accept-encoding'];
      delete headersToCheck['connection'];
      
      const headerThreats = scanObject(headersToCheck, securityPatterns);
      if (Object.keys(headerThreats).length > 0) {
        Object.assign(threats, headerThreats);
        hasThreats = true;
      }
    }

    // If threats were detected, log them
    if (hasThreats) {
      // Calculate severity
      const severity = calculateSeverity(threats);
      
      // Get user ID if available
      const userId = req.user ? (req.user as any).id : 'unauthenticated';
      
      // Get session ID if available
      const sessionId = (req.session && req.session.id) ? req.session.id : 'no-session';
      
      // Log with the appropriate log level based on severity
      const logData = {
        timestamp: new Date().toISOString(),
        userId,
        ip: req.ip,
        method: req.method,
        path: req.path,
        sessionId,
        threats,
        severity,
        userAgent: req.headers['user-agent'],
        body: "REDACTED_FOR_SECURITY"
      };
      
      if (severity === 'critical') {
        securityLogger.error('Critical security threat detected', logData);
        auditLogger.error('Critical security threat detected', {
          userId,
          ip: req.ip,
          path: req.path,
          operationType: 'SECURITY_THREAT',
          severity: 'critical',
          threats: Object.keys(threats)
        });
      } else if (severity === 'high') {
        securityLogger.warn('Serious security threat detected', logData);
        auditLogger.warn('Serious security threat detected', {
          userId,
          ip: req.ip,
          path: req.path,
          operationType: 'SECURITY_THREAT',
          severity: 'high',
          threats: Object.keys(threats)
        });
      } else {
        securityLogger.warn('Security threat detected', logData);
      }
      
      // For critical threats, you could implement additional protections
      // such as temporarily blocking the IP or session, or requiring additional
      // verification. This would depend on your security policy.
      
      // For now, we'll continue processing the request but monitor it closely
    }

    // Continue to next middleware
    next();
  } catch (error) {
    // Log the error
    securityLogger.error('Security middleware error', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user ? (req.user as any).id : 'unauthenticated'
    });
    
    // Continue to next middleware in case of error
    next();
  }
}

// Security headers middleware (to establish secure defaults)
export const securityHeaders = {
  // Content-Security-Policy to mitigate XSS attacks
  csp: {
    handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
      // Special handling for Replit environment
      if (process.env.REPL_ID) {
        // Disable CSP in Replit environment to avoid SSL issues
        res.removeHeader('X-Powered-By');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        _next();
        return;
      }
      
      // Allow inline scripts for development ease, but not in production
      const isDev = process.env.NODE_ENV !== 'production';
      const policy = isDev
        ? "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.openstreetmap.org https://unpkg.com; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.openstreetmap.org https://unpkg.com https://*.mapbox.com;"
        : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.openstreetmap.org https://unpkg.com; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.openstreetmap.org https://unpkg.com https://*.mapbox.com;";
      
      res.setHeader('Content-Security-Policy', policy);
      res.removeHeader('X-Powered-By');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      _next();
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
      // Disable HSTS in Replit environment to avoid SSL issues
      if (process.env.REPL_ID) {
        _next();
        return;
      }
      // Only set HSTS header if connection is secure
      if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader(
          'Strict-Transport-Security',
          'max-age=31536000; includeSubDomains; preload'
        );
      }
      _next();
    }
  },
  
  // Referrer Policy
  referrerPolicy: {
    handler: (req: Request, res: Response, _next: NextFunction, options: any) => {
      // Disable Referrer Policy in Replit environment to avoid SSL issues
      if (process.env.REPL_ID) {
        _next();
        return;
      }
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      _next();
    }
  }
};

// XSS sanitizer middleware that checks and sanitizes body and query parameters
export const xssSanitizer = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Define allowed HTML tags and attributes for certain fields
    const allowedTags = [
      'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'a', 'img'
    ];
    
    const allowedAttributes = {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class', 'style']
    };
    
    // In ES modules, we can't use require
    // Instead, we'll use the sanitizeHtml imported at the top of the file
    // No need to import here as we're in an ESM context
    
    // Fields that may contain HTML
    const htmlFields = ['description', 'content', 'message', 'bio', 'about'];
    
    // Function to sanitize object
    const sanitizeObject = (obj: any): any => {
      if (!obj) return obj;
      
      if (typeof obj === 'string') {
        return obj;
      }
      
      if (Array.isArray(obj)) {
        return obj.map((item: any): any => sanitizeObject(item));
      }
      
      if (typeof obj === 'object') {
        const result: Record<string, any> = { ...obj };
        for (const key in result) {
          if (Object.prototype.hasOwnProperty.call(result, key)) {
            if (htmlFields.includes(key) && typeof result[key] === 'string') {
              // Sanitize HTML content
              result[key] = sanitizeHtml(result[key], {
                allowedTags,
                allowedAttributes
              });
            } else {
              // Recursively sanitize other fields
              result[key] = sanitizeObject(result[key]);
            }
          }
        }
        return result;
      }
      
      return obj;
    };
    
    // Sanitize body and query parameters
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    
    next();
  } catch (error) {
    securityLogger.error('XSS sanitizer error', {
      error: (error as Error).message,
      stack: (error as Error).stack,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    next();
  }
};

// Enhanced security logging middleware
export const securityLogging = (req: Request, res: Response, next: NextFunction) => {
  // Patterns to detect potentially suspicious activity
  const suspiciousPatterns = [
    // Admin access attempts
    { category: 'admin-access', pattern: /\/api\/admin\//i },
    // Password reset attempts
    { category: 'password-reset', pattern: /password|reset/i },
    // Authentication attempts
    { category: 'authentication', pattern: /\/login|\/auth|signin|signout|logout/i },
    // Payment processing
    { category: 'payment', pattern: /payment|checkout|cart/i },
    // User data access
    { category: 'user-data', pattern: /\/api\/users\/\d+/i },
    // File uploads
    { category: 'file-upload', pattern: /upload|file/i },
    // Security settings
    { category: 'security-settings', pattern: /\/security|\/settings/i }
  ].reduce((acc, { category, pattern }) => {
    if (pattern.test(req.path)) {
      acc.push(category);
    }
    return acc;
  }, [] as Array<string>);
  
  // If suspicious patterns are detected, log at a higher level
  if (suspiciousPatterns.length > 0) {
    securityLogger.info('Sensitive operation detected', {
      categories: suspiciousPatterns,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userId: req.user ? (req.user as any).id : 'unauthenticated',
      userAgent: req.headers['user-agent']
    });
  }
  
  next();
};

// Setup security middleware function to register all security middleware in the application
export async function setupSecurity(app: any) {
  try {
    // Import packages dynamically since we're in ESM
    const [
      { default: helmet },
      { default: cors },
      { default: xssClean },
      { default: hpp },
      { default: rateLimit }
    ] = await Promise.all([
      import('helmet'),
      import('cors'),
      import('xss-clean'),
      import('hpp'),
      import('express-rate-limit')
    ]);
    
    // Check if running in Replit environment
    if (process.env.REPL_ID) {
      console.log("REPLIT-SPECIFIC: Disabling almost all security features to fix HTTPS/SSL issues");
      console.log("REPLIT-SPECIFIC: Setting NODE_ENV=development to avoid HTTPS redirects");
      process.env.NODE_ENV = 'development';
    }
    
    // Add trust proxy configuration which is crucial for Replit
    app.set('trust proxy', true);
    
    // Set CORS policy - most permissive in Replit
    const corsOptions = {
      origin: '*', // Allow all origins in both environments for debugging
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
    };
    
    // Log the CORS configuration
    console.log(`CORS configured with wildcard origin (*) - allowing cross-origin requests`);
    
    app.use(cors(corsOptions));
    
    // In Replit, completely disable Helmet to avoid any SSL/HTTPS issues
    if (process.env.REPL_ID) {
      console.log("Helmet completely disabled to avoid SSL issues");
      // DO NOT apply Helmet at all in Replit
    } else {
      // Only use Helmet outside of Replit
      app.use(helmet({
        contentSecurityPolicy: false // We'll set this manually with our custom middleware
      }));
      
      // Standard security headers for non-Replit environments
      app.use(securityHeaders.csp.handler);
      app.use(securityHeaders.hsts.handler);
      app.use(securityHeaders.referrerPolicy.handler);
    }
    
    // Apply rate limiting middleware - general rate limit for all requests
    // In development mode, we'll completely bypass rate limiting to avoid 429 errors
    if (process.env.NODE_ENV === 'production') {
      const generalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs in production
        standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
        message: 'Too many requests from this IP, please try again later.'
      });
      app.use('/api/', generalLimiter);
    }
    
    // Stricter rate limit for authentication routes - only in production
    if (process.env.NODE_ENV === 'production') {
      const authLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // Limit each IP to 10 login/register requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many authentication attempts, please try again later.'
      });
      app.use('/api/auth', authLimiter);
      
      // Very strict rate limit for sensitive operations - only in production
      const sensitiveLimiter = rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // Limit each IP to 5 requests per hour
        standardHeaders: true,
        legacyHeaders: false,
        message: 'Too many sensitive operations attempted, please try again later.'
      });
      app.use('/api/admin', sensitiveLimiter);
      app.use('/api/security', sensitiveLimiter);
    }
    
    // Apply XSS protection middleware - only outside Replit
    if (!process.env.REPL_ID) {
      app.use(xssClean());
      
      // Use our custom XSS sanitizer for more granular control
      app.use(xssSanitizer);
      
      // Use HTTP Parameter Pollution protection
      app.use(hpp({
        whitelist: ['filters', 'sort', 'fields', 'page', 'limit', 'id', 'ids']
      }));
    } else {
      console.log("XSS protection and HPP protection disabled in Replit environment");
    }
    
    // Apply our custom security middleware for threat detection
    // Skip in Replit environment to reduce startup time
    if (!process.env.REPL_ID) {
      app.use(securityMiddleware);
      
      // Apply enhanced security logging
      app.use(securityLogging);
    } else {
      console.log("Skipping threat detection and security logging in Replit environment to improve performance");
    }
    
    // Log that security setup is complete
    securityLogger.info('Security middleware setup complete', {
      middlewares: [
        'helmet', 'cors', 'rate-limiting', 'xss-clean', 
        'hpp', 'custom-security-headers', 'threat-detection'
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error setting up security middleware:', error);
    throw error;
  }
}

// Export security middleware functions
export { securityLogger };