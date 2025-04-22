# PowerShell script to test the Qbit Auth Service
# This script tests login, profile, and refresh token endpoints

# Configuration
$authServiceUrl = "http://localhost:3002"
$adminEmail = "admin@qbit.com"
$adminPassword = "admin123"

Write-Host "--- Testing Qbit Auth Service ---" -ForegroundColor Cyan
Write-Host "Server: $authServiceUrl" -ForegroundColor Cyan
Write-Host ""

# Test 1: Login
Write-Host "1. Testing Login..." -ForegroundColor Green
$loginBody = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$authServiceUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "✓ Login successful!" -ForegroundColor Green
    
    # Save tokens
    $accessToken = $loginResponse.accessToken
    $refreshToken = $loginResponse.refreshToken
    
    Write-Host "  User: $($loginResponse.user.name) ($($loginResponse.user.email))"
    Write-Host "  Roles: $($loginResponse.user.roles -join ', ')"
    Write-Host "  Access Token: $($accessToken.Substring(0, 20))..."
    Write-Host "  Refresh Token: $($refreshToken.Substring(0, 20))..."
} catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# Test 2: Get Profile
Write-Host "2. Testing Get Profile..." -ForegroundColor Green
try {
    $profileResponse = Invoke-RestMethod -Uri "$authServiceUrl/auth/profile" -Method Get -Headers @{
        Authorization = "Bearer $accessToken"
    }
    Write-Host "✓ Profile retrieved successfully!" -ForegroundColor Green
    Write-Host "  User ID: $($profileResponse.id)"
    Write-Host "  Name: $($profileResponse.name)"
    Write-Host "  Email: $($profileResponse.email)"
    Write-Host "  Roles: $($profileResponse.roles -join ', ')"
} catch {
    Write-Host "✗ Get Profile failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Refresh Token
Write-Host "3. Testing Refresh Token..." -ForegroundColor Green
$refreshBody = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$authServiceUrl/auth/refresh" -Method Post -Body $refreshBody -ContentType "application/json"
    Write-Host "✓ Token refresh successful!" -ForegroundColor Green
    Write-Host "  New Access Token: $($refreshResponse.accessToken.Substring(0, 20))..."
} catch {
    Write-Host "✗ Token refresh failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "--- Auth Service Tests Complete ---" -ForegroundColor Cyan 