const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { fileTypeFromFile } = require('file-type');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    const filename = `${sanitizedName}_${uniqueSuffix}${ext}`;
    
    cb(null, filename);
  }
});

// Define allowed file types with their extensions
const ALLOWED_EXTENSIONS = {
  // Images
  'image/jpeg': ['.jpeg', '.jpg', '.jfif'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt', '.md', '.csv'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/rtf': ['.rtf'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  'application/x-tar': ['.tar'],
  'application/gzip': ['.gz'],
  
  // Media
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'video/mp4': ['.mp4'],
  'video/x-msvideo': ['.avi'],
  'video/x-ms-wmv': ['.wmv'],
  'video/quicktime': ['.mov'],
  'video/x-matroska': ['.mkv'],
  'video/webm': ['.webm'],
  'audio/webm': ['.weba']
};

// Create a map of mime types to their allowed extensions
const MIME_TO_EXTENSIONS = new Map(Object.entries(ALLOWED_EXTENSIONS));

// Create a set of all allowed mime types
const ALLOWED_MIME_TYPES = new Set(Object.keys(ALLOWED_EXTENSIONS));

// Get the maximum file size from environment variable or default to 100MB
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600', 10);

// File filter with enhanced validation
const fileFilter = (req, file, cb) => {
  try {
    // Check for hidden files
    if (file.originalname.startsWith('.')) {
      return cb(new Error('Hidden files are not allowed'), false);
    }

    // Check for null bytes in filename
    if (file.originalname.includes('\0')) {
      return cb(new Error('Invalid filename'), false);
    }

    // Check for double extensions
    const fileName = file.originalname.toLowerCase();
    if ((fileName.match(/\./g) || []).length > 1) {
      return cb(new Error('Multiple file extensions are not allowed'), false);
    }

    // Check if the file type is allowed
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error(`File type '${file.mimetype}' is not allowed`), false);
    }

    // Get the file extension
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Check if the file extension is allowed for this mime type
    const allowedExtensions = MIME_TO_EXTENSIONS.get(file.mimetype) || [];
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      return cb(new Error(`File extension '${ext}' is not allowed for '${file.mimetype}'`), false);
    }

    // If all checks pass, accept the file
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Configure multer with enhanced security settings
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only one file at a time
    fields: 10, // Maximum number of non-file fields
    parts: 20, // Max number of parts (fields + files)
    headerPairs: 2000, // Max number of header key-value pairs
    
    // Security limits
    fieldNameSize: 100, // Max field name size
    fieldSize: 1024, // Max field value size (1KB)
    fieldValueSize: 1024 // Max field value size (1KB)
  }
});

// Post-processing middleware to verify file content matches its extension
const verifyFileContent = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const detected = await fileTypeFromFile(req.file.path);
    if (!detected) return next(); // Skip if type cannot be determined
    
    const declaredType = req.file.mimetype;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    // Check if the detected type matches the declared type
    if (detected.mime !== declaredType) {
      // Clean up the uploaded file
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      
      return res.status(400).json({
        success: false,
        message: `File content type (${detected.mime}) does not match declared type (${declaredType})`
      });
    }
    
    // Additional check for extension vs content type
    const allowedExtensions = MIME_TO_EXTENSIONS.get(detected.mime) || [];
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExt)) {
      // Clean up the uploaded file
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      
      return res.status(400).json({
        success: false,
        message: `File extension '${fileExt}' does not match detected content type (${detected.mime})`
      });
    }
    
    next();
  } catch (error) {
    console.error('File verification error:', error);
    next(); // Continue even if verification fails
  }
};

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed per upload.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name.'
      });
    }
    if (error.code === 'LIMIT_FIELD_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many form fields.'
      });
    }
    if (error.code === 'LIMIT_FIELD_KEY') {
      return res.status(400).json({
        success: false,
        message: 'Field name too long.'
      });
    }
    if (error.code === 'LIMIT_FIELD_VALUE') {
      return res.status(400).json({
        success: false,
        message: 'Field value too large.'
      });
    }
    if (error.code === 'LIMIT_PART_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many parts in the form.'
      });
    }
  }
  
  // Handle our custom errors
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  // Pass to default error handler
  next(error);
};

module.exports = {
  upload: [upload.single('file'), verifyFileContent],
  handleMulterError
};
