const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Require authentication for fetching users
router.use(authenticate);

router.get('/', userController.getAllUsers);

module.exports = router;
