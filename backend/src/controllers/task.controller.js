// ─────────────────────────────────────────────
// src/controllers/task.controller.js
// ─────────────────────────────────────────────

const db = require('../lib/db');
const { logger } = require('../utils/logger');

async function listTasks(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { status, assignee, page = 1, limit = 50 } = req.query;

    const projCheck = await db.query('SELECT 1 FROM projects WHERE id = $1', [projectId]);
    if (projCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    const conditions = ['t.project_id = $1'];
    const values = [projectId];
    let i = 2;

    if (status) {
      conditions.push(`t.status = $${i++}`);
      values.push(status);
    }
    if (assignee) {
      conditions.push(`t.assignee_id = $${i++}`);
      values.push(assignee);
    }

    const whereClause = `WHERE ` + conditions.join(' AND ');

    const countRes = await db.query(`SELECT count(*)::int FROM tasks t ${whereClause}`, values);
    const total = countRes.rows[0].count;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // We need to pass the limit and offset using params
    const qValues = [...values, limitNum, offset];
    
    const tasksRes = await db.query(
      `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date as "dueDate", 
        t.project_id as "projectId", t.assignee_id as "assigneeId",
        t.created_at as "createdAt", t.updated_at as "updatedAt",
        CASE WHEN t.assignee_id IS NOT NULL THEN
          json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        ELSE null END as assignee,
        json_build_object('id', p.id, 'name', p.name, 'ownerId', p.owner_id) as project
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${i++} OFFSET $${i++}
      `,
      qValues
    );

    return res.json({
      tasks: tasksRes.rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function createTask(req, res, next) {
  try {
    const { id: projectId } = req.params;
    const { title, description, status, priority, assignee_id, due_date } = req.body;

    const projCheck = await db.query('SELECT 1 FROM projects WHERE id = $1', [projectId]);
    if (projCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    if (assignee_id) {
      const userCheck = await db.query('SELECT 1 FROM users WHERE id = $1', [assignee_id]);
      if (userCheck.rowCount === 0) {
        return res.status(400).json({
          error: 'validation failed',
          fields: { assignee_id: 'user not found' },
        });
      }
    }

    const tStatus = status || 'todo';
    const tPriority = priority || 'medium';
    // Using simple approach instead of CTE for clarity on fetching relations
    const insertRes = await db.query(
      `
      INSERT INTO tasks (title, description, status, priority, project_id, assignee_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [title, description || null, tStatus, tPriority, projectId, assignee_id || null, due_date ? new Date(due_date) : null]
    );

    const taskId = insertRes.rows[0].id;

    // Fetch complete object
    const finalRes = await db.query(
      `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date as "dueDate", 
        t.project_id as "projectId", t.assignee_id as "assigneeId",
        t.created_at as "createdAt", t.updated_at as "updatedAt",
        CASE WHEN t.assignee_id IS NOT NULL THEN
          json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        ELSE null END as assignee,
        json_build_object('id', p.id, 'name', p.name, 'ownerId', p.owner_id) as project
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = $1
      `,
      [taskId]
    );

    logger.info('Task created', { taskId, projectId, createdBy: req.user.id });

    return res.status(201).json(finalRes.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignee_id, due_date } = req.body;

    const taskCheck = await db.query(
      `SELECT t.id, p.owner_id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1`,
      [id]
    );
    if (taskCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    if (assignee_id !== undefined && assignee_id !== null) {
      const userCheck = await db.query('SELECT 1 FROM users WHERE id = $1', [assignee_id]);
      if (userCheck.rowCount === 0) {
        return res.status(400).json({
          error: 'validation failed',
          fields: { assignee_id: 'user not found' },
        });
      }
    }

    const updates = [];
    const values = [];
    let i = 1;

    if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${i++}`); values.push(description); }
    if (status !== undefined) { updates.push(`status = $${i++}`); values.push(status); }
    if (priority !== undefined) { updates.push(`priority = $${i++}`); values.push(priority); }
    if (assignee_id !== undefined) { updates.push(`assignee_id = $${i++}`); values.push(assignee_id); }
    if (due_date !== undefined) { updates.push(`due_date = $${i++}`); values.push(due_date ? new Date(due_date) : null); }

    if (updates.length > 0) {
      updates.push(`updated_at = current_timestamp`);
      values.push(id);
      await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = $${i}`, values);
    }

    const finalRes = await db.query(
      `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date as "dueDate", 
        t.project_id as "projectId", t.assignee_id as "assigneeId",
        t.created_at as "createdAt", t.updated_at as "updatedAt",
        CASE WHEN t.assignee_id IS NOT NULL THEN
          json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        ELSE null END as assignee,
        json_build_object('id', p.id, 'name', p.name, 'ownerId', p.owner_id) as project
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.id = $1
      `,
      [id]
    );

    return res.json(finalRes.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const taskCheck = await db.query(
      `SELECT t.id, t.assignee_id, p.owner_id FROM tasks t JOIN projects p ON t.project_id = p.id WHERE t.id = $1`,
      [id]
    );
    if (taskCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    if (taskCheck.rows[0].owner_id !== userId && taskCheck.rows[0].assignee_id !== userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    await db.query('DELETE FROM tasks WHERE id = $1', [id]);
    logger.info('Task deleted', { taskId: id, deletedBy: userId });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = { listTasks, createTask, updateTask, deleteTask };
