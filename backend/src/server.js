// ─────────────────────────────────────────────
// src/server.js — Application Entry Point
// Bootstraps Express, loads routes, starts server
// ─────────────────────────────────────────────

require('dotenv').config();              // load .env variables first

const app = require('./app');
const { logger } = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// ── Start HTTP server ──────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`🚀 TaskFlow API running on port ${PORT}`);
  logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ── Graceful Shutdown ──────────────────────────
// When Docker sends SIGTERM (on container stop), we finish
// in-flight requests before exiting instead of hard-killing.

const shutdown = (signal) => {
  logger.info(`📴 ${signal} received — shutting down gracefully...`);

  server.close(() => {
    logger.info('✅ HTTP server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds if something is stuck
  setTimeout(() => {
    logger.error('⛔ Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
