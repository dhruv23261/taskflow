// ─────────────────────────────────────────────
// src/routes/task.routes.js
//
// Individual task operations (not nested under project):
//   PATCH  /tasks/:id   update any field
//   DELETE /tasks/:id   delete task
// ─────────────────────────────────────────────

const { Router } = require('express');
const { body } = require('express-validator');

const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

// All task routes require valid JWT
router.use(authenticate);

// ── Validators ──────────────────────────────────

const updateTaskValidators = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('title cannot be empty')
    .isLength({ max: 300 }).withMessage('title must be under 300 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('must be todo, in_progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('must be low, medium, or high'),

  body('due_date')
    .optional({ nullable: true })        // allow null to clear due date
    .isISO8601().withMessage('must be a valid date (ISO 8601)'),

  body('assignee_id')
    .optional({ nullable: true })        // allow null to unassign
    .isUUID().withMessage('must be a valid UUID'),
];

// ── Routes ───────────────────────────────────────

router.patch('/:id', validate(updateTaskValidators), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
