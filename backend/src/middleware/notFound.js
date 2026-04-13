// ─────────────────────────────────────────────
// src/middleware/notFound.js — 404 Handler
// ─────────────────────────────────────────────

/**
 * Catches any request that didn't match a route.
 * Must be registered AFTER all other routes.
 */
function notFound(req, res) {
  res.status(404).json({ error: 'not found' });
}

module.exports = { notFound };
