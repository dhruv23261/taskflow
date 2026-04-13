// ─────────────────────────────────────────────
// src/lib/prisma.js — Prisma Client Singleton
//
// We create ONE PrismaClient instance and reuse it
// across the entire app. Creating a new PrismaClient
// per request would exhaust the connection pool fast.
// ─────────────────────────────────────────────

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']          // log SQL in dev
    : ['warn', 'error'],                  // only errors in prod
});

module.exports = prisma;
