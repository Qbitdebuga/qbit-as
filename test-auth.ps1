# Test auth login endpoint with verbose error handling
$loginBody = @{
    email = "admin@qbit.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Testing login with admin@qbit.com..." -ForegroundColor Cyan
Write-Host "Request URL: http://localhost:3002/auth/login" -ForegroundColor Cyan
Write-Host "Request Body: $loginBody" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

try {
    # First, check if the server is responding
    Write-Host "Testing server connection..." -ForegroundColor Yellow
    try {
        $connectionTest = Invoke-WebRequest -Uri "http://localhost:3002" -Method Get -TimeoutSec 5 -ErrorAction SilentlyContinue
        Write-Host "Server responded with status code: $($connectionTest.StatusCode)" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Server responded with status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        Write-Host "This is expected if there is no root endpoint defined, continuing with login test..." -ForegroundColor Yellow
    }
    
    # Now try the login
    Write-Host "Sending login request..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3002/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "Status code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Green
    
    $content = $response.Content | ConvertFrom-Json
    
    if ($content.accessToken) {
        Write-Host "Login successful! Got access token." -ForegroundColor Green
    }
} catch {
    Write-Host "Error calling API: $($_)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status code: $statusCode" -ForegroundColor Red
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody" -ForegroundColor Red
        } catch {
            Write-Host "Could not read response body: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "No response received. Server might be down or unreachable." -ForegroundColor Red
    }
} 