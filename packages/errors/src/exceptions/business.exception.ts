import { HttpStatus } from '@nestjs/common';
import { ApiException, ErrorCode } from './api.exception';

/**
 * Business logic exception codes
 */
export enum BusinessErrorCode {
  // Account-related errors
  ACCOUNT_CLOSED = 'ACCOUNT_CLOSED',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_ACCOUNT_STATUS = 'INVALID_ACCOUNT_STATUS',
  
  // Transaction-related errors
  TRANSACTION_INVALID = 'TRANSACTION_INVALID',
  TRANSACTION_UNBALANCED = 'TRANSACTION_UNBALANCED',
  TRANSACTION_POSTED = 'TRANSACTION_POSTED',
  TRANSACTION_VOIDED = 'TRANSACTION_VOIDED',
  
  // Invoice-related errors
  INVOICE_ALREADY_PAID = 'INVOICE_ALREADY_PAID',
  INVOICE_EXPIRED = 'INVOICE_EXPIRED',
  INVOICE_CANCELLED = 'INVOICE_CANCELLED',
  
  // Bill-related errors
  BILL_ALREADY_PAID = 'BILL_ALREADY_PAID',
  BILL_EXPIRED = 'BILL_EXPIRED',
  BILL_CANCELLED = 'BILL_CANCELLED',
  
  // Inventory-related errors
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  PRODUCT_DISCONTINUED = 'PRODUCT_DISCONTINUED',
  
  // Reporting-related errors
  REPORT_GENERATION_FAILED = 'REPORT_GENERATION_FAILED',
  INVALID_DATE_RANGE = 'INVALID_DATE_RANGE',
  
  // General-purpose errors
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  INVALID_STATE_TRANSITION = 'INVALID_STATE_TRANSITION',
  DEPENDENCY_VIOLATION = 'DEPENDENCY_VIOLATION',
}

/**
 * BusinessException for business logic related errors
 * 
 * Use this for domain-specific business rule violations that are expected
 * in normal business operations and should be handled gracefully.
 */
export class BusinessException extends ApiException {
  /**
   * Create a new business exception
   * @param errorCode Business error code
   * @param message User-friendly error message
   * @param details Additional details about the error
   */
  constructor(
    public readonly errorCode: BusinessErrorCode | string,
    message: string,
    details?: Record<string, any>,
  ) {
    super(
      errorCode,
      message,
      details,
      BusinessException.getStatusCodeFromBusinessErrorCode(errorCode),
    );
  }

  /**
   * Map business error code to HTTP status code
   * Most business errors are treated as 400 Bad Request
   */
  private static getStatusCodeFromBusinessErrorCode(
    errorCode: BusinessErrorCode | string,
  ): HttpStatus {
    switch (errorCode) {
      case BusinessErrorCode.INSUFFICIENT_FUNDS:
      case BusinessErrorCode.INSUFFICIENT_INVENTORY:
      case BusinessErrorCode.INVOICE_ALREADY_PAID:
      case BusinessErrorCode.BILL_ALREADY_PAID:
        return HttpStatus.PAYMENT_REQUIRED;
        
      case BusinessErrorCode.ACCOUNT_BLOCKED:
      case BusinessErrorCode.OPERATION_NOT_ALLOWED:
        return HttpStatus.FORBIDDEN;
      
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
  
  /**
   * Helper method to create an insufficient funds exception
   */
  static insufficientFunds(accountId: string, required: number, available: number): BusinessException {
    return new BusinessException(
      BusinessErrorCode.INSUFFICIENT_FUNDS,
      `Insufficient funds in account ${accountId}`,
      {
        accountId,
        required,
        available,
        deficit: required - available,
      },
    );
  }
  
  /**
   * Helper method to create an unbalanced transaction exception
   */
  static unbalancedTransaction(debitTotal: number, creditTotal: number): BusinessException {
    return new BusinessException(
      BusinessErrorCode.TRANSACTION_UNBALANCED,
      `Transaction is unbalanced: debits (${debitTotal}) do not equal credits (${creditTotal})`,
      {
        debitTotal,
        creditTotal,
        difference: debitTotal - creditTotal,
      },
    );
  }
} 