#!/bin/bash

# Script to run Prisma migrations for all services
# Usage: ./run-migrations.sh [environment]

# Default to development environment if not specified
ENVIRONMENT=${1:-"development"}

# Display header
echo ""
echo -e "\033[0;36m=========================================================\033[0m"
echo -e "\033[0;36mQbit Accounting System - Database Migration Tool\033[0m"
echo -e "\033[0;36mRunning migrations for $ENVIRONMENT environment\033[0m"
echo -e "\033[0;36m=========================================================\033[0m"
echo ""

# Function to run migrations for a specific service
run_service_migration() {
    local service_name=$1
    local database_url=$2
    
    echo -e "\033[0;33mMigrating $service_name database...\033[0m"
    
    # Check if service directory exists
    if [ ! -d "services/$service_name" ]; then
        echo -e "\033[0;31mService directory not found for $service_name\033[0m"
        return 1
    fi
    
    # Check if prisma directory exists
    if [ ! -d "services/$service_name/prisma" ]; then
        echo -e "\033[0;31mPrisma directory not found for $service_name\033[0m"
        return 1
    fi
    
    # Run status check
    echo -e "\033[0;37mChecking migration status...\033[0m"
    DATABASE_URL=$database_url npx --prefix "services/$service_name" prisma migrate status
    
    # Run migration
    echo -e "\033[0;37mApplying migrations...\033[0m"
    DATABASE_URL=$database_url npx --prefix "services/$service_name" prisma migrate deploy
    
    if [ $? -eq 0 ]; then
        echo -e "\033[0;32mMigration completed for $service_name\033[0m"
        return 0
    else
        echo -e "\033[0;31mError migrating $service_name\033[0m"
        return 1
    fi
}

# Load environment variables
ENV_FILE=".env"
if [ "$ENVIRONMENT" != "development" ]; then
    ENV_FILE=".env.$ENVIRONMENT"
fi

if [ -f "$ENV_FILE" ]; then
    echo -e "\033[0;36mLoading environment variables from $ENV_FILE\033[0m"
    export $(grep -v '^#' $ENV_FILE | xargs)
else
    echo -e "\033[0;33mEnvironment file $ENV_FILE not found. Using existing environment variables.\033[0m"
fi

# Define services and their database URLs
declare -A services
services["auth"]=${AUTH_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_auth?schema=public"}
services["general-ledger"]=${GL_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_general_ledger?schema=public"}
services["accounts-payable"]=${AP_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_accounts_payable?schema=public"}
services["accounts-receivable"]=${AR_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_accounts_receivable?schema=public"}
services["banking"]=${BANKING_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_banking?schema=public"}
services["fixed-assets"]=${FA_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_fixed_assets?schema=public"}
services["inventory"]=${INVENTORY_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_inventory?schema=public"}
services["reporting"]=${REPORTING_DB_URL:-"postgresql://postgres:postgres@localhost:5432/qbit_reporting?schema=public"}

# Run migrations for each service
success_count=0
total_services=${#services[@]}

for service_name in "${!services[@]}"; do
    database_url=${services[$service_name]}
    
    if run_service_migration "$service_name" "$database_url"; then
        ((success_count++))
    fi
    echo "" # Add spacing between services
done

# Summary
echo -e "\033[0;36m=========================================================\033[0m"
echo -e "\033[0;36mMigration Summary: $success_count of $total_services services migrated successfully\033[0m"
echo -e "\033[0;36m=========================================================\033[0m" 