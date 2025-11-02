import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000',
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add session token if available
    const sessionToken = localStorage.getItem('sessionToken');
    if (sessionToken) {
      config.headers['X-Session-Token'] = sessionToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Store session token if provided
    if (response.data && response.data.sessionToken) {
      localStorage.setItem('sessionToken', response.data.sessionToken);
    }
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      localStorage.removeItem('sessionToken');
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const uploadAPI = {
  // Basic upload
  uploadFile: (formData) => {
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload with options
  uploadFileWithOptions: (formData, options) => {
    const data = new FormData();
    data.append('file', formData.get('file'));
    if (options.maxDownloads) {
      data.append('maxDownloads', options.maxDownloads);
    }
    if (options.expiresInDays) {
      data.append('expiresInDays', options.expiresInDays);
    }
    
    return api.post('/api/upload/with-options', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const downloadAPI = {
  // Download file
  downloadFile: (downloadId) => {
    return api.get(`/api/download/${downloadId}`, {
      responseType: 'blob',
    });
  },

  // Get file info
  getFileInfo: (downloadId) => {
    return api.get(`/api/download/${downloadId}/info`);
  },

  // Preview file
  previewFile: (downloadId) => {
    return api.get(`/api/download/${downloadId}/preview`, {
      responseType: 'blob',
    });
  },
};

export const filesAPI = {
  // Get user files
  getUserFiles: (page = 1, limit = 20) => {
    return api.get('/api/files', {
      params: { page, limit },
    });
  },

  // Get file statistics
  getFileStats: () => {
    return api.get('/api/files/stats');
  },

  // Delete file
  deleteFile: (fileId) => {
    return api.delete(`/api/files/${fileId}`);
  },

  // Cleanup expired files
  cleanupExpiredFiles: () => {
    return api.post('/api/files/cleanup');
  },
};

export const healthAPI = {
  // Health check
  checkHealth: () => {
    return api.get('/health');
  },
};

export default api;
