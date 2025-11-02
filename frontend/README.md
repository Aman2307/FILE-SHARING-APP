# FileShare Frontend

React.js frontend for the FileShare application.

## Features

- Drag & drop file upload
- File preview and download
- User dashboard with file management
- Responsive design
- Real-time notifications
- File statistics

## Components

### Pages
- `Home` - Main upload page
- `Download` - File download page
- `Dashboard` - User file management

### Components
- `UploadForm` - File upload with drag & drop
- `DownloadLink` - Shareable link display
- `FileList` - User's files management
- `Navbar` - Navigation component

## Environment Variables

Copy `env.example` to `.env` and configure:

```bash
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000

# App Configuration
REACT_APP_MAX_FILE_SIZE=104857600
REACT_APP_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,...

# UI Configuration
REACT_APP_APP_NAME=FileShare
REACT_APP_APP_VERSION=1.0.0
```

## Installation

```bash
npm install
```

## Development

```bash
npm start
```

The app will open at `http://localhost:3000`

## Build

```bash
npm run build
```

## Testing

```bash
npm test
```

## Features

### File Upload
- Drag & drop interface
- File type validation
- Size limits (100MB)
- Advanced options (expiration, download limits)
- Progress indicators

### File Management
- View uploaded files
- Download tracking
- File statistics
- Delete files
- Pagination

### Download Page
- File information display
- Download button
- Preview option (for supported files)
- Security notices

### Responsive Design
- Mobile-friendly interface
- Bootstrap components
- Custom CSS styling
- Toast notifications

## API Integration

The frontend uses Axios for API calls with:
- Request/response interceptors
- Session token management
- Error handling
- Timeout configuration

## Styling

- Bootstrap 5.3.2
- Bootstrap Icons
- Custom CSS in `src/styles/App.css`
- Responsive design
- Dark/light theme support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

## Security

- HTTPS in production
- Secure file handling
- Input validation
- XSS protection

## Deployment

### Development
```bash
npm start
```

### Production
```bash
npm run build
# Serve the build folder with a web server
```

### Environment Setup
1. Set `REACT_APP_API_BASE_URL` to your backend URL
2. Configure other environment variables
3. Build and deploy

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check `REACT_APP_API_BASE_URL` in `.env`
   - Ensure backend is running

2. **File Upload Fails**
   - Check file size limits
   - Verify file type is allowed
   - Check network connection

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify all dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
