/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Creates a standardized error response
 */
const createError = (statusCode, message, error = null) => {
  // Log the error for server-side monitoring
  if (error) {
    console.error(`[${new Date().toISOString()}] Error: ${message}`, error);
  } else {
    console.error(`[${new Date().toISOString()}] Error: ${message}`);
  }
  
  // Don't expose internal errors to the client
  const safeMessage = process.env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : message;
    
  return new ApiError(statusCode, safeMessage);
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 (Internal Server Error) if status code not set
  const statusCode = err.statusCode || 500;
  
  // Log the error with stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Stack:', err.stack);
  }
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      ...(err.errors && { errors: err.errors })
    })
  };
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Async handler to wrap async/await route handlers
 * This eliminates the need for try/catch blocks in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise
    .resolve(fn(req, res, next))
    .catch(next);
};

module.exports = {
  ApiError,
  createError,
  errorHandler,
  notFound,
  asyncHandler
};
