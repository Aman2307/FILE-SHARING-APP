const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const fileType = require('file-type');
const { createError } = require('../utils/errorHandler');

// Convert fs functions to use promises
const unlinkAsync = promisify(fs.unlink);

// Default allowed file types (can be overridden in environment variables)
const DEFAULT_ALLOWED_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/plain',
  'text/csv',
  
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  
  // Audio/Video
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

// Default max file size (100MB)
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Validates file type and size before processing the upload
 */
const validateFile = (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, 'No file uploaded'));
    }

    const file = req.file;
    const allowedTypes = process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',').map(t => t.trim())
      : DEFAULT_ALLOWED_TYPES;

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || DEFAULT_MAX_FILE_SIZE;

    // Check file size
    if (file.size > maxFileSize) {
      // Clean up the uploaded file
      if (file.path) {
        fs.unlink(file.path, () => {}); // Delete in background, no need to await
      }
      return next(createError(400, `File too large. Maximum size is ${formatBytes(maxFileSize)}`));
    }

    // Check file extension against allowed types
    const fileExt = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = allowedTypes.map(type => {
      const ext = mimeTypeToExtension(type);
      return ext ? ext.toLowerCase() : null;
    }).filter(Boolean);

    if (!allowedExtensions.includes(fileExt)) {
      if (file.path) {
        fs.unlink(file.path, () => {});
      }
      return next(createError(400, `File type not allowed. Allowed types: ${allowedExtensions.join(', ')}`));
    }

    // Additional check using file-type for more accurate MIME type detection
    const fileBuffer = fs.readFileSync(file.path);
    const fileTypeInfo = fileType(fileBuffer);
    
    if (fileTypeInfo && !allowedTypes.includes(fileTypeInfo.mime)) {
      if (file.path) {
        fs.unlink(file.path, () => {});
      }
      return next(createError(400, 'Invalid file type detected'));
    }

    // Add file info to request for further processing
    req.fileInfo = {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      detectedType: fileTypeInfo ? fileTypeInfo.mime : file.mimetype,
      extension: fileExt
    };

    next();
  } catch (error) {
    next(createError(500, 'Error validating file', error));
  }
};

/**
 * Middleware to handle multiple file uploads
 */
const validateMultipleFiles = (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next(createError(400, 'No files uploaded'));
    }

    const allowedTypes = process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',').map(t => t.trim())
      : DEFAULT_ALLOWED_TYPES;

    const maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || DEFAULT_MAX_FILE_SIZE;
    const maxFiles = parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5;

    // Check number of files
    if (req.files.length > maxFiles) {
      // Clean up all uploaded files
      req.files.forEach(file => {
        if (file.path) fs.unlink(file.path, () => {});
      });
      return next(createError(400, `Maximum ${maxFiles} files allowed per upload`));
    }

    // Validate each file
    for (const file of req.files) {
      // Check file size
      if (file.size > maxFileSize) {
        // Clean up all uploaded files
        req.files.forEach(f => {
          if (f.path) fs.unlink(f.path, () => {});
        });
        return next(createError(400, `File '${file.originalname}' is too large. Maximum size is ${formatBytes(maxFileSize)}`));
      }

      // Check file extension
      const fileExt = path.extname(file.originalname).toLowerCase();
      const allowedExtensions = allowedTypes.map(type => {
        const ext = mimeTypeToExtension(type);
        return ext ? ext.toLowerCase() : null;
      }).filter(Boolean);

      if (!allowedExtensions.includes(fileExt)) {
        // Clean up all uploaded files
        req.files.forEach(f => {
          if (f.path) fs.unlink(f.path, () => {});
        });
        return next(createError(400, `File type '${fileExt}' not allowed`));
      }
    }

    // Additional check using file-type for more accurate MIME type detection
    for (const file of req.files) {
      const fileBuffer = fs.readFileSync(file.path);
      const fileTypeInfo = fileType(fileBuffer);
      
      if (fileTypeInfo && !allowedTypes.includes(fileTypeInfo.mime)) {
        // Clean up all uploaded files
        req.files.forEach(f => {
          if (f.path) fs.unlink(f.path, () => {});
        });
        return next(createError(400, `Invalid file type detected in '${file.originalname}'`));
      }

      // Add file info
      file.fileInfo = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        detectedType: fileTypeInfo ? fileTypeInfo.mime : file.mimetype,
        extension: path.extname(file.originalname).toLowerCase()
      };
    }

    next();
  } catch (error) {
    // Clean up any uploaded files in case of error
    if (req.files) {
      req.files.forEach(file => {
        if (file.path) fs.unlink(file.path, () => {});
      });
    }
    next(createError(500, 'Error validating files', error));
  }
};

/**
 * Sanitize filename to prevent directory traversal and other attacks
 */
const sanitizeFilename = (filename) => {
  if (!filename) return '';
  
  // Remove any path information
  const sanitized = path.basename(filename);
  
  // Replace invalid characters with underscore
  return sanitized.replace(/[^a-zA-Z0-9\.\-_]/g, '_');
};

/**
 * Helper function to convert bytes to human-readable format
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Helper function to get file extension from MIME type
 */
function mimeTypeToExtension(mimeType) {
  const mimeToExt = {
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'application/zip': '.zip',
    'application/x-rar-compressed': '.rar',
    'application/x-7z-compressed': '.7z',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov'
  };
  
  return mimeToExt[mimeType] || '';
}

module.exports = {
  validateFile,
  validateMultipleFiles,
  sanitizeFilename,
  formatBytes
};
