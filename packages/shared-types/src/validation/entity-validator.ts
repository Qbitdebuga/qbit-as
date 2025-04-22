/**
 * Entity Validator Utilities
 * 
 * These utilities help validate data consistency across microservices
 * by providing functions to check entity references and validate
 * business rules.
 */

import { Account, AccountType } from '../models/account';
import { JournalEntry, JournalEntryLine } from '../models/journal-entry';

/**
 * Error type for validation errors
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Result of a validation check
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Utility class for validating entities and cross-service data consistency
 */
export class EntityValidator {
  /**
   * Create a successful validation result
   */
  static success(): ValidationResult {
    return { valid: true, errors: [] };
  }

  /**
   * Create a failed validation result with the given errors
   */
  static failure(errors: ValidationError[]): ValidationResult {
    return { valid: false, errors };
  }

  /**
   * Validate a journal entry for balanced debits and credits
   */
  static validateJournalEntryBalance(entry: JournalEntry | { lines: JournalEntryLine[] }): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Calculate total debits and credits
    let totalDebits = 0;
    let totalCredits = 0;
    
    entry.lines.forEach(line => {
      totalDebits += line.debit || 0;
      totalCredits += line.credit || 0;
    });
    
    // Ensure the entry is balanced
    if (Math.abs(totalDebits - totalCredits) > 0.001) { // Allow small rounding differences
      errors.push(new ValidationError(
        'Journal entry is not balanced',
        'UNBALANCED_ENTRY',
        'lines',
        { totalDebits, totalCredits, difference: totalDebits - totalCredits }
      ));
    }
    
    // Ensure each line has either a debit or credit, but not both
    entry.lines.forEach((line, index) => {
      if ((line.debit && line.credit) || (!line.debit && !line.credit)) {
        errors.push(new ValidationError(
          'Journal entry line must have either a debit or a credit, but not both',
          'INVALID_LINE',
          `lines[${index}]`,
          { lineId: line.id }
        ));
      }
    });
    
    return errors.length ? EntityValidator.failure(errors) : EntityValidator.success();
  }

  /**
   * Validate account relationships to ensure they follow the account hierarchy rules
   */
  static validateAccountHierarchy(account: Account, parentAccount?: Account): ValidationResult {
    const errors: ValidationError[] = [];
    
    // If parent account is provided, check that it's a valid parent
    if (parentAccount) {
      // Parent account should be of the same type
      if (account.type !== parentAccount.type) {
        errors.push(new ValidationError(
          'Parent account must be of the same type',
          'INVALID_PARENT',
          'parentId',
          { 
            accountType: account.type, 
            parentType: parentAccount.type 
          }
        ));
      }
      
      // Prevent circular references
      if (account.id === parentAccount.id) {
        errors.push(new ValidationError(
          'Account cannot be its own parent',
          'CIRCULAR_REFERENCE',
          'parentId'
        ));
      }
    }
    
    return errors.length ? EntityValidator.failure(errors) : EntityValidator.success();
  }

  /**
   * Validate that accounts used in a journal entry exist and are active
   */
  static validateJournalEntryAccounts(
    entry: JournalEntry | { lines: { accountId: string }[] },
    accountsMap: Map<string, Account>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    entry.lines.forEach((line, index) => {
      const account = accountsMap.get(line.accountId);
      
      if (!account) {
        errors.push(new ValidationError(
          `Account with ID ${line.accountId} does not exist`,
          'ACCOUNT_NOT_FOUND',
          `lines[${index}].accountId`
        ));
      } else if (!account.isActive) {
        errors.push(new ValidationError(
          `Account ${account.code} - ${account.name} is inactive`,
          'INACTIVE_ACCOUNT',
          `lines[${index}].accountId`,
          { accountCode: account.code, accountName: account.name }
        ));
      }
    });
    
    return errors.length ? EntityValidator.failure(errors) : EntityValidator.success();
  }

  /**
   * Validate that the account's normal balance matches the entry direction
   * (e.g., assets and expenses normally have debit balances)
   */
  static validateAccountNormalBalances(
    entry: { lines: { accountId: string; debit?: number; credit?: number }[] },
    accountsMap: Map<string, Account>
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    // This is just a warning, not an error, so we'll return success even if there are anomalies
    const warnings: { 
      lineIndex: number; 
      accountId: string; 
      accountType: AccountType; 
      hasDebit: boolean 
    }[] = [];
    
    entry.lines.forEach((line, index) => {
      const account = accountsMap.get(line.accountId);
      if (!account) return; // Skip if account not found (other validation will catch this)
      
      const hasDebit = !!line.debit;
      const isNormalBalance = (
        // Assets and expenses normally have debit balances
        ((account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) && hasDebit) ||
        // Liabilities, equity, and revenue normally have credit balances
        ((account.type === AccountType.LIABILITY || account.type === AccountType.EQUITY || 
          account.type === AccountType.REVENUE) && !hasDebit)
      );
      
      if (!isNormalBalance) {
        warnings.push({
          lineIndex: index,
          accountId: account.id,
          accountType: account.type,
          hasDebit
        });
      }
    });
    
    // Add as a non-blocking warning if there are any anomalies
    if (warnings.length > 0) {
      errors.push(new ValidationError(
        'Some account entries have opposite-to-normal balances',
        'ABNORMAL_BALANCE_WARNING',
        undefined,
        { warnings }
      ));
    }
    
    // This is just a warning, so we still return success
    return EntityValidator.success();
  }
  
  /**
   * Combine multiple validation results into one
   */
  static combineResults(...results: ValidationResult[]): ValidationResult {
    const allErrors = results.flatMap(result => result.errors);
    const valid = results.every(result => result.valid);
    
    return {
      valid,
      errors: allErrors
    };
  }
} 