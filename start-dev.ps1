# FileShare Development Server Starter

Write-Host "Starting FileShare Development Servers..." -ForegroundColor Green

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host ""
Write-Host "Development servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Server URLs:" -ForegroundColor Cyan
Write-Host "  Backend API:  http://localhost:5000" -ForegroundColor White
Write-Host "  Frontend App: http://localhost:3000" -ForegroundColor White
Write-Host "  Health Check: http://localhost:5000/health" -ForegroundColor White
Write-Host ""
Write-Host "Please wait for both servers to fully start..." -ForegroundColor Yellow
Write-Host "The frontend will automatically open in your browser" -ForegroundColor Gray