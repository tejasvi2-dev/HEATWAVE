/**
 * Global error-handling middleware for Express.
 * Must be registered AFTER all routes so it can catch unhandled errors.
 *
 * Provides a consistent JSON error response shape:
 * {
 *   success: false,
 *   error: { message, code, stack? }
 * }
 */

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log the full error in development
  console.error('❌ Unhandled error:', err);

  const statusCode = err.statusCode || err.status || 500;

  const response = {
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      code: err.code || 'SERVER_ERROR',
    },
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    response.error.message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    response.error.code = 'VALIDATION_ERROR';
    return res.status(400).json(response);
  }

  // Mongoose cast error (bad ObjectId, etc.)
  if (err.name === 'CastError') {
    response.error.message = `Invalid ${err.path}: ${err.value}`;
    response.error.code = 'CAST_ERROR';
    return res.status(400).json(response);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    response.error.message = `Duplicate value for field(s): ${field}`;
    response.error.code = 'DUPLICATE_KEY';
    return res.status(409).json(response);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
