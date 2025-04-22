-- Create the reporting database if it doesn't exist
CREATE DATABASE qbit_reporting;

-- Connect to the reporting database
\c qbit_reporting;

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS reporting;
CREATE SCHEMA IF NOT EXISTS consolidated;

-- Create tables for consolidated data

-- User references table
CREATE TABLE IF NOT EXISTS consolidated.user_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id UUID NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE IF NOT EXISTS consolidated.accounts (
  id UUID PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  subtype VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  parent_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES consolidated.accounts(id) ON DELETE SET NULL
);

-- Journal entries table
CREATE TABLE IF NOT EXISTS consolidated.journal_entries (
  id UUID PRIMARY KEY,
  entry_number VARCHAR(50) NOT NULL UNIQUE,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  is_adjustment BOOLEAN DEFAULT FALSE,
  source_service VARCHAR(50) NOT NULL,
  amount DECIMAL(19, 4) NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES consolidated.user_references(external_id) ON DELETE SET NULL
);

-- Journal entry lines table
CREATE TABLE IF NOT EXISTS consolidated.journal_entry_lines (
  id UUID PRIMARY KEY,
  journal_entry_id UUID NOT NULL,
  account_id UUID NOT NULL,
  account_code VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  description TEXT,
  debit DECIMAL(19, 4),
  credit DECIMAL(19, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (journal_entry_id) REFERENCES consolidated.journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES consolidated.accounts(id) ON DELETE CASCADE
);

-- Reports table
CREATE TABLE IF NOT EXISTS reporting.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  parameters JSONB,
  owner_id UUID,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES consolidated.user_references(external_id) ON DELETE SET NULL
);

-- Report snapshots table
CREATE TABLE IF NOT EXISTS reporting.report_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  data JSONB NOT NULL,
  parameters JSONB,
  generated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reporting.reports(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_by) REFERENCES consolidated.user_references(external_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_type ON consolidated.accounts(type);
CREATE INDEX IF NOT EXISTS idx_accounts_subtype ON consolidated.accounts(subtype);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON consolidated.journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON consolidated.journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON consolidated.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal_entry ON consolidated.journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reporting.reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_owner ON reporting.reports(owner_id);
CREATE INDEX IF NOT EXISTS idx_report_snapshots_report ON reporting.report_snapshots(report_id);

-- Grant privileges
GRANT ALL PRIVILEGES ON SCHEMA consolidated TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA reporting TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA consolidated TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA reporting TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA consolidated TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA reporting TO postgres; 