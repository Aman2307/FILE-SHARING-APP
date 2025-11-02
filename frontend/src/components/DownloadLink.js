import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';

const DownloadLink = ({ fileData }) => {
  const [copied, setCopied] = useState(false);

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

  const formatUrl = (url) => {
    if (!url) return '';
    
    // If it's already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Extract just the file ID if it's a path
    const fileId = url.split('/').pop();
    
    // For local development
    if (window.location.hostname === 'localhost') {
      return `http://localhost:3000/download/${fileId}`;
    }
    
    // For production - use the current hostname with /download/ path
    return `${window.location.protocol}//${window.location.host}/download/${fileId}`;
  };

  const handleCopy = () => {
    const fullUrl = formatUrl(fileData.shareUrl);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    });
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'bi-file-image';
    if (mimetype.startsWith('video/')) return 'bi-file-play';
    if (mimetype.includes('pdf')) return 'bi-file-pdf';
    if (mimetype.includes('word')) return 'bi-file-word';
    if (mimetype.includes('text')) return 'bi-file-text';
    return 'bi-file-earmark';
  };

  const handleLinkClick = (e) => {
    e.preventDefault();
    window.open(formatUrl(fileData.shareUrl), '_blank');
  };

  return (
    <div className="download-link">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className={`bi ${getFileIcon(fileData.mimetype)} display-4 text-success mb-3`}></i>
                <h3 className="card-title">File Uploaded Successfully!</h3>
                <p className="text-muted">Your file is ready to share</p>
              </div>

              {/* File Info */}
              <div className="file-info mb-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-file-earmark me-2"></i>
                      <strong>Filename:</strong>
                    </div>
                    <p className="text-break">{fileData.filename}</p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-hdd me-2"></i>
                      <strong>Size:</strong>
                    </div>
                    <p>{formatFileSize(fileData.size)}</p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-calendar me-2"></i>
                      <strong>Uploaded:</strong>
                    </div>
                    <p>{formatDate(fileData.uploadDate)}</p>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-clock me-2"></i>
                      <strong>Expires:</strong>
                    </div>
                    <p>{formatDate(fileData.expiresAt)}</p>
                  </div>
                </div>
                {fileData.maxDownloads && (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-download me-2"></i>
                        <strong>Max Downloads:</strong>
                      </div>
                      <p>{fileData.maxDownloads}</p>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-2">
                        <i className="bi bi-graph-down me-2"></i>
                        <strong>Downloads Used:</strong>
                      </div>
                      <p>{fileData.downloadCount} / {fileData.maxDownloads}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Download Link */}
              <div className="download-link-section">
                <h5 className="mb-3">
                  <i className="bi bi-link-45deg me-2"></i>
                  Shareable Link
                </h5>
                <div className="mb-3 p-3 bg-light rounded">
                  <div className="d-flex align-items-center">
                    <a
                      href={formatUrl(fileData.shareUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-decoration-underline flex-grow-1"
                      onClick={handleLinkClick}
                      style={{ wordBreak: 'break-all' }}
                    >
                      {formatUrl(fileData.shareUrl)}
                    </a>
                    <CopyToClipboard text={formatUrl(fileData.shareUrl)} onCopy={handleCopy}>
                      <button
                        className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-primary'} ms-2`}
                        type="button"
                      >
                        <i className={`bi ${copied ? 'bi-check' : 'bi-clipboard'} me-1`}></i>
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </CopyToClipboard>
                  </div>
                </div>
                <p className="text-muted small">
                  <i className="bi bi-mouse me-1"></i>
                  Click the link to open or copy it to share with others
                </p>
              </div>

              {/* Action Buttons */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                <a
                  href={formatUrl(fileData.shareUrl)}
                  className="btn btn-primary me-md-2"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                >
                  <i className="bi bi-eye me-1"></i>
                  Preview
                </a>
                <a
                  href={fileData.downloadUrl}
                  className="btn btn-success me-md-2"
                  download={fileData.filename}
                >
                  <i className="bi bi-download me-1"></i>
                  Download
                </a>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => window.location.reload()}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Upload Another
                </button>
              </div>

              {/* Security Notice */}
              <div className="alert alert-info mt-4" role="alert">
                <i className="bi bi-shield-check me-2"></i>
                <strong>Security Notice:</strong> This link will expire on{' '}
                {formatDate(fileData.expiresAt)}
                {fileData.maxDownloads && (
                  <> or after {fileData.maxDownloads} downloads</>
                )}
                . Keep this link secure as anyone with access can download your file.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadLink;