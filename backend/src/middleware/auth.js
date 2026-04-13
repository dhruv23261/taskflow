// ─────────────────────────────────────────────
// src/middleware/auth.js — JWT Authentication
//
// Protects routes by verifying the Bearer token.
// On success, attaches req.user = { id, email }.
// ─────────────────────────────────────────────

const { verifyToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');

/**
 * authenticate middleware
 *
 * Reads: Authorization: Bearer <token>
 * Sets:  req.user = { id, email } on success
 * Returns 401 if no token or token is invalid/expired
 */
function authenticate(req, res, next) {
  // 1. Extract the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  // 2. Split "Bearer <token>" → get just the token part
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify signature and expiry
    const decoded = verifyToken(token);

    // 4. Attach user info to request for use in controllers
    req.user = {
      id: decoded.user_id,               // matches what signToken puts in payload
      email: decoded.email,
    };

    next();                               // all good — continue to route handler
  } catch (error) {
    // Token is invalid, expired, or tampered with
    logger.warn('Invalid token attempt', { error: error.message });
    return res.status(401).json({ error: 'unauthorized' });
  }
}

module.exports = { authenticate };
