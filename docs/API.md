# FileShare API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
The API uses anonymous sessions based on IP addresses. Session tokens are automatically managed via cookies.

## Response Format
All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": string (only in error responses)
}
```

## Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (CORS, rate limit)
- `404` - Not Found
- `410` - Gone (expired/removed file)
- `413` - Payload Too Large (file too big)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Endpoints

### Upload File

#### Basic Upload
```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary file data]
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "file_id",
    "downloadId": "unique_download_id",
    "filename": "original_filename.pdf",
    "size": 1024000,
    "formattedSize": "1.0 MB",
    "mimetype": "application/pdf",
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "downloadUrl": "http://localhost:5000/api/download/unique_id",
    "shareUrl": "http://localhost:3000/download/unique_id",
    "downloadCount": 0,
    "maxDownloads": null
  }
}
```

#### Upload with Options
```http
POST /api/upload/with-options
Content-Type: multipart/form-data

file: [binary file data]
maxDownloads: 10 (optional)
expiresInDays: 7 (optional)
```

**Parameters:**
- `maxDownloads`: Number between 1-1000 (optional)
- `expiresInDays`: Number between 1-30 (optional)

### Download File

#### Get File Info
```http
GET /api/download/{downloadId}/info
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_id",
    "downloadId": "unique_download_id",
    "filename": "original_filename.pdf",
    "size": 1024000,
    "formattedSize": "1.0 MB",
    "mimetype": "application/pdf",
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "downloadCount": 5,
    "maxDownloads": 10,
    "downloadUrl": "http://localhost:5000/api/download/unique_id",
    "canDownload": true
  }
}
```

#### Download File
```http
GET /api/download/{downloadId}
```

**Response:**
- Binary file data
- Headers:
  - `Content-Disposition: attachment; filename="original_filename.pdf"`
  - `Content-Type: application/pdf`
  - `Content-Length: 1024000`

#### Preview File
```http
GET /api/download/{downloadId}/preview
```

**Response:**
- Binary file data for inline viewing
- Headers:
  - `Content-Disposition: inline; filename="original_filename.pdf"`
  - `Content-Type: application/pdf`

### File Management

#### Get User Files
```http
GET /api/files?page=1&limit=20
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file_id",
        "downloadId": "unique_download_id",
        "originalName": "filename.pdf",
        "size": 1024000,
        "formattedSize": "1.0 MB",
        "mimetype": "application/pdf",
        "uploadDate": "2024-01-01T00:00:00.000Z",
        "expiresAt": "2024-01-08T00:00:00.000Z",
        "downloadCount": 5,
        "maxDownloads": 10
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFiles": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get File Statistics
```http
GET /api/files/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFiles": 25,
    "totalSize": 52428800,
    "formattedTotalSize": "50.0 MB",
    "totalDownloads": 150,
    "averageFileSize": 2097152,
    "formattedAverageSize": "2.0 MB"
  }
}
```

#### Delete File
```http
DELETE /api/files/{fileId}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Cleanup Expired Files
```http
POST /api/files/cleanup
```

**Response:**
```json
{
  "success": true,
  "message": "Expired files cleanup completed",
  "data": {
    "modifiedCount": 5
  }
}
```

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## Rate Limiting

### Limits
- **General API**: 100 requests per 15 minutes
- **Upload**: 10 uploads per hour
- **Download**: 50 downloads per 15 minutes

### Headers
When rate limited, the following headers are included:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset time (Unix timestamp)

## File Types

### Supported MIME Types
- `image/jpeg`, `image/png`, `image/gif`
- `application/pdf`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- `text/plain`
- `video/mp4`, `video/avi`
- `application/zip`, `application/x-rar-compressed`

### File Size Limits
- Maximum file size: 100MB (104,857,600 bytes)
- Maximum files per request: 1

## Error Examples

### File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 100MB."
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "File type application/octet-stream is not allowed."
}
```

### File Not Found
```json
{
  "success": false,
  "message": "File not found or has been removed"
}
```

### File Expired
```json
{
  "success": false,
  "message": "File has expired"
}
```

### Rate Limited
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

## Usage Examples

### JavaScript/React
```javascript
// Upload file
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

// Download file
const response = await fetch(`/api/download/${downloadId}`);
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
```

### cURL
```bash
# Upload file
curl -X POST \
  -F "file=@document.pdf" \
  http://localhost:5000/api/upload

# Download file
curl -O http://localhost:5000/api/download/unique_id

# Get file info
curl http://localhost:5000/api/download/unique_id/info
```

### Python
```python
import requests

# Upload file
with open('document.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/upload',
        files={'file': f}
    )

# Download file
response = requests.get(f'http://localhost:5000/api/download/{download_id}')
with open('downloaded_file.pdf', 'wb') as f:
    f.write(response.content)
```
