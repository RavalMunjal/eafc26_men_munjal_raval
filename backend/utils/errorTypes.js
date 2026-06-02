// ─── Custom Error Classes ──────────────────────────────────────────────────────
// Use these instead of plain Error to carry status codes automatically
// errorMiddleware will handle these and send proper responses

/**
 * Base App Error — all custom errors extend this
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // marks it as a known/expected error

    // Capture stack trace (excludes constructor itself)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request — invalid input format
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized — missing or invalid auth token
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized. Please login.') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden — authenticated but not allowed
 */
class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden. Insufficient permissions.') {
    super(message, 403);
  }
}

/**
 * 404 Not Found — resource does not exist
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * 409 Conflict — duplicate resource
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
  }
}

/**
 * 422 Unprocessable Entity — validation failed
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 422);
  }
}

/**
 * 429 Too Many Requests — rate limit exceeded
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
};
