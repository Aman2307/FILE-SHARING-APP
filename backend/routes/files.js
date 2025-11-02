const express = require('express');
const router = express.Router();
const { query, param, validationResult } = require('express-validator');
const { apiLimiter } = require('../middleware/rateLimit');
const { anonymousSession } = require('../middleware/auth');
const { getUserFiles, deleteFile, getFileStats, cleanupExpiredFiles } = require('../controllers/fileController');

// Validation middleware
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateFileId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid file ID')
];

// Get user's files
router.get('/',
  apiLimiter,
  anonymousSession,
  validatePagination,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
  getUserFiles
);

// Get file statistics
router.get('/stats',
  apiLimiter,
  anonymousSession,
  getFileStats
);

// Delete a file
router.delete('/:id',
  apiLimiter,
  anonymousSession,
  validateFileId,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
  deleteFile
);

// Cleanup expired files (admin endpoint)
router.post('/cleanup',
  apiLimiter,
  anonymousSession,
  cleanupExpiredFiles
);

module.exports = router;
