import Joi from 'joi';

export const serviceConfigSchema = Joi.object({
  // Auth Service
  AUTH_SERVICE_URL: Joi.string().required(),
  AUTH_SERVICE_API_KEY: Joi.string().required(),
  
  // General Ledger Service
  GENERAL_LEDGER_SERVICE_URL: Joi.string().required(),
  GENERAL_LEDGER_SERVICE_API_KEY: Joi.string().required(),
  
  // Accounts Receivable Service
  ACCOUNTS_RECEIVABLE_SERVICE_URL: Joi.string().optional(),
  ACCOUNTS_RECEIVABLE_SERVICE_API_KEY: Joi.string().optional(),
  
  // Accounts Payable Service
  ACCOUNTS_PAYABLE_SERVICE_URL: Joi.string().optional(),
  ACCOUNTS_PAYABLE_SERVICE_API_KEY: Joi.string().optional(),
  
  // Inventory Service
  INVENTORY_SERVICE_URL: Joi.string().optional(),
  INVENTORY_SERVICE_API_KEY: Joi.string().optional(),
  
  // Fixed Assets Service
  FIXED_ASSETS_SERVICE_URL: Joi.string().optional(),
  FIXED_ASSETS_SERVICE_API_KEY: Joi.string().optional(),
  
  // Banking Service
  BANKING_SERVICE_URL: Joi.string().optional(),
  BANKING_SERVICE_API_KEY: Joi.string().optional(),
}); 