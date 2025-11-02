const express = require('express');
const router = express.Router();
const { downloadLimiter } = require('../middleware/rateLimit');
const { anonymousSession } = require('../middleware/auth');
const { downloadFile, getFileInfo, previewFile } = require('../controllers/downloadController');

// Download file endpoint
router.get('/:id',
  downloadLimiter,
  anonymousSession,
  downloadFile
);

// Get file information endpoint
router.get('/:id/info',
  anonymousSession,
  getFileInfo
);

// Preview file endpoint (for images, PDFs, etc.)
router.get('/:id/preview',
  anonymousSession,
  previewFile
);

module.exports = router;
