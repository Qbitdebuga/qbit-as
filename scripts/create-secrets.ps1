# PowerShell script to generate and apply Kubernetes secrets for local development
# Usage: .\create-secrets.ps1

param(
    [string]$Namespace = "qbit",
    [switch]$GenerateValues = $false
)

function Generate-RandomString {
    param(
        [int]$Length = 32
    )
    
    $chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
    $result = ""
    $random = New-Object System.Random
    
    for ($i = 0; $i -lt $Length; $i++) {
        $result += $chars[$random.Next(0, $chars.Length)]
    }
    
    return $result
}

# Display header
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Qbit Accounting System - Kubernetes Secrets Generator" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is installed
if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Host "Error: kubectl is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Create namespace if not exists
Write-Host "Creating namespace: $Namespace" -ForegroundColor Yellow
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Generate or load secret values
$secretValues = @{}

if ($GenerateValues) {
    Write-Host "Generating random values for secrets..." -ForegroundColor Yellow
    $secretValues["POSTGRES_PASSWORD"] = Generate-RandomString -Length 24
    $secretValues["JWT_SECRET"] = Generate-RandomString -Length 48
    $secretValues["SERVICE_JWT_SECRET"] = Generate-RandomString -Length 48
    $secretValues["RABBITMQ_PASSWORD"] = Generate-RandomString -Length 24
    
    # Save generated values to a file for reference
    $secretValues | ConvertTo-Json | Set-Content -Path ".generated-secrets.json"
    Write-Host "Secret values saved to .generated-secrets.json" -ForegroundColor Green
}
else {
    # Try to load existing values
    if (Test-Path ".generated-secrets.json") {
        Write-Host "Loading secret values from .generated-secrets.json" -ForegroundColor Yellow
        $secretValues = Get-Content -Path ".generated-secrets.json" | ConvertFrom-Json -AsHashtable
    }
    else {
        # Prompt for values
        Write-Host "Please enter values for secrets:" -ForegroundColor Yellow
        $secretValues["POSTGRES_PASSWORD"] = Read-Host -Prompt "Postgres password"
        $secretValues["JWT_SECRET"] = Read-Host -Prompt "JWT secret"
        $secretValues["SERVICE_JWT_SECRET"] = Read-Host -Prompt "Service JWT secret"
        $secretValues["RABBITMQ_PASSWORD"] = Read-Host -Prompt "RabbitMQ password"
    }
}

# Create PostgreSQL password secret
Write-Host "Creating PostgreSQL secret..." -ForegroundColor Yellow
$postgresCmd = "kubectl create secret generic postgres-secrets " +
              "--from-literal=POSTGRES_PASSWORD='$($secretValues["POSTGRES_PASSWORD"])' " +
              "--namespace $Namespace " +
              "--dry-run=client -o yaml | kubectl apply -f -"
Invoke-Expression $postgresCmd

# Create API Gateway secrets
Write-Host "Creating API Gateway secrets..." -ForegroundColor Yellow
$apiGatewayCmd = "kubectl create secret generic api-gateway-secrets " +
                "--from-literal=JWT_SECRET='$($secretValues["JWT_SECRET"])' " +
                "--from-literal=SERVICE_JWT_SECRET='$($secretValues["SERVICE_JWT_SECRET"])' " +
                "--from-literal=RABBITMQ_PASSWORD='$($secretValues["RABBITMQ_PASSWORD"])' " +
                "--namespace $Namespace " +
                "--dry-run=client -o yaml | kubectl apply -f -"
Invoke-Expression $apiGatewayCmd

# Create Auth Service secrets
Write-Host "Creating Auth Service secrets..." -ForegroundColor Yellow
$authCmd = "kubectl create secret generic auth-service-secrets " +
          "--from-literal=JWT_SECRET='$($secretValues["JWT_SECRET"])' " +
          "--from-literal=SERVICE_JWT_SECRET='$($secretValues["SERVICE_JWT_SECRET"])' " +
          "--from-literal=DATABASE_PASSWORD='$($secretValues["POSTGRES_PASSWORD"])' " +
          "--from-literal=RABBITMQ_PASSWORD='$($secretValues["RABBITMQ_PASSWORD"])' " +
          "--namespace $Namespace " +
          "--dry-run=client -o yaml | kubectl apply -f -"
Invoke-Expression $authCmd

# Create General Ledger secrets
Write-Host "Creating General Ledger secrets..." -ForegroundColor Yellow
$glCmd = "kubectl create secret generic general-ledger-secrets " +
        "--from-literal=DATABASE_PASSWORD='$($secretValues["POSTGRES_PASSWORD"])' " +
        "--from-literal=RABBITMQ_PASSWORD='$($secretValues["RABBITMQ_PASSWORD"])' " +
        "--from-literal=SERVICE_JWT_SECRET='$($secretValues["SERVICE_JWT_SECRET"])' " +
        "--namespace $Namespace " +
        "--dry-run=client -o yaml | kubectl apply -f -"
Invoke-Expression $glCmd

# Create RabbitMQ secrets
Write-Host "Creating RabbitMQ secrets..." -ForegroundColor Yellow
$rmqCmd = "kubectl create secret generic rabbitmq-secrets " +
         "--from-literal=RABBITMQ_PASSWORD='$($secretValues["RABBITMQ_PASSWORD"])' " +
         "--namespace $Namespace " +
         "--dry-run=client -o yaml | kubectl apply -f -"
Invoke-Expression $rmqCmd

# Create other service secrets (abbreviated for brevity)
$services = @(
    "accounts-payable",
    "accounts-receivable",
    "banking",
    "fixed-assets",
    "inventory",
    "reporting"
)

foreach ($service in $services) {
    Write-Host "Creating $service secrets..." -ForegroundColor Yellow
    $serviceCmd = "kubectl create secret generic $service-secrets " +
                 "--from-literal=DATABASE_PASSWORD='$($secretValues["POSTGRES_PASSWORD"])' " +
                 "--from-literal=RABBITMQ_PASSWORD='$($secretValues["RABBITMQ_PASSWORD"])' " +
                 "--from-literal=SERVICE_JWT_SECRET='$($secretValues["SERVICE_JWT_SECRET"])' " +
                 "--from-literal=JWT_SECRET='$($secretValues["JWT_SECRET"])' " +
                 "--namespace $Namespace " +
                 "--dry-run=client -o yaml | kubectl apply -f -"
    Invoke-Expression $serviceCmd
}

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "All Kubernetes secrets created successfully!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green 