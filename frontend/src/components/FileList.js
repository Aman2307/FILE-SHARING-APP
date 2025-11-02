import React, { useState, useEffect } from 'react';
import { filesAPI } from '../services/api';
import { toast } from 'react-toastify';

const FileList = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalFiles: 0,
    hasNext: false,
    hasPrev: false
  });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadFiles();
    loadStats();
  }, []);

  const loadFiles = async (page = 1) => {
    try {
      setLoading(true);
      const response = await filesAPI.getUserFiles(page, 20);
      if (response.data.success) {
        setFiles(response.data.data.files);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await filesAPI.getFileStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setDeleting(fileId);
      const response = await filesAPI.deleteFile(fileId);
      if (response.data.success) {
        toast.success('File deleted successfully');
        loadFiles(pagination.currentPage);
        loadStats();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeleting(null);
    }
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

  const isFileExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const getStatusBadge = (file) => {
    if (isFileExpired(file.expiresAt)) {
      return <span className="badge bg-danger">Expired</span>;
    }
    if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
      return <span className="badge bg-warning">Limit Reached</span>;
    }
    return <span className="badge bg-success">Active</span>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your files...</p>
      </div>
    );
  }

  return (
    <div className="file-list">
      {/* Stats Section */}
      {stats && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <i className="bi bi-files display-6 mb-2"></i>
                <h5 className="card-title">{stats.totalFiles}</h5>
                <p className="card-text small">Total Files</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <i className="bi bi-hdd display-6 mb-2"></i>
                <h5 className="card-title">{stats.formattedTotalSize}</h5>
                <p className="card-text small">Total Size</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <i className="bi bi-download display-6 mb-2"></i>
                <h5 className="card-title">{stats.totalDownloads}</h5>
                <p className="card-text small">Total Downloads</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <i className="bi bi-graph-up display-6 mb-2"></i>
                <h5 className="card-title">{stats.formattedAverageSize}</h5>
                <p className="card-text small">Avg Size</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Files List */}
      <div className="card shadow">
        <div className="card-header">
          <h5 className="card-title mb-0">
            <i className="bi bi-folder me-2"></i>
            Your Files ({pagination.totalFiles})
          </h5>
        </div>
        <div className="card-body p-0">
          {files.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-folder-x display-4 text-muted mb-3"></i>
              <h5>No files uploaded yet</h5>
              <p className="text-muted">Upload your first file to get started!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>File</th>
                    <th>Size</th>
                    <th>Upload Date</th>
                    <th>Downloads</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`bi ${getFileIcon(file.mimetype)} me-2 fs-5`}></i>
                          <div>
                            <div className="fw-bold text-truncate" style={{ maxWidth: '200px' }}>
                              {file.originalName}
                            </div>
                            <small className="text-muted">
                              {file.mimetype}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {formatFileSize(file.size)}
                        </span>
                      </td>
                      <td>
                        <small>{formatDate(file.uploadDate)}</small>
                      </td>
                      <td>
                        <span className="badge bg-info">
                          {file.downloadCount}
                          {file.maxDownloads && ` / ${file.maxDownloads}`}
                        </span>
                      </td>
                      <td>
                        {getStatusBadge(file)}
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <a
                            href={`/download/${file.downloadId}`}
                            className="btn btn-outline-primary"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <i className="bi bi-eye"></i>
                          </a>
                          <a
                            href={`/api/download/${file.downloadId}`}
                            className="btn btn-outline-success"
                            download={file.originalName}
                          >
                            <i className="bi bi-download"></i>
                          </a>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(file._id)}
                            disabled={deleting === file._id}
                          >
                            {deleting === file._id ? (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Deleting...</span>
                              </div>
                            ) : (
                              <i className="bi bi-trash"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="card-footer">
            <nav>
              <ul className="pagination justify-content-center mb-0">
                <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => loadFiles(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(pagination.totalPages)].map((_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === pagination.currentPage;
                  
                  // Show first page, last page, current page, and pages around current page
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <li key={page} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => loadFiles(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  } else if (
                    page === pagination.currentPage - 2 ||
                    page === pagination.currentPage + 2
                  ) {
                    return (
                      <li key={page} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                })}
                
                <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => loadFiles(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileList;
