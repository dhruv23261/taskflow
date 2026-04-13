// ─────────────────────────────────────────────
// src/routes/auth.routes.js
// POST /auth/register — create account
// POST /auth/login    — return JWT token
// ─────────────────────────────────────────────

const { Router } = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');

const router = Router();

// ── Validators ──────────────────────────────────

const registerValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .isLength({ min: 2, max: 100 }).withMessage('name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('is required')
    .isEmail().withMessage('must be a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('password is required')
    .isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty().withMessage('is required')
    .isEmail().withMessage('must be a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('password is required'),
];

// ── Route Definitions ───────────────────────────

// POST /auth/register
router.post(
  '/register',
  validate(registerValidators),            // validate → controller (only if valid)
  authController.register
);

// POST /auth/login
router.post(
  '/login',
  validate(loginValidators),
  authController.login
);

module.exports = router;
