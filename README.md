# File Sharing App

A modern file sharing application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- Anonymous file uploads (up to 100MB)
- Shareable download links with optional expiration
- File management dashboard
- Secure file validation
- Responsive design for desktop and mobile

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Multer for file uploads
- JWT for authentication
- Helmet for security

### Frontend
- React.js 18+
- Axios for API calls
- React Router for navigation
- Bootstrap for styling

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

#### Option 1: Automated Setup (Windows)
1. Clone the repository
```bash
git clone <repository-url>
cd file-share-app
```

2. Run the setup script
```powershell
.\setup.ps1
```

3. Configure environment variables
   - Edit `backend/.env` with your MongoDB URI
   - Edit `frontend/.env` with your API URL

4. Start development servers
```powershell
.\start-dev.ps1
```

#### Option 2: Manual Setup
1. Clone the repository
```bash
git clone <repository-url>
cd file-share-app
```

2. Install backend dependencies
```bash
cd backend
npm install --legacy-peer-deps
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install --legacy-peer-deps
```

4. Set up environment variables
```bash
# Backend .env
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and other config

# Frontend .env
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API base URL
```

5. Start the development servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
file-share-app/
├── backend/                  # Server-side code
│   ├── config/               # Configuration files
│   ├── controllers/          # Business logic
│   ├── middleware/           # Custom middleware
│   ├── models/               # Database schemas
│   ├── routes/               # API endpoints
│   ├── uploads/              # Local file storage
│   └── server.js             # Entry point
├── frontend/                 # Client-side code
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── services/         # API helpers
│   │   └── styles/           # CSS files
│   └── package.json
└── README.md
```

## API Endpoints

- `POST /api/upload` - Upload a file
- `GET /api/download/:id` - Download a file
- `GET /api/files` - List user's files
- `DELETE /api/files/:id` - Delete a file

## Security Features

- File type validation
- File size limits (100MB)
- Rate limiting
- Secure headers with Helmet
- Input sanitization

## Development

- Backend runs on port 5000
- Frontend runs on port 3000
- MongoDB connection via environment variables

## Production Deployment

For production deployment:
1. Use cloud storage (AWS S3, Cloudinary) instead of local uploads
2. Set up proper environment variables
3. Use HTTPS
4. Configure proper CORS settings
5. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
