# FileShare App Setup Script for Windows PowerShell

Write-Host "🚀 Setting up FileShare Application..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is available
Write-Host "📋 Checking MongoDB connection..." -ForegroundColor Yellow
Write-Host "   Make sure MongoDB is running on your system or use MongoDB Atlas" -ForegroundColor Yellow

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ../frontend
npm install --legacy-peer-deps
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}

# Go back to root directory
Set-Location ..

Write-Host "`n🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your environment variables:" -ForegroundColor White
Write-Host "   - Edit backend/.env with your MongoDB URI" -ForegroundColor Gray
Write-Host "   - Edit frontend/.env with your API URL" -ForegroundColor Gray
Write-Host "`n2. Start the development servers:" -ForegroundColor White
Write-Host "   Backend:  cd backend && npm run dev" -ForegroundColor Gray
Write-Host "   Frontend: cd frontend && npm start" -ForegroundColor Gray
Write-Host "`n3. Open your browser to http://localhost:3000" -ForegroundColor White
Write-Host "`n📚 For more information, check the README.md file" -ForegroundColor Cyan
