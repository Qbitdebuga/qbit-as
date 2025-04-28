/**
 * Data Validator Utilities
 * 
 * These utilities provide validation for common data types and patterns
 * across microservices.
 */

import { ValidationError, ValidationResult } from './entity-validator';

/**
 * Utility class for validating common data types
 */
export class DataValidator {
  /**
   * Validate that a string is a valid UUID v4
   */
  static isUuid(value: string): boolean {
    const uuidRegex = 
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Validate that a string is a valid email
   */
  static isEmail(value: string): boolean {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  /**
   * Validate that a string is a valid date in ISO format (YYYY-MM-DD)
   */
  static isIsoDate(value: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;
    
    // Check if it's a valid date
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * Validate that a string is not empty after trimming
   */
  static isNonEmptyString(value: string): boolean {
    return typeof value === 'string' && value.trim().length > 0;
  }

  /**
   * Validate that a number is in a valid range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  /**
   * Validate that a value is a number and not NaN
   */
  static isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value);
  }

  /**
   * Validate a currency amount (positive or negative number with up to 2 decimal places)
   */
  static isCurrencyAmount(value: number): boolean {
    if (!this.isValidNumber(value)) return false;
    
    // Check if it has at most 2 decimal places
    const decimalStr = value.toString().split('.')[1] || '';
    return decimalStr.length <= 2;
  }

  /**
   * Validate entity ID references 
   * Checks if an array of IDs exists in a Map of valid entities
   */
  static validateEntityReferences<T>(
    entityName: string,
    entityIds: string[],
    entitiesMap: Map<string, T>,
    fieldName: string = 'id'
  ): ValidationResult {
    const invalidIds = entityIds.filter(id => !entitiesMap.has(id));
    
    if (invalidIds.length === 0) {
      return { valid: true, errors: [] };
    }
    
    return {
      valid: false,
      errors: [
        new ValidationError(
          `Invalid ${entityName} references: ${invalidIds.join(', ')}`,
          'INVALID_REFERENCE',
          fieldName,
          { invalidIds }
        )
      ]
    };
  }

  /**
   * Validate that all required fields are present in an object
   */
  static validateRequiredFields(
    obj: Record<string, any>,
    requiredFields: string[]
  ): ValidationResult {
    const missingFields = requiredFields.filter((field: any) => {
      const value = obj[field];
      return value === undefined || value === null || value === '';
    });
    
    if (missingFields.length === 0) {
      return { valid: true, errors: [] };
    }
    
    return {
      valid: false,
      errors: [
        new ValidationError(
          `Missing required fields: ${missingFields.join(', ')}`,
          'MISSING_REQUIRED_FIELDS',
          undefined,
          { missingFields }
        )
      ]
    };
  }

  /**
   * Validate a monetary value (using currency rules)
   */
  static validateMonetaryValue(
    value: number,
    fieldName: string,
    options: { allowNegative?: boolean | null; allowZero?: boolean } = {}
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!this.isValidNumber(value)) {
      errors.push(new ValidationError(
        `${fieldName} must be a valid number`,
        'INVALID_MONEY_FORMAT',
        fieldName
      ));
      return { valid: false, errors };
    }
    
    if (!this.isCurrencyAmount(value)) {
      errors.push(new ValidationError(
        `${fieldName} must have at most 2 decimal places`,
        'INVALID_MONEY_PRECISION',
        fieldName,
        { value }
      ));
    }
    
    if (!options.allowNegative && value < 0) {
      errors.push(new ValidationError(
        `${fieldName} cannot be negative`,
        'NEGATIVE_AMOUNT',
        fieldName,
        { value }
      ));
    }
    
    if (!options.allowZero && value === 0) {
      errors.push(new ValidationError(
        `${fieldName} cannot be zero`,
        'ZERO_AMOUNT',
        fieldName
      ));
    }
    
    return errors.length ? { valid: false, errors } : { valid: true, errors: [] };
  }
} 