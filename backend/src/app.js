// ─────────────────────────────────────────────
// src/app.js — Express App Configuration
// Wires together middleware and routes
// ─────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const projectRoutes = require('./routes/project.routes');
const taskRoutes = require('./routes/task.routes');
const userRoutes = require('./routes/user.routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();

// ── CORS ────────────────────────────────────────
// Allow frontend origin(s) to call this API
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// ── Body Parsing ────────────────────────────────
app.use(express.json());                   // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// ── HTTP Request Logging ─────────────────────────
// "dev" format: colored output in development
app.use(morgan('dev'));

// ── Health Check ─────────────────────────────────
// Simple ping endpoint — useful for Docker healthchecks
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────
// All routes are prefixed with /api/v1 for clarity
app.use('/api/v1/auth', authRoutes);           // POST /auth/register, /auth/login
app.use('/api/v1/projects', projectRoutes);    // CRUD for projects
app.use('/api/v1/tasks', taskRoutes);          // PATCH/DELETE for individual tasks
app.use('/api/v1/users', userRoutes);          // Fetch all users

// ── 404 Handler ───────────────────────────────────
// This runs if no route matched
app.use(notFound);

// ── Global Error Handler ──────────────────────────
// Express calls this when next(error) is called
app.use(errorHandler);

module.exports = app;
