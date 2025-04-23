#!/bin/bash
set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
/app/scripts/wait-for-it.sh postgres:5432 -t 60

# Create database if it doesn't exist
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE qbit_reporting' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'qbit_reporting');
EOSQL

# Run prisma migrations
echo "Running database migrations..."
cd /app && npx prisma migrate deploy

echo "Database initialization completed." 