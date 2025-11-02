const fs = require('fs');
const path = require('path');
const File = require('../models/File');

const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find file by download ID
    const fileRecord = await File.findOne({ 
      downloadId: id, 
      isActive: true 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found or has been removed'
      });
    }

    // Check if file can be downloaded
    if (!fileRecord.canDownload()) {
      let message = 'File is no longer available';
      
      if (fileRecord.isExpired) {
        message = 'File has expired';
      } else if (fileRecord.downloadLimitExceeded) {
        message = 'Download limit exceeded';
      }

      return res.status(410).json({
        success: false,
        message: message
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(fileRecord.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    fileRecord.downloadCount += 1;
    await fileRecord.save();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${fileRecord.originalName}"`);
    res.setHeader('Content-Type', fileRecord.mimetype);
    res.setHeader('Content-Length', fileRecord.size);

    // Stream the file
    const fileStream = fs.createReadStream(fileRecord.path);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getFileInfo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find file by download ID
    const fileRecord = await File.findOne({ 
      downloadId: id, 
      isActive: true 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found or has been removed'
      });
    }

    // Check if file can be downloaded
    if (!fileRecord.canDownload()) {
      let message = 'File is no longer available';
      
      if (fileRecord.isExpired) {
        message = 'File has expired';
      } else if (fileRecord.downloadLimitExceeded) {
        message = 'Download limit exceeded';
      }

      return res.status(410).json({
        success: false,
        message: message
      });
    }

    res.json({
      success: true,
      data: {
        id: fileRecord._id,
        downloadId: fileRecord.downloadId,
        filename: fileRecord.originalName,
        size: fileRecord.size,
        formattedSize: fileRecord.formattedSize,
        mimetype: fileRecord.mimetype,
        uploadDate: fileRecord.uploadDate,
        expiresAt: fileRecord.expiresAt,
        downloadCount: fileRecord.downloadCount,
        maxDownloads: fileRecord.maxDownloads,
        downloadUrl: fileRecord.downloadUrl,
        canDownload: fileRecord.canDownload()
      }
    });

  } catch (error) {
    console.error('Get file info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get file information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const previewFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find file by download ID
    const fileRecord = await File.findOne({ 
      downloadId: id, 
      isActive: true 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found or has been removed'
      });
    }

    // Check if file can be downloaded
    if (!fileRecord.canDownload()) {
      return res.status(410).json({
        success: false,
        message: 'File is no longer available'
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(fileRecord.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set appropriate headers for preview
    res.setHeader('Content-Type', fileRecord.mimetype);
    res.setHeader('Content-Length', fileRecord.size);
    res.setHeader('Content-Disposition', `inline; filename="${fileRecord.originalName}"`);

    // Stream the file for preview
    const fileStream = fs.createReadStream(fileRecord.path);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error reading file'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to preview file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  downloadFile,
  getFileInfo,
  previewFile
};
