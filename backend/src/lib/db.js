// ─────────────────────────────────────────────
// src/lib/db.js — PostgreSQL Pool Connection
// ─────────────────────────────────────────────

const { Pool } = require('pg');
const { logger } = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
