// ─────────────────────────────────────────────
// src/controllers/auth.controller.js
//
// Handles: POST /auth/register, POST /auth/login
// ─────────────────────────────────────────────

const bcrypt = require('bcryptjs');
const db = require('../lib/db');
const { signToken } = require('../utils/jwt');
const { logger } = require('../utils/logger');

/**
 * POST /auth/register
 * Body: { name, email, password }
 */
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // Check if email already taken
    const existing = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(400).json({
        error: 'validation failed',
        fields: { email: 'email is already registered' },
      });
    }

    // Hash password — cost 12
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const result = await db.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email, created_at as "createdAt"`,
      [name, email, hashedPassword]
    );
    const user = result.rows[0];

    // Sign JWT
    const token = signToken({ id: user.id, email: user.email });

    logger.info('User registered', { userId: user.id, email: user.email });

    return res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, name, email, password, created_at as "createdAt" FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    const validPassword = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !validPassword) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    // Don't send password hash back
    delete user.password;

    const token = signToken({ id: user.id, email: user.email });

    logger.info('User logged in', { userId: user.id, email: user.email });

    return res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };
