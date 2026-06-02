const { validationResult, body, param } = require('express-validator');

// ─── Run validation & send errors if any ──────────────────────────────────────
// Always use this after your validation rules array
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

// ─── Auth Validation Rules ─────────────────────────────────────────────────────
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2–50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  validate,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),

  validate,
];

// ─── Conflict Validation Rules ────────────────────────────────────────────────
const validateConflict = [
  body('conflictId')
    .trim()
    .notEmpty().withMessage('Conflict ID is required'),

  body('name')
    .trim()
    .notEmpty().withMessage('Conflict name is required')
    .isLength({ max: 200 }).withMessage('Name cannot exceed 200 characters'),

  body('region')
    .trim()
    .notEmpty().withMessage('Region is required'),

  body('country')
    .trim()
    .notEmpty().withMessage('Country is required'),

  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)'),

  body('status')
    .optional()
    .isIn(['Active', 'Resolved', 'Frozen', 'Escalating'])
    .withMessage('Status must be one of: Active, Resolved, Frozen, Escalating'),

  body('type')
    .optional()
    .isIn(['Civil War', 'Interstate War', 'Proxy War', 'Insurgency', 'Terrorism', 'Other'])
    .withMessage('Invalid conflict type'),

  validate,
];

// ─── MongoDB ObjectId param validation ────────────────────────────────────────
const validateObjectId = [
  param('id')
    .isMongoId().withMessage('Invalid ID format. Must be a valid MongoDB ObjectId'),

  validate,
];

module.exports = { validate, validateRegister, validateLogin, validateConflict, validateObjectId };
