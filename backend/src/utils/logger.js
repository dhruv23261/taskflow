// ─────────────────────────────────────────────
// src/utils/logger.js — Structured Logger
//
// Wraps console with a simple structured logger.
// In production you'd swap this for pino or winston
// but for clarity, this stays dependency-light.
// ─────────────────────────────────────────────

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Level order — lower number = more verbose
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level) {
  return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

function formatMessage(level, message, meta = {}) {
  return JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    message,
    ...meta,                               // spread any extra context
  });
}

const logger = {
  debug: (msg, meta) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', msg, meta));
  },
  info: (msg, meta) => {
    if (shouldLog('info')) console.info(formatMessage('info', msg, meta));
  },
  warn: (msg, meta) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', msg, meta));
  },
  error: (msg, meta) => {
    if (shouldLog('error')) console.error(formatMessage('error', msg, meta));
  },
};

module.exports = { logger };
