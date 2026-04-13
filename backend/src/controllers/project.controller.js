// ─────────────────────────────────────────────
// src/controllers/project.controller.js
// ─────────────────────────────────────────────

const db = require('../lib/db');
const { logger } = require('../utils/logger');

async function listProjects(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT 
        p.id, p.name, p.description, p.created_at as "createdAt", p.owner_id as "ownerId",
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as owner,
        (SELECT count(*)::int FROM tasks t WHERE t.project_id = p.id) as "total_tasks",
        (SELECT count(*)::int FROM tasks t WHERE t.project_id = p.id AND t.status = 'done') as "completed_tasks"
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.owner_id = $1 
         OR EXISTS (SELECT 1 FROM tasks t WHERE t.project_id = p.id AND t.assignee_id = $1)
      ORDER BY p.created_at DESC
      `,
      [userId]
    );

    const projects = result.rows.map(row => {
      row._count = { 
        tasks: row.total_tasks,
        completed: row.completed_tasks 
      };
      delete row.total_tasks;
      delete row.completed_tasks;
      return row;
    });

    return res.json({ projects });
  } catch (error) {
    next(error);
  }
}

async function createProject(req, res, next) {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `
      WITH inserted AS (
        INSERT INTO projects (name, description, owner_id)
        VALUES ($1, $2, $3)
        RETURNING id, name, description, owner_id as "ownerId", created_at as "createdAt"
      )
      SELECT 
        i.*,
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as owner
      FROM inserted i
      JOIN users u ON i."ownerId" = u.id
      `,
      [name, description || null, userId]
    );

    const project = result.rows[0];
    logger.info('Project created', { projectId: project.id, ownerId: userId });

    return res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

async function getProject(req, res, next) {
  try {
    const { id } = req.params;

    const projResult = await db.query(
      `
      SELECT 
        p.id, p.name, p.description, p.owner_id as "ownerId", p.created_at as "createdAt",
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as owner
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
      `,
      [id]
    );

    if (projResult.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    const project = projResult.rows[0];

    const tasksResult = await db.query(
      `
      SELECT 
        t.id, t.title, t.description, t.status, t.priority, t.due_date as "dueDate", 
        t.project_id as "projectId", t.assignee_id as "assigneeId",
        t.created_at as "createdAt", t.updated_at as "updatedAt",
        CASE WHEN t.assignee_id IS NOT NULL THEN
          json_build_object('id', u.id, 'name', u.name, 'email', u.email)
        ELSE null END as assignee
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = $1
      ORDER BY t.created_at DESC
      `,
      [id]
    );

    project.tasks = tasksResult.rows;

    return res.json(project);
  } catch (error) {
    next(error);
  }
}

async function updateProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, description } = req.body;

    const projCheck = await db.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (projCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    if (projCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    const updates = [];
    const values = [];
    let i = 1;

    if (name !== undefined) {
      updates.push(`name = $${i++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${i++}`);
      values.push(description);
    }

    if (updates.length > 0) {
      values.push(id);
      await db.query(`UPDATE projects SET ${updates.join(', ')} WHERE id = $${i}`, values);
    }

    // Return the updated project with owner info
    const getProj = await db.query(
      `
      SELECT 
        p.id, p.name, p.description, p.owner_id as "ownerId", p.created_at as "createdAt",
        json_build_object('id', u.id, 'name', u.name, 'email', u.email) as owner
      FROM projects p
      JOIN users u ON p.owner_id = u.id
      WHERE p.id = $1
      `, [id]
    );

    return res.json(getProj.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const projCheck = await db.query('SELECT owner_id FROM projects WHERE id = $1', [id]);
    if (projCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    if (projCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({ error: 'forbidden' });
    }

    await db.query('DELETE FROM projects WHERE id = $1', [id]);
    logger.info('Project deleted', { projectId: id, deletedBy: userId });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}

async function getProjectStats(req, res, next) {
  try {
    const { id } = req.params;

    const projCheck = await db.query('SELECT 1 FROM projects WHERE id = $1', [id]);
    if (projCheck.rowCount === 0) {
      return res.status(404).json({ error: 'not found' });
    }

    const statusCounts = await db.query(
      `SELECT status, count(*)::int FROM tasks WHERE project_id = $1 GROUP BY status`,
      [id]
    );

    const assigneeCounts = await db.query(
      `
      SELECT t.assignee_id, count(*)::int as c, 
        (SELECT json_build_object('id', u.id, 'name', u.name, 'email', u.email) FROM users u WHERE u.id = t.assignee_id) as udata
      FROM tasks t 
      WHERE project_id = $1 
      GROUP BY t.assignee_id
      `,
      [id]
    );

    const byStatus = {};
    statusCounts.rows.forEach(r => { byStatus[r.status] = r.count; });

    const byAssignee = assigneeCounts.rows.map(r => ({
      assignee: r.udata || null,
      count: r.c,
    }));

    return res.json({
      projectId: id,
      byStatus: {
        todo: byStatus.todo || 0,
        in_progress: byStatus.in_progress || 0,
        done: byStatus.done || 0,
      },
      byAssignee,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
};
