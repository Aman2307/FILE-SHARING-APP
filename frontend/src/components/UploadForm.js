import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../services/api';
import { toast } from 'react-toastify';

const UploadForm = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    maxDownloads: '',
    expiresInDays: '7'
  });

  const maxFileSize = parseInt(process.env.REACT_APP_MAX_FILE_SIZE) || 100 * 1024 * 1024; // 100MB
  const allowedTypes = process.env.REACT_APP_ALLOWED_FILE_TYPES 
    ? process.env.REACT_APP_ALLOWED_FILE_TYPES.split(',')
    : ['image/*', 'application/pdf', 'text/*', 'video/*'];

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(file => {
        const errors = file.errors.map(e => e.message).join(', ');
        toast.error(`${file.file.name}: ${errors}`);
      });
      return;
    }

    // Handle accepted files
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      await handleFileUpload(file);
    }
  }, [advancedOptions, showAdvancedOptions]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: maxFileSize,
    accept: allowedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    disabled: uploading
  });

  const handleFileUpload = async (file) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      let response;
      if (showAdvancedOptions && (advancedOptions.maxDownloads || advancedOptions.expiresInDays !== '7')) {
        response = await uploadAPI.uploadFileWithOptions(formData, advancedOptions);
      } else {
        response = await uploadAPI.uploadFile(formData);
      }

      if (response.data.success) {
        toast.success('File uploaded successfully!');
        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }
        // Reset form
        setAdvancedOptions({
          maxDownloads: '',
          expiresInDays: '7'
        });
        setShowAdvancedOptions(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload file';
      toast.error(message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAdvancedOptionChange = (field, value) => {
    setAdvancedOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-form">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-4">
                <i className="bi bi-cloud-upload me-2"></i>
                Upload File
              </h3>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${isDragReject ? 'reject' : ''} ${uploading ? 'disabled' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  {uploading ? (
                    <div>
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Uploading...</span>
                      </div>
                      <p className="mb-0">Uploading file...</p>
                      {uploadProgress > 0 && (
                        <div className="progress mt-2">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ) : isDragActive ? (
                    <div>
                      <i className="bi bi-cloud-upload display-4 text-primary mb-3"></i>
                      <p className="h5">Drop the file here...</p>
                    </div>
                  ) : (
                    <div>
                      <i className="bi bi-cloud-upload display-4 text-muted mb-3"></i>
                      <p className="h5">Drag & drop a file here, or click to select</p>
                      <p className="text-muted">
                        Maximum file size: {formatFileSize(maxFileSize)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  disabled={uploading}
                >
                  <i className={`bi bi-chevron-${showAdvancedOptions ? 'up' : 'down'} me-1`}></i>
                  Advanced Options
                </button>

                {showAdvancedOptions && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <div className="row">
                      <div className="col-md-6">
                        <label htmlFor="maxDownloads" className="form-label">
                          Max Downloads (optional)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="maxDownloads"
                          value={advancedOptions.maxDownloads}
                          onChange={(e) => handleAdvancedOptionChange('maxDownloads', e.target.value)}
                          min="1"
                          max="1000"
                          placeholder="Unlimited"
                        />
                        <div className="form-text">
                          Leave empty for unlimited downloads
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="expiresInDays" className="form-label">
                          Expires In (days)
                        </label>
                        <select
                          className="form-select"
                          id="expiresInDays"
                          value={advancedOptions.expiresInDays}
                          onChange={(e) => handleAdvancedOptionChange('expiresInDays', e.target.value)}
                        >
                          <option value="1">1 day</option>
                          <option value="3">3 days</option>
                          <option value="7">7 days</option>
                          <option value="14">14 days</option>
                          <option value="30">30 days</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="mt-4">
                <h6>Supported File Types:</h6>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge bg-primary">Images (JPEG, PNG, GIF)</span>
                  <span className="badge bg-primary">Documents (PDF, DOC, DOCX, TXT)</span>
                  <span className="badge bg-primary">Videos (MP4, AVI)</span>
                  <span className="badge bg-primary">Archives (ZIP, RAR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadForm;
