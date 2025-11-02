const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  downloadId: {
    type: String,
    required: true,
    unique: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  maxDownloads: {
    type: Number,
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
fileSchema.index({ downloadId: 1 });
fileSchema.index({ expiresAt: 1 });
fileSchema.index({ uploadDate: -1 });

// Virtual for formatted file size
fileSchema.virtual('formattedSize').get(function() {
  const bytes = this.size;
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for download URL
fileSchema.virtual('downloadUrl').get(function() {
  return `/api/download/${this.downloadId}`;
});

// Virtual for checking if file is expired
fileSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt < new Date();
});

// Virtual for checking if download limit exceeded
fileSchema.virtual('downloadLimitExceeded').get(function() {
  return this.maxDownloads && this.downloadCount >= this.maxDownloads;
});

// Method to check if file can be downloaded
fileSchema.methods.canDownload = function() {
  return this.isActive && 
         !this.isExpired && 
         !this.downloadLimitExceeded;
};

// Static method to clean up expired files
fileSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    { expiresAt: { $lt: new Date() } },
    { isActive: false }
  );
  return result;
};

// Ensure virtual fields are serialized
fileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('File', fileSchema);
