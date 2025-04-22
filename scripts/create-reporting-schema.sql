-- Check if database exists and create if it doesn't
SELECT 'CREATE DATABASE qbit_reporting' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'qbit_reporting');

-- For the rest of the script, it needs to be run after connecting to qbit_reporting database
-- psql -U postgres -d qbit_reporting -f scripts/create-reporting-views.sql

-- Create a schema for reporting views
CREATE SCHEMA IF NOT EXISTS reporting;

-- These views will be created once there are tables in the general ledger database
-- For now, we'll just create the schema and prepare the structure for later

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA reporting TO postgres;

-- Create views for consolidated financial data
CREATE OR REPLACE VIEW reporting.consolidated_accounts AS
SELECT 
    a.id, 
    a.code, 
    a.name, 
    a.type, 
    a.subtype, 
    a.is_active
FROM accounts a;

-- Create view for journal entries
CREATE OR REPLACE VIEW reporting.consolidated_journal_entries AS
SELECT 
    je.id,
    je.entry_number,
    je.date,
    je.description,
    je.status,
    COALESCE(SUM(jel.debit), 0) as total_amount,
    je.created_at,
    je.updated_at
FROM journal_entries je
LEFT JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
GROUP BY je.id, je.entry_number, je.date, je.description, je.status, je.created_at, je.updated_at;

-- Create view for journal entry lines with account details
CREATE OR REPLACE VIEW reporting.consolidated_journal_entry_lines AS
SELECT 
    jel.id,
    jel.journal_entry_id,
    jel.account_id,
    a.code as account_code,
    a.name as account_name,
    jel.description,
    jel.debit,
    jel.credit,
    jel.created_at,
    jel.updated_at
FROM journal_entry_lines jel
JOIN accounts a ON jel.account_id = a.id;

-- Create view for financial statement data
CREATE OR REPLACE VIEW reporting.financial_statement_data AS
SELECT 
    a.id as account_id,
    a.code as account_code,
    a.name as account_name,
    a.type as account_type,
    a.subtype as account_subtype,
    jel.journal_entry_id,
    je.date as transaction_date,
    COALESCE(jel.debit, 0) as debit,
    COALESCE(jel.credit, 0) as credit,
    CASE 
        WHEN a.type IN ('ASSET', 'EXPENSE') THEN COALESCE(jel.debit, 0) - COALESCE(jel.credit, 0)
        ELSE COALESCE(jel.credit, 0) - COALESCE(jel.debit, 0)
    END as net_amount
FROM accounts a
JOIN journal_entry_lines jel ON a.id = jel.account_id
JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.status = 'POSTED'; 