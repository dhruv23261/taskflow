const db = require('../lib/db');
const { logger } = require('../utils/logger');

/**
 * GET /users
 * Returns all registered users
 */
async function getAllUsers(req, res, next) {
  try {
    const result = await db.query(
      'SELECT id, name, email, created_at as "createdAt" FROM users ORDER BY name ASC'
    );
    
    return res.json(result.rows);
  } catch (error) {
    logger.error('Failed to fetch users', { error: error.message });
    next(error);
  }
}

module.exports = {
  getAllUsers,
};
