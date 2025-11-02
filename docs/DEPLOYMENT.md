# FileShare Deployment Guide

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git
- A cloud provider account (for production)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd file-share-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp env.example .env
# Edit .env with your configuration
npm start
```

### 4. MongoDB Setup
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (recommended)
# 1. Create account at https://cloud.mongodb.com
# 2. Create a cluster
# 3. Get connection string
# 4. Add to backend/.env
```

## Production Deployment

### Option 1: Traditional VPS/Server

#### Server Requirements
- Ubuntu 20.04+ or CentOS 8+
- 2GB RAM minimum
- 20GB storage minimum
- Node.js 18+
- MongoDB
- Nginx (reverse proxy)
- PM2 (process manager)

#### Deployment Steps

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Nginx
sudo apt install nginx -y

# Install PM2
sudo npm install -g pm2
```

2. **Application Deployment**
```bash
# Clone repository
git clone <repository-url>
cd file-share-app

# Backend setup
cd backend
npm install --production
cp env.example .env
# Configure .env for production

# Frontend build
cd ../frontend
npm install
npm run build

# Start backend with PM2
cd ../backend
pm2 start server.js --name fileshare-backend

# Configure PM2 to start on boot
pm2 startup
pm2 save
```

3. **Nginx Configuration**
```nginx
# /etc/nginx/sites-available/fileshare
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/file-share-app/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/fileshare /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

4. **SSL Certificate (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

### Option 2: Docker Deployment

#### Dockerfile (Backend)
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  backend:
    build: ./backend
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/fileshare?authSource=admin
      NODE_ENV: production
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

#### Deployment Commands
```bash
docker-compose up -d
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
# Create apps
heroku create fileshare-backend
heroku create fileshare-frontend

# Add MongoDB addon
heroku addons:create mongolab:sandbox --app fileshare-backend

# Deploy backend
cd backend
git subtree push --prefix backend heroku main

# Deploy frontend
cd frontend
# Update API URL to backend URL
npm run build
# Deploy build folder to frontend app
```

#### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Railway/Render
1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically

## Environment Variables

### Backend (.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/fileshare
# For Atlas: mongodb+srv://user:pass@cluster.mongodb.net/fileshare

# Server
PORT=5000
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret

# File Upload
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,...

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_MAX_FILE_SIZE=104857600
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,...
```

## Cloud Storage Setup

### AWS S3
```javascript
// backend/config/s3.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

module.exports = s3;
```

### Cloudinary
```javascript
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs fileshare-backend
```

### Log Files
```bash
# Application logs
tail -f ~/.pm2/logs/fileshare-backend-out.log
tail -f ~/.pm2/logs/fileshare-backend-error.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Checks
```bash
# Backend health
curl http://localhost:5000/health

# Frontend
curl http://localhost
```

## Backup Strategy

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/fileshare" --out=/backup/fileshare-$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/fileshare" /backup/fileshare-20240101
```

### File Backup
```bash
# Backup uploads directory
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz backend/uploads/
```

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set strong JWT secrets
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Use environment variables
- [ ] Enable firewall
- [ ] Regular security updates
- [ ] Monitor logs
- [ ] Set up backups

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB is running
   - Verify connection string
   - Check firewall settings

2. **File Upload Fails**
   - Check file size limits
   - Verify disk space
   - Check permissions

3. **Frontend Can't Connect to Backend**
   - Check CORS configuration
   - Verify API URL
   - Check network connectivity

4. **High Memory Usage**
   - Monitor PM2 processes
   - Check for memory leaks
   - Restart services if needed

### Performance Optimization

1. **Enable Gzip Compression**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

2. **Set Cache Headers**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

3. **Database Indexing**
```javascript
// Add indexes for better performance
db.files.createIndex({ "downloadId": 1 })
db.files.createIndex({ "expiresAt": 1 })
db.files.createIndex({ "ipAddress": 1, "uploadDate": -1 })
```
