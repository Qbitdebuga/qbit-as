# PowerShell script to install required dependencies for event publishing

# Text colors
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"

Write-Host "Setting up Event Publishing for Auth Service..." -ForegroundColor $Yellow

# Check if events directory exists
if (Test-Path -Path "src\events") {
    Write-Host "Events directory already exists." -ForegroundColor $Green
} else {
    Write-Host "Creating events directory structure..." -ForegroundColor $Yellow
    New-Item -Path "src\events" -ItemType Directory -Force | Out-Null
    New-Item -Path "src\events\events.module.ts" -ItemType File -Force | Out-Null
    New-Item -Path "src\events\events.service.ts" -ItemType File -Force | Out-Null
    Write-Host "Event directories and files created." -ForegroundColor $Green
}

# Install microservices dependencies
Write-Host "Installing required dependencies..." -ForegroundColor $Yellow
yarn add @nestjs/microservices amqp-connection-manager amqplib

# Check if installation was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor $Green
    
    # Remind user to uncomment the ClientsModule in events.module.ts
    Write-Host "Now you need to uncomment the ClientsModule in src/events/events.module.ts" -ForegroundColor $Yellow
    Write-Host "and uncomment the @InjectClient decorator in the publishers." -ForegroundColor $Yellow
    
    # Check if RabbitMQ environment variables are set
    Write-Host "Checking environment variables..." -ForegroundColor $Yellow
    
    $EnvContent = Get-Content -Path "../.env" -ErrorAction SilentlyContinue
    if ($EnvContent -match "RABBITMQ_URL") {
        Write-Host "RabbitMQ environment variables found." -ForegroundColor $Green
    } else {
        Write-Host "RabbitMQ environment variables not found in .env file." -ForegroundColor $Red
        Write-Host "Please add the following to your .env file:" -ForegroundColor $Yellow
        Write-Host "RABBITMQ_URL=amqp://qbit:qbit_password@localhost:5672"
        Write-Host "RABBITMQ_QUEUE=auth_queue"
        Write-Host "RABBITMQ_EXCHANGE=qbit_events"
    }
    
    Write-Host "Event Publishing setup complete!" -ForegroundColor $Green
} else {
    Write-Host "Failed to install dependencies. Please try again or install manually." -ForegroundColor $Red
    exit 1
} 