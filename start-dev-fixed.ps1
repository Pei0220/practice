# EconoTrends Insight Development Server Startup Script
# Setup Node.js path and start development server

Write-Host "Setting up Node.js environment..." -ForegroundColor Yellow

# Add Node.js to PATH
$env:PATH = $env:PATH + ";C:\Program Files\nodejs"

# Check if Node.js is available
try {
    $nodeVersion = & node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js not found" -ForegroundColor Red
    Write-Host "Please make sure Node.js is installed at C:\Program Files\nodejs\" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = & npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: npm not found" -ForegroundColor Red
    exit 1
}

# Start development server
Write-Host "Starting EconoTrends Insight development server..." -ForegroundColor Yellow
Write-Host "If successful, please open http://localhost:3000 in your browser" -ForegroundColor Cyan

try {
    & npm run dev
} catch {
    Write-Host "Error: Failed to start development server" -ForegroundColor Red
    Write-Host "Please check if project dependencies are installed correctly" -ForegroundColor Red
}
