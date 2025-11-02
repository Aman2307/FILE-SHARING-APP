require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');

// Import database connection
const connectDB = require('./config/db');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimit');

// Import routes
const uploadRoutes = require('./routes/upload');
const downloadRoutes = require('./routes/download');
const fileRoutes = require('./routes/files');

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  },
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    threshold: 1024,
    level: 3
  }
});

// Make io accessible to routes
app.set('io', io);

// Connect to MongoDB
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: process.env.ENABLE_HSTS === 'true' ? undefined : false,
}));

// Compression middleware
app.use(compression());

// Cookie parser
app.use(cookieParser());

// Session token middleware
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (body && typeof body === 'object' && req.sessionToken && !body.sessionToken) {
      body.sessionToken = req.sessionToken;
    }
    return originalJson(body);
  };
  next();
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads (development only)
if (process.env.NODE_ENV === 'development') {
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes with rate limiting
app.use('/api/upload', apiLimiter, uploadRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/files', fileRoutes);

// Handle share links
app.get('/share/:id', (req, res) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(302, `${frontend}/download/${req.params.id}`);
});

// Keep the download route for backward compatibility
app.get('/download/:id', (req, res) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(302, `${frontend}/download/${req.params.id}`);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'File Sharing API',
    version: '1.0.0',
    endpoints: {
      upload: '/api/upload',
      download: '/api/download/:id',
      files: '/api/files',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = {
  app,
  server,
  close: () => {
    server.close();
    mongoose.connection.close();
  }
};
