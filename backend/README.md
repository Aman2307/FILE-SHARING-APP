# FileShare Backend

Express.js backend for the FileShare application.

## Features

- File upload with validation
- Secure file downloads
- File expiration management
- Download tracking
- Rate limiting
- Anonymous session management
- MongoDB integration

## API Endpoints

### Upload
- `POST /api/upload` - Upload a file
- `POST /api/upload/with-options` - Upload with custom options

### Download
- `GET /api/download/:id` - Download a file
- `GET /api/download/:id/info` - Get file information
- `GET /api/download/:id/preview` - Preview a file

### Files Management
- `GET /api/files` - Get user's files
- `GET /api/files/stats` - Get file statistics
- `DELETE /api/files/:id` - Delete a file
- `POST /api/files/cleanup` - Cleanup expired files

### Health
- `GET /health` - Health check

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/file-share-app

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-here

# File Upload
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=http://localhost:3000
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production

```bash
npm start
```

## Security Features

- File type validation
- File size limits
- Rate limiting
- CORS protection
- Secure headers with Helmet
- Input sanitization
- Anonymous session management

## File Storage

- Development: Local file system (`uploads/` directory)
- Production: Configure cloud storage (AWS S3, Cloudinary, etc.)

## Database Schema

### File Model
```javascript
{
  filename: String,        // Generated filename
  originalName: String,    // Original filename
  mimetype: String,        // MIME type
  size: Number,           // File size in bytes
  path: String,           // File path
  downloadId: String,     // Unique download ID
  downloadCount: Number,  // Number of downloads
  maxDownloads: Number,   // Download limit (optional)
  expiresAt: Date,        // Expiration date
  uploadDate: Date,       // Upload timestamp
  ipAddress: String,      // Uploader's IP
  isActive: Boolean       // Active status
}
```

## Error Handling

All API responses follow this format:

```javascript
{
  success: boolean,
  message: string,
  data?: any,
  error?: string
}
```

## Rate Limiting

- General API: 100 requests per 15 minutes
- Upload: 10 uploads per hour
- Download: 50 downloads per 15 minutes

## File Cleanup

Expired files are automatically marked as inactive. Use the cleanup endpoint to remove them:

```bash
curl -X POST http://localhost:5000/api/files/cleanup
```
