const jwt = require('jsonwebtoken');

// Basic session-based authentication for anonymous users
// In a real app, you'd use proper user authentication
const generateSessionToken = (ipAddress) => {
  return jwt.sign(
    { 
      ip: ipAddress,
      type: 'anonymous',
      timestamp: Date.now()
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '7d' }
  );
};

const verifySessionToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
  } catch (error) {
    return null;
  }
};

// Middleware to extract IP address
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for']?.split(',')[0] ||
         '127.0.0.1';
};

// Middleware to handle anonymous sessions
const anonymousSession = (req, res, next) => {
  const clientIP = getClientIP(req);
  
  // Check for existing session token in cookies or headers
  const sessionToken = req.cookies?.sessionToken || req.headers['x-session-token'];
  
  if (sessionToken) {
    const decoded = verifySessionToken(sessionToken);
    if (decoded && decoded.ip === clientIP) {
      req.session = decoded;
    } else {
      // Invalid or expired token, create new one
      req.session = { ip: clientIP, type: 'anonymous', timestamp: Date.now() };
    }
  } else {
    // No session token, create new one
    req.session = { ip: clientIP, type: 'anonymous', timestamp: Date.now() };
  }
  
  // Generate new session token
  const newToken = generateSessionToken(clientIP);
  
  // Set cookie if not already set
  if (!req.cookies?.sessionToken) {
    res.cookie('sessionToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });
  }
  
  req.sessionToken = newToken;
  next();
};

// Optional: Middleware for protected routes (future use)
const requireAuth = (req, res, next) => {
  // For now, just pass through since we're using anonymous sessions
  // In the future, this would check for valid user authentication
  next();
};

module.exports = {
  generateSessionToken,
  verifySessionToken,
  getClientIP,
  anonymousSession,
  requireAuth
};
