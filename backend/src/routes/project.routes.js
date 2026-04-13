// ─────────────────────────────────────────────
// src/routes/project.routes.js
//
// All routes require: Authorization: Bearer <token>
//
// GET    /projects         list accessible projects
// POST   /projects         create project
// GET    /projects/:id     get project + tasks
// PATCH  /projects/:id     update project (owner only)
// DELETE /projects/:id     delete project (owner only)
// GET    /projects/:id/stats  task count stats (bonus)
// ─────────────────────────────────────────────

const { Router } = require('express');
const { body } = require('express-validator');

const projectController = require('../controllers/project.controller');
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = Router();

// All project routes require valid JWT
router.use(authenticate);

// ── Validators ──────────────────────────────────

const createProjectValidators = [
  body('name')
    .trim()
    .notEmpty().withMessage('name is required')
    .isLength({ max: 200 }).withMessage('name must be under 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('description must be under 1000 characters'),
];

const updateProjectValidators = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('name cannot be empty')
    .isLength({ max: 200 }).withMessage('name must be under 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('description must be under 1000 characters'),
];

const createTaskValidators = [
  body('title')
    .trim()
    .notEmpty().withMessage('title is required')
    .isLength({ max: 300 }).withMessage('title must be under 300 characters'),

  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'done']).withMessage('status must be todo, in_progress, or done'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high']).withMessage('priority must be low, medium, or high'),

  body('due_date')
    .optional()
    .isISO8601().withMessage('due_date must be a valid date (ISO 8601)'),

  body('assignee_id')
    .optional()
    .isUUID().withMessage('assignee_id must be a valid UUID'),
];

// ── Routes ───────────────────────────────────────

router.get('/', projectController.listProjects);
router.post('/', validate(createProjectValidators), projectController.createProject);
router.get('/:id', projectController.getProject);
router.patch('/:id', validate(updateProjectValidators), projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Bonus stats endpoint
router.get('/:id/stats', projectController.getProjectStats);

// Nested task routes under a project
router.get('/:id/tasks', taskController.listTasks);
router.post('/:id/tasks', validate(createTaskValidators), taskController.createTask);

module.exports = router;
