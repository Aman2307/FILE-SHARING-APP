const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Creates a test file with random content
 * @param {string} filename - The name of the file to create
 * @param {number} size - Size of the file in bytes
 * @returns {Object} - Object containing file path and cleanup function
 */
const createTestFile = (filename, size = 1024) => {
  const testDir = path.join(__dirname, '../test-files');
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const filePath = path.join(testDir, `${uuidv4()}-${filename}`);
  const content = Buffer.alloc(size, 'x');
  
  fs.writeFileSync(filePath, content);
  
  return {
    path: filePath,
    size,
    filename,
    mimeType: getMimeType(filename),
    cleanup: () => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Error cleaning up test file:', error);
      }
    }
  };
};

/**
 * Gets MIME type based on file extension
 * @param {string} filename 
 * @returns {string} MIME type
 */
const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.txt': 'text/plain',
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.exe': 'application/octet-stream',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.html': 'text/html',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Generates a file upload request for supertest
 * @param {Object} options 
 * @returns {Object} - Request object
 */
const fileUploadRequest = (options = {}) => {
  const {
    filename = 'test.txt',
    size = 1024,
    fieldname = 'file',
    contentType = null,
    customPath = null
  } = options;
  
  const file = customPath || createTestFile(filename, size);
  const mimeType = contentType || getMimeType(filename);
  
  return {
    path: file.path,
    fieldname,
    originalname: filename,
    mimetype: mimeType,
    size,
    buffer: fs.readFileSync(file.path),
    cleanup: file.cleanup
  };
};

/**
 * Cleans up all test files in the test directory
 */
const cleanupTestFiles = () => {
  const testDir = path.join(__dirname, '../test-files');
  
  if (fs.existsSync(testDir)) {
    const files = fs.readdirSync(testDir);
    
    for (const file of files) {
      const filePath = path.join(testDir, file);
      
      try {
        if (fs.lstatSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error deleting ${filePath}:`, error);
      }
    }
    
    // Remove the test directory if it's empty
    try {
      fs.rmdirSync(testDir);
    } catch (error) {
      // Directory not empty, that's fine
    }
  }
};

module.exports = {
  createTestFile,
  getMimeType,
  fileUploadRequest,
  cleanupTestFiles
};
