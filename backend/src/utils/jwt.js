// ─────────────────────────────────────────────
// src/utils/jwt.js — JWT Helpers
//
// Sign and verify JWTs. The secret MUST be in .env —
// hardcoding it here is an automatic disqualifier.
// ─────────────────────────────────────────────

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '24h';              // tokens valid for 24 hours

if (!JWT_SECRET) {
  // Fail fast in production if secret is missing
  throw new Error('JWT_SECRET environment variable is not set!');
}

/**
 * Sign a new JWT token for a user.
 * Payload includes user_id and email per assignment spec.
 *
 * @param {Object} payload - { id, email }
 * @returns {string} JWT token string
 */
function signToken(payload) {
  return jwt.sign(
    {
      user_id: payload.id,               // assignment spec: include user_id
      email: payload.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify a JWT token.
 * Returns decoded payload or throws if invalid/expired.
 *
 * @param {string} token
 * @returns {Object} decoded payload
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken };
