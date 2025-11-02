const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { getClientIP } = require('../middleware/auth');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const clientIP = getClientIP(req);
    const downloadId = uuidv4();
    
    // Calculate expiration date (7 days from now by default)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create file record in database
    const fileRecord = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      downloadId: downloadId,
      expiresAt: expiresAt,
      ipAddress: clientIP
    });

    await fileRecord.save();

    // Generate download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${downloadId}`;
    const shareUrl = `${req.protocol}://${req.get('host')}/download/${downloadId}`;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: fileRecord._id,
        downloadId: downloadId,
        filename: req.file.originalname,
        size: req.file.size,
        formattedSize: fileRecord.formattedSize,
        mimetype: req.file.mimetype,
        uploadDate: fileRecord.uploadDate,
        expiresAt: fileRecord.expiresAt,
        downloadUrl: downloadUrl,
        shareUrl: shareUrl,
        downloadCount: 0,
        maxDownloads: null
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const uploadFileWithOptions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const clientIP = getClientIP(req);
    const downloadId = uuidv4();
    
    // Parse custom options
    const { maxDownloads, expiresInDays } = req.body;
    
    // Calculate expiration date
    const expiresAt = new Date();
    const days = expiresInDays ? parseInt(expiresInDays) : 7;
    expiresAt.setDate(expiresAt.getDate() + days);

    // Validate maxDownloads
    const downloadLimit = maxDownloads ? parseInt(maxDownloads) : null;
    if (downloadLimit && (downloadLimit < 1 || downloadLimit > 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Max downloads must be between 1 and 1000'
      });
    }

    // Create file record in database
    const fileRecord = new File({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      downloadId: downloadId,
      expiresAt: expiresAt,
      maxDownloads: downloadLimit,
      ipAddress: clientIP
    });

    await fileRecord.save();

    // Generate URLs
    const downloadUrl = `${req.protocol}://${req.get('host')}/api/download/${downloadId}`;
    const shareUrl = `${req.protocol}://${req.get('host')}/download/${downloadId}`;

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully with custom options',
      data: {
        id: fileRecord._id,
        downloadId: downloadId,
        filename: req.file.originalname,
        size: req.file.size,
        formattedSize: fileRecord.formattedSize,
        mimetype: req.file.mimetype,
        uploadDate: fileRecord.uploadDate,
        expiresAt: fileRecord.expiresAt,
        downloadUrl: downloadUrl,
        shareUrl: shareUrl,
        downloadCount: 0,
        maxDownloads: downloadLimit
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  uploadFile,
  uploadFileWithOptions
};
