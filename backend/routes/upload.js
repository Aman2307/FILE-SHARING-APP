const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { upload, handleMulterError } = require('../middleware/multerConfig');
const { antivirusScan } = require('../middleware/antivirus');
const { uploadLimiter } = require('../middleware/rateLimit');
const { anonymousSession } = require('../middleware/auth');
const { uploadFile, uploadFileWithOptions } = require('../controllers/uploadController');

// Error handler for file uploads
const handleFileUploadError = (err, req, res, next) => {
  if (err) {
    // Handle file type/validation errors
    if (err.message && (err.message.includes('not allowed') || 
                       err.message.includes('Invalid') || 
                       err.message.includes('extension') ||
                       err.message.includes('Hidden files') ||
                       err.message.includes('Multiple file'))) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Handle Multer errors
    if (err.code && err.code.startsWith('LIMIT_')) {
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }
    
    // Log unexpected errors
    console.error('File upload error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your upload.'
    });
  }
  next();
};

// Validation middleware
const validateUploadOptions = [
  body('maxDownloads')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max downloads must be between 1 and 1000'),
  body('expiresInDays')
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage('Expiration days must be between 1 and 30')
];

// Basic file upload endpoint
router.post('/',
  uploadLimiter,
  anonymousSession,
  upload,
  handleFileUploadError,  // Handle file validation errors
  antivirusScan,
  handleMulterError,      // Handle multer-specific errors
  uploadFile
);

// File upload with custom options
router.post('/with-options',
  uploadLimiter,
  anonymousSession,
  validateUploadOptions,
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
  upload,
  handleFileUploadError,  // Handle file validation errors
  antivirusScan,
  handleMulterError,      // Handle multer-specific errors
  uploadFileWithOptions
);

module.exports = router;
