import React, { useState } from 'react';
import FileList from '../components/FileList';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('files');

  return (
    <div className="dashboard-page">
      <div className="container py-5">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1 className="display-6 fw-bold mb-2">
                  <i className="bi bi-speedometer2 text-primary me-2"></i>
                  Dashboard
                </h1>
                <p className="text-muted mb-0">
                  Manage your uploaded files and view statistics
                </p>
              </div>
              <a
                href="/"
                className="btn btn-primary"
              >
                <i className="bi bi-plus-circle me-1"></i>
                Upload New File
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'files' ? 'active' : ''}`}
                  onClick={() => setActiveTab('files')}
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-files me-1"></i>
                  My Files
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                  type="button"
                  role="tab"
                >
                  <i className="bi bi-graph-up me-1"></i>
                  Statistics
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'files' && (
            <div className="tab-pane fade show active">
              <FileList />
            </div>
          )}
          
          {activeTab === 'stats' && (
            <div className="tab-pane fade show active">
              <div className="row">
                <div className="col-lg-8 mx-auto">
                  <div className="card shadow">
                    <div className="card-body p-4">
                      <h5 className="card-title mb-4">
                        <i className="bi bi-graph-up me-2"></i>
                        Usage Statistics
                      </h5>
                      
                      <div className="alert alert-info" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        Statistics are automatically calculated based on your uploaded files.
                        These numbers update in real-time as you upload and manage files.
                      </div>

                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="card bg-primary text-white">
                            <div className="card-body text-center">
                              <i className="bi bi-files display-6 mb-2"></i>
                              <h5 className="card-title">Total Files</h5>
                              <p className="card-text">
                                The number of files you have uploaded to FileShare
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card bg-info text-white">
                            <div className="card-body text-center">
                              <i className="bi bi-hdd display-6 mb-2"></i>
                              <h5 className="card-title">Total Storage Used</h5>
                              <p className="card-text">
                                The combined size of all your uploaded files
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card bg-success text-white">
                            <div className="card-body text-center">
                              <i className="bi bi-download display-6 mb-2"></i>
                              <h5 className="card-title">Total Downloads</h5>
                              <p className="card-text">
                                How many times your files have been downloaded
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card bg-warning text-white">
                            <div className="card-body text-center">
                              <i className="bi bi-graph-up display-6 mb-2"></i>
                              <h5 className="card-title">Average File Size</h5>
                              <p className="card-text">
                                The average size of your uploaded files
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h6>Tips for Better File Management:</h6>
                        <ul className="list-unstyled">
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Use descriptive filenames to make files easier to find
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Set appropriate expiration dates for sensitive files
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Use download limits for files you want to share only a few times
                          </li>
                          <li className="mb-2">
                            <i className="bi bi-check-circle text-success me-2"></i>
                            Regularly clean up expired files to free up space
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
