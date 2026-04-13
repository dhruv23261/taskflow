// ─────────────────────────────────────────────
// src/middleware/errorHandler.js — Global Error Handler
// ─────────────────────────────────────────────

const { logger } = require('../utils/logger');

/**
 * Global error handler — Express calls this when next(err) is used.
 * Must have 4 parameters to be recognized by Express as error middleware.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Log full error with stack in development
  logger.error('Unhandled error', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Use status from error object if set, else 500
  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    error: err.message || 'internal server error',
  });
}

module.exports = { errorHandler };
