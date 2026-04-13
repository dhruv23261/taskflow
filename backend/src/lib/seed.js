// ─────────────────────────────────────────────
// src/lib/seed.js — TaskFlow Database Seed
// ─────────────────────────────────────────────
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // 1. Demo User
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    // Insert user, conflict do nothing (or we can just check first)
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
    let user;
    if (userCheck.rowCount === 0) {
      const uRes = await db.query(
        `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`,
        ['Test User', 'test@example.com', hashedPassword]
      );
      user = uRes.rows[0];
      console.log(`✅ User created: ${user.email}`);
    } else {
      user = userCheck.rows[0];
      console.log(`✅ User already exists: ${user.email}`);
    }

    // 2. Demo Project
    const projCheck = await db.query('SELECT * FROM projects WHERE name = $1 AND owner_id = $2', ['Website Redesign', user.id]);
    let project;
    if (projCheck.rowCount === 0) {
      const pRes = await db.query(
        `INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING *`,
        ['Website Redesign', 'Redesign the company website for Q2 launch', user.id]
      );
      project = pRes.rows[0];
      console.log(`✅ Project created: ${project.name}`);
    } else {
      project = projCheck.rows[0];
      console.log(`✅ Project already exists: ${project.name}`);
    }

    // 3. Demo Tasks
    const taskCheck = await db.query('SELECT * FROM tasks WHERE project_id = $1', [project.id]);
    if (taskCheck.rowCount === 0) {
      const now = new Date();
      
      const t1 = db.query(
        `INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Design new homepage layout', 'Create wireframes and high-fidelity mockups for the homepage', 'todo', 'high', project.id, user.id, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)]
      );
      const t2 = db.query(
        `INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Implement authentication flow', 'Build login, register, and JWT logic', 'in_progress', 'high', project.id, user.id, new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)]
      );
      const t3 = db.query(
        `INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        ['Write API documentation', 'Document all REST endpoints', 'done', 'medium', project.id, user.id, new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)]
      );

      await Promise.all([t1, t2, t3]);
      console.log('✅ 3 tasks created (todo, in_progress, done)');
    } else {
      console.log('✅ Tasks already exist');
    }

    console.log('\n🎉 Seed complete!');
    console.log('   Email:    test@example.com');
    console.log('   Password: password123');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
