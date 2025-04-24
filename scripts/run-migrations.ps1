# PowerShell script to run Prisma migrations for all services
# Usage: .\run-migrations.ps1 [environment]

param(
    [string]$Environment = "development"
)

$ErrorActionPreference = "Stop"

# Display header
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Qbit Accounting System - Database Migration Tool" -ForegroundColor Cyan
Write-Host "Running migrations for $Environment environment" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Function to run migrations for a specific service
function Run-ServiceMigration {
    param (
        [string]$ServiceName,
        [string]$DatabaseUrl
    )
    
    Write-Host "Migrating $ServiceName database..." -ForegroundColor Yellow
    
    # Check if service directory exists
    if (-not (Test-Path "services/$ServiceName")) {
        Write-Host "Service directory not found for $ServiceName" -ForegroundColor Red
        return $false
    }
    
    # Check if prisma directory exists
    if (-not (Test-Path "services/$ServiceName/prisma")) {
        Write-Host "Prisma directory not found for $ServiceName" -ForegroundColor Red
        return $false
    }
    
    try {
        # Run status check
        Write-Host "Checking migration status..." -ForegroundColor Gray
        $env:DATABASE_URL = $DatabaseUrl
        $status = npx --prefix "services/$ServiceName" prisma migrate status
        Write-Host $status -ForegroundColor Gray
        
        # Run migration
        Write-Host "Applying migrations..." -ForegroundColor Gray
        $result = npx --prefix "services/$ServiceName" prisma migrate deploy
        Write-Host $result -ForegroundColor Gray
        
        Write-Host "Migration completed for $ServiceName" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error migrating $ServiceName: $_" -ForegroundColor Red
        return $false
    }
    finally {
        Remove-Item env:DATABASE_URL -ErrorAction SilentlyContinue
    }
}

# Load environment variables
$envFile = if ($Environment -eq "development") { ".env" } else { ".env.$Environment" }

if (Test-Path $envFile) {
    Write-Host "Loading environment variables from $envFile" -ForegroundColor Cyan
    Get-Content $envFile | ForEach-Object {
        if ($_) {
            $parts = $_.split('=', 2)
            if ($parts.Length -eq 2) {
                $name = $parts[0].Trim()
                $value = $parts[1].Trim()
                if ($name) {
                    Set-Item -Path "env:$name" -Value $value
                }
            }
        }
    }
}
else {
    Write-Host "Environment file $envFile not found. Using existing environment variables." -ForegroundColor Yellow
}

# Array of services and their database URLs
$services = @(
    @{
        Name = "auth"
        DatabaseUrl = if ($env:AUTH_DB_URL) { $env:AUTH_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_auth?schema=public" }
    },
    @{
        Name = "general-ledger"
        DatabaseUrl = if ($env:GL_DB_URL) { $env:GL_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_general_ledger?schema=public" }
    },
    @{
        Name = "accounts-payable"
        DatabaseUrl = if ($env:AP_DB_URL) { $env:AP_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_accounts_payable?schema=public" }
    },
    @{
        Name = "accounts-receivable"
        DatabaseUrl = if ($env:AR_DB_URL) { $env:AR_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_accounts_receivable?schema=public" }
    },
    @{
        Name = "banking"
        DatabaseUrl = if ($env:BANKING_DB_URL) { $env:BANKING_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_banking?schema=public" }
    },
    @{
        Name = "fixed-assets"
        DatabaseUrl = if ($env:FA_DB_URL) { $env:FA_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_fixed_assets?schema=public" }
    },
    @{
        Name = "inventory"
        DatabaseUrl = if ($env:INVENTORY_DB_URL) { $env:INVENTORY_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_inventory?schema=public" }
    },
    @{
        Name = "reporting"
        DatabaseUrl = if ($env:REPORTING_DB_URL) { $env:REPORTING_DB_URL } else { "postgresql://postgres:postgres@localhost:5432/qbit_reporting?schema=public" }
    }
)

# Run migrations for each service
$successCount = 0
$totalServices = $services.Count

foreach ($service in $services) {
    $result = Run-ServiceMigration -ServiceName $service.Name -DatabaseUrl $service.DatabaseUrl
    if ($result) {
        $successCount++
    }
    Write-Host "" # Add spacing between services
}

# Summary
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "Migration Summary: $successCount of $totalServices services migrated successfully" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan 