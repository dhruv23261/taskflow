// ─────────────────────────────────────────────
// src/middleware/validate.js — Request Validation
//
// Uses express-validator to validate request bodies.
// Returns 400 with structured field errors on failure.
// ─────────────────────────────────────────────

const { validationResult } = require('express-validator');

/**
 * validate middleware factory
 *
 * Takes an array of express-validator checks and runs them.
 * If any check fails, responds with:
 *   { error: "validation failed", fields: { fieldName: "error message" } }
 *
 * Usage:
 *   router.post('/register', validate(registerValidators), authController.register)
 *
 * @param {Array} validators - express-validator check chain array
 */
function validate(validators) {
  return async (req, res, next) => {
    // Run all validators
    await Promise.all(validators.map((v) => v.run(req)));

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Convert errors array → { fieldName: "first error message" } object
      const fields = {};
      errors.array().forEach((err) => {
        if (!fields[err.path]) {
          fields[err.path] = err.msg;    // only keep the first error per field
        }
      });

      return res.status(400).json({
        error: 'validation failed',
        fields,
      });
    }

    next();                              // validation passed
  };
}

module.exports = { validate };
