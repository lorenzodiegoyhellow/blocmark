import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';
import winston from 'winston';

// Configure Winston logger for validation issues
const validationLogger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'validation-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/validation.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Middleware to check for validation errors and format the response
// Define extended ValidationError with the fields we need
interface ExtendedValidationError {
  param: string;
  msg: string;
  location: string;
  value: any;
}

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation errors
    validationLogger.warn('Validation error', {
      ip: req.ip,
      path: req.path,
      method: req.method,
      userAgent: req.headers['user-agent'],
      errors: errors.array()
    });
    
    // Cast to our extended error type that includes the fields we need - using a safe two-step approach
    const validationErrors = errors.array().map(err => err as unknown as ExtendedValidationError);
    
    return res.status(400).json({
      message: 'Validation failed',
      errors: validationErrors.map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  
  next();
};

// Common validation rules that can be reused across routes
export const commonValidators = {
  // User-related validation
  username: body('username')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  
  password: body('password')
    .isString()
    .isLength({ min: 8, max: 100 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Must be a valid email address'),
  
  // Booking-related validation
  bookingId: param('bookingId')
    .isInt({ min: 1 })
    .withMessage('Booking ID must be a positive integer'),
  
  startDate: body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  
  endDate: body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  
  guestCount: body('guestCount')
    .isInt({ min: 1, max: 100 })
    .withMessage('Guest count must be between 1 and 100'),
  
  // Location-related validation
  locationId: param('locationId')
    .isInt({ min: 1 })
    .withMessage('Location ID must be a positive integer'),
  
  title: body('title')
    .isString()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  
  description: body('description')
    .isString()
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  
  price: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  // Pagination-related validation
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  // Search-related validation
  searchQuery: query('q')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  // Sorting and filtering
  sortBy: query('sortBy')
    .optional()
    .isIn(['price', 'createdAt', 'rating', 'popularity'])
    .withMessage('Invalid sort field'),
  
  sortOrder: query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"'),
  
  // Common ID validation
  userId: param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),

  // CSRF token validation
  csrfToken: body('_csrf')
    .optional()
    .isString()
    .withMessage('CSRF token must be provided'),

  // Date range validation
  dateRange: [
    query('from')
      .optional()
      .isISO8601()
      .withMessage('From date must be a valid ISO 8601 date'),
    query('to')
      .optional()
      .isISO8601()
      .withMessage('To date must be a valid ISO 8601 date')
  ],
  
  // Custom validators to chain together common patterns
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  
  sorting: [
    query('sortBy')
      .optional()
      .isIn(['price', 'createdAt', 'rating', 'popularity'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be "asc" or "desc"')
  ]
};