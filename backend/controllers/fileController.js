const fs = require('fs');
const File = require('../models/File');
const { getClientIP } = require('../middleware/auth');

const getUserFiles = async (req, res) => {
  try {
    const clientIP = getClientIP(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find files uploaded by this IP address
    const files = await File.find({ 
      ipAddress: clientIP,
      isActive: true 
    })
    .sort({ uploadDate: -1 })
    .skip(skip)
    .limit(limit)
    .select('-path -ipAddress'); // Exclude sensitive fields

    const total = await File.countDocuments({ 
      ipAddress: clientIP,
      isActive: true 
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        files: files,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalFiles: total,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const clientIP = getClientIP(req);

    // Find file by ID and IP address (users can only delete their own files)
    const fileRecord = await File.findOne({ 
      _id: id,
      ipAddress: clientIP,
      isActive: true 
    });

    if (!fileRecord) {
      return res.status(404).json({
        success: false,
        message: 'File not found or you do not have permission to delete it'
      });
    }

    // Delete file from disk
    if (fs.existsSync(fileRecord.path)) {
      try {
        fs.unlinkSync(fileRecord.path);
      } catch (unlinkError) {
        console.error('Error deleting file from disk:', unlinkError);
        // Continue with database deletion even if disk deletion fails
      }
    }

    // Mark file as inactive in database (soft delete)
    fileRecord.isActive = false;
    await fileRecord.save();

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getFileStats = async (req, res) => {
  try {
    const clientIP = getClientIP(req);

    // Get statistics for files uploaded by this IP
    const stats = await File.aggregate([
      { 
        $match: { 
          ipAddress: clientIP,
          isActive: true 
        } 
      },
      {
        $group: {
          _id: null,
          totalFiles: { $sum: 1 },
          totalSize: { $sum: '$size' },
          totalDownloads: { $sum: '$downloadCount' },
          averageFileSize: { $avg: '$size' }
        }
      }
    ]);

    const result = stats[0] || {
      totalFiles: 0,
      totalSize: 0,
      totalDownloads: 0,
      averageFileSize: 0
    };

    // Format total size
    const bytes = result.totalSize;
    let formattedTotalSize = '0 Bytes';
    if (bytes > 0) {
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      formattedTotalSize = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Format average file size
    const avgBytes = result.averageFileSize;
    let formattedAvgSize = '0 Bytes';
    if (avgBytes > 0) {
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(avgBytes) / Math.log(k));
      formattedAvgSize = parseFloat((avgBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    res.json({
      success: true,
      data: {
        totalFiles: result.totalFiles,
        totalSize: result.totalSize,
        formattedTotalSize: formattedTotalSize,
        totalDownloads: result.totalDownloads,
        averageFileSize: result.averageFileSize,
        formattedAverageSize: formattedAvgSize
      }
    });

  } catch (error) {
    console.error('Get file stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const cleanupExpiredFiles = async (req, res) => {
  try {
    // This endpoint can be called manually or by a cron job
    const result = await File.cleanupExpired();
    
    res.json({
      success: true,
      message: 'Expired files cleanup completed',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Cleanup expired files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup expired files',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  getUserFiles,
  deleteFile,
  getFileStats,
  cleanupExpiredFiles
};
