import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { downloadAPI } from '../services/api';
import { toast } from 'react-toastify';

const Download = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      loadFileInfo();
    }
  }, [id]);

  const loadFileInfo = async () => {
    try {
      setLoading(true);
      const response = await downloadAPI.getFileInfo(id);
      if (response.data.success) {
        setFileInfo(response.data.data);
      }
    } catch (error) {
      console.error('Error loading file info:', error);
      const message = error.response?.data?.message || 'File not found';
      toast.error(message);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      
      // Create a temporary link to trigger download
      const response = await downloadAPI.downloadFile(id);
      
      // Create blob URL
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = fileInfo.filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
      
      // Reload file info to update download count
      loadFileInfo();
      
    } catch (error) {
      console.error('Error downloading file:', error);
      const message = error.response?.data?.message || 'Failed to download file';
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const handlePreview = () => {
    const base = process.env.REACT_APP_API_BASE_URL || api.defaults.baseURL || '';
    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const previewUrl = `${normalizedBase}/api/download/${id}/preview`;
    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'bi-file-image text-primary';
    if (mimetype.startsWith('video/')) return 'bi-file-play text-danger';
    if (mimetype.includes('pdf')) return 'bi-file-pdf text-danger';
    if (mimetype.includes('word')) return 'bi-file-word text-primary';
    if (mimetype.includes('text')) return 'bi-file-text text-secondary';
    return 'bi-file-earmark text-secondary';
  };

  const isPreviewable = (mimetype) => {
    return mimetype.startsWith('image/') || 
           mimetype.includes('pdf') || 
           mimetype.startsWith('text/');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5>Loading file information...</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!fileInfo) {
    return (
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 mx-auto">
            <div className="card shadow">
              <div className="card-body text-center p-5">
                <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
                <h5>File Not Found</h5>
                <p className="text-muted mb-4">
                  The file you're looking for doesn't exist or has been removed.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/')}
                >
                  <i className="bi bi-house me-1"></i>
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="download-page">
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            <div className="card shadow">
              <div className="card-body p-4">
                {/* File Header */}
                <div className="text-center mb-4">
                  <i className={`${getFileIcon(fileInfo.mimetype)} display-4 mb-3`}></i>
                  <h3 className="card-title">{fileInfo.filename}</h3>
                  <p className="text-muted">
                    Shared via FileShare
                  </p>
                </div>

                {/* File Details */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-hdd me-2"></i>
                      <strong>Size:</strong>
                    </div>
                    <p>{formatFileSize(fileInfo.size)}</p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar me-2"></i>
                      <strong>Upload Date:</strong>
                    </div>
                    <p>{formatDate(fileInfo.uploadDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-clock me-2"></i>
                      <strong>Expires:</strong>
                    </div>
                    <p>{formatDate(fileInfo.expiresAt)}</p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-download me-2"></i>
                      <strong>Downloads:</strong>
                    </div>
                    <p>
                      {fileInfo.downloadCount}
                      {fileInfo.maxDownloads && ` / ${fileInfo.maxDownloads}`}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-center mb-4">
                  {isPreviewable(fileInfo.mimetype) && (
                    <button
                      className="btn btn-outline-primary"
                      onClick={handlePreview}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Preview
                    </button>
                  )}
                  <button
                    className="btn btn-success"
                    onClick={handleDownload}
                    disabled={downloading || !fileInfo.canDownload}
                  >
                    {downloading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                          <span className="visually-hidden">Downloading...</span>
                        </div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-download me-1"></i>
                        Download
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/')}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    Upload File
                  </button>
                </div>

                {/* Status Message */}
                {!fileInfo.canDownload && (
                  <div className="alert alert-warning" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    This file is no longer available for download.
                  </div>
                )}

                {/* Security Notice */}
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-shield-check me-2"></i>
                  <strong>Security Notice:</strong> This file will expire on{' '}
                  {formatDate(fileInfo.expiresAt)}
                  {fileInfo.maxDownloads && (
                    <> or after {fileInfo.maxDownloads} downloads</>
                  )}
                  . Download it while it's still available.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Download;
