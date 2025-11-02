import React, { useState } from 'react';
import UploadForm from '../components/UploadForm';
import DownloadLink from '../components/DownloadLink';

const Home = () => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleUploadSuccess = (fileData) => {
    setUploadedFile(fileData);
  };

  const handleUploadAnother = () => {
    setUploadedFile(null);
  };

  return (
    <div className="home-page">
      <div className="container py-5">
        {/* Header */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 fw-bold mb-3">
              <i className="bi bi-cloud-upload text-primary me-3"></i>
              FileShare
            </h1>
            <p className="lead text-muted mb-4">
              Share files securely and easily. Upload your files and get shareable links instantly.
            </p>
            <div className="row g-3 justify-content-center">
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-shield-check text-success me-2 fs-4"></i>
                  <span>Secure Uploads</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-clock text-info me-2 fs-4"></i>
                  <span>Auto Expiration</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-link-45deg text-warning me-2 fs-4"></i>
                  <span>Shareable Links</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {uploadedFile ? (
          <DownloadLink fileData={uploadedFile} />
        ) : (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        )}

        {/* Features Section */}
        <div className="row mt-5">
          <div className="col-lg-12">
            <h3 className="text-center mb-4">Why Choose FileShare?</h3>
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-lock display-4 text-primary mb-3"></i>
                    <h5 className="card-title">Secure</h5>
                    <p className="card-text text-muted">
                      Your files are protected with secure links and automatic expiration.
                      No account required for anonymous sharing.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-lightning display-4 text-warning mb-3"></i>
                    <h5 className="card-title">Fast</h5>
                    <p className="card-text text-muted">
                      Upload files up to 100MB quickly and get shareable links instantly.
                      Optimized for speed and reliability.
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-gear display-4 text-info mb-3"></i>
                    <h5 className="card-title">Customizable</h5>
                    <p className="card-text text-muted">
                      Set download limits and expiration dates. Track download counts
                      and manage your shared files easily.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supported File Types */}
        <div className="row mt-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 bg-light">
              <div className="card-body text-center p-4">
                <h5 className="card-title mb-3">Supported File Types</h5>
                <div className="row g-2">
                  <div className="col-6 col-md-3">
                    <div className="d-flex align-items-center justify-content-center p-2 bg-white rounded">
                      <i className="bi bi-file-image text-primary me-2"></i>
                      <span>Images</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="d-flex align-items-center justify-content-center p-2 bg-white rounded">
                      <i className="bi bi-file-pdf text-danger me-2"></i>
                      <span>PDFs</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="d-flex align-items-center justify-content-center p-2 bg-white rounded">
                      <i className="bi bi-file-play text-success me-2"></i>
                      <span>Videos</span>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="d-flex align-items-center justify-content-center p-2 bg-white rounded">
                      <i className="bi bi-file-earmark-zip text-warning me-2"></i>
                      <span>Archives</span>
                    </div>
                  </div>
                </div>
                <p className="text-muted mt-3 mb-0">
                  And many more! Maximum file size: 100MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
