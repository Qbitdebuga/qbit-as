# PowerShell script to set up Qbit development environment
# This script starts all required services and initializes configurations

# Text colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

# Function to check if Docker is running
function Test-Docker {
    Write-Host "Checking if Docker is running..." -ForegroundColor $Yellow
    try {
        $null = docker info
        Write-Host "Docker is running." -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor $Red
        return $false
    }
}

# Function to check if docker-compose exists
function Test-DockerCompose {
    Write-Host "Checking for docker-compose..." -ForegroundColor $Yellow
    try {
        $null = docker-compose --version
        Write-Host "docker-compose is installed." -ForegroundColor $Green
        return $true
    }
    catch {
        Write-Host "docker-compose not found. Please make sure Docker Desktop is properly installed." -ForegroundColor $Red
        return $false
    }
}

# Main setup function
function Initialize-Environment {
    Write-Host "Starting Qbit development environment setup..." -ForegroundColor $Yellow
    
    # Starting infrastructure services
    Write-Host "Starting infrastructure services (PostgreSQL, RabbitMQ, Consul)..." -ForegroundColor $Yellow
    docker-compose up -d postgres rabbitmq consul
    
    # Wait for services to be healthy
    Write-Host "Waiting for services to be healthy..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 10
    
    # Check if services are healthy
    $services = docker-compose ps
    $postgresRunning = $services -match "postgres.*running"
    $rabbitmqRunning = $services -match "rabbitmq.*running"
    $consulRunning = $services -match "consul.*running"
    
    if ($postgresRunning -and $rabbitmqRunning -and $consulRunning) {
        Write-Host "Infrastructure services are running." -ForegroundColor $Green
    }
    else {
        Write-Host "Some services failed to start. Check docker-compose logs for more details." -ForegroundColor $Red
        exit 1
    }
    
    # Start application services
    Write-Host "Starting application services (Auth Service, API Gateway)..." -ForegroundColor $Yellow
    docker-compose up -d auth api-gateway
    
    # Wait for application services to be ready
    Write-Host "Waiting for application services to start..." -ForegroundColor $Yellow
    Start-Sleep -Seconds 10
    
    # Start web application
    Write-Host "Starting web application..." -ForegroundColor $Yellow
    docker-compose up -d web
    
    Write-Host "====================================================" -ForegroundColor $Green
    Write-Host "Qbit development environment is now running!" -ForegroundColor $Green
    Write-Host "====================================================" -ForegroundColor $Green
    Write-Host "Services available:" -ForegroundColor $Green
    Write-Host "- Web App: http://localhost:3001" -ForegroundColor $Green
    Write-Host "- API Gateway: http://localhost:3000" -ForegroundColor $Green
    Write-Host "- Auth Service: http://localhost:3002" -ForegroundColor $Green
    Write-Host "- RabbitMQ Management: http://localhost:15672" -ForegroundColor $Green
    Write-Host "  Username: qbit" -ForegroundColor $Green
    Write-Host "  Password: qbit_password" -ForegroundColor $Green
    Write-Host "- Consul UI: http://localhost:8500" -ForegroundColor $Green
    Write-Host "- PgAdmin: http://localhost:5050" -ForegroundColor $Green
    Write-Host "  Email: admin@qbit.com" -ForegroundColor $Green
    Write-Host "  Password: admin123" -ForegroundColor $Green
    Write-Host "====================================================" -ForegroundColor $Green
}

# Function to display help
function Show-Help {
    Write-Host "Usage: .\setup-dev-env.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -start       Start all services (default if no option provided)"
    Write-Host "  -stop        Stop all services"
    Write-Host "  -restart     Restart all services"
    Write-Host "  -status      Show status of all services"
    Write-Host "  -logs        Show logs from all services"
    Write-Host "  -help        Show this help message"
}

# Process command line arguments
$action = "start"

if ($args.Count -gt 0) {
    switch ($args[0]) {
        "-start" { $action = "start" }
        "-stop" { $action = "stop" }
        "-restart" { $action = "restart" }
        "-status" { $action = "status" }
        "-logs" { $action = "logs" }
        "-help" { Show-Help; exit 0 }
        default { 
            Write-Host "Unknown option: $($args[0])" -ForegroundColor $Red
            Show-Help
            exit 1
        }
    }
}

# Execute the requested action
switch ($action) {
    "start" {
        if (-not (Test-Docker)) { exit 1 }
        if (-not (Test-DockerCompose)) { exit 1 }
        Initialize-Environment
    }
    "stop" {
        Write-Host "Stopping all services..." -ForegroundColor $Yellow
        docker-compose down
        Write-Host "All services stopped." -ForegroundColor $Green
    }
    "restart" {
        Write-Host "Restarting all services..." -ForegroundColor $Yellow
        docker-compose down
        if (-not (Test-Docker)) { exit 1 }
        if (-not (Test-DockerCompose)) { exit 1 }
        Initialize-Environment
    }
    "status" {
        Write-Host "Current status of services:" -ForegroundColor $Yellow
        docker-compose ps
    }
    "logs" {
        Write-Host "Showing logs from all services:" -ForegroundColor $Yellow
        docker-compose logs --tail=100
    }
}

exit 0 