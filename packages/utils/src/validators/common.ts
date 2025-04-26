/**
 * Common validation utilities
 */

/**
 * Validate an email address
 * 
 * @param email - Email address to validate
 * @returns Whether the email is valid
 * 
 * @example
 * ```typescript
 * // true
 * isValidEmail('user@example.com');
 * 
 * // false
 * isValidEmail('invalid-email');
 * ```
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  // RFC 5322 compliant email regex
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

/**
 * Validate a password strength
 * 
 * @param password - Password to validate
 * @param options - Validation options
 * @returns Object with validation result and reasons
 * 
 * @example
 * ```typescript
 * // { isValid: true }
 * validatePassword('StrongP@ss123');
 * 
 * // { isValid: false, reasons: ['Password must be at least 8 characters long'] }
 * validatePassword('weak');
 * ```
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireNumbers?: boolean;
    requireLowercase?: boolean;
    requireUppercase?: boolean;
    requireSpecial?: boolean;
    forbiddenChars?: string[];
  } = {}
): { isValid: boolean; reasons?: string[] } {
  const {
    minLength = 8,
    requireNumbers = true,
    requireLowercase = true,
    requireUppercase = true,
    requireSpecial = true,
    forbiddenChars = [],
  } = options;

  const reasons: string[] = [];

  // Check minimum length
  if (password.length < minLength) {
    reasons.push(`Password must be at least ${minLength} characters long`);
  }

  // Check for numbers
  if (requireNumbers && !/\d/.test(password)) {
    reasons.push('Password must contain at least one number');
  }

  // Check for lowercase letters
  if (requireLowercase && !/[a-z]/.test(password)) {
    reasons.push('Password must contain at least one lowercase letter');
  }

  // Check for uppercase letters
  if (requireUppercase && !/[A-Z]/.test(password)) {
    reasons.push('Password must contain at least one uppercase letter');
  }

  // Check for special characters
  if (requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    reasons.push('Password must contain at least one special character');
  }

  // Check for forbidden characters
  if (forbiddenChars.length > 0) {
    const hasForbiddenChar = forbiddenChars.some(char => password.includes(char));
    if (hasForbiddenChar) {
      reasons.push(`Password contains forbidden characters: ${forbiddenChars.join(', ')}`);
    }
  }

  return {
    isValid: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : undefined,
  };
}

/**
 * Validate a URL
 * 
 * @param url - URL to validate
 * @param options - Validation options
 * @returns Whether the URL is valid
 * 
 * @example
 * ```typescript
 * // true
 * isValidUrl('https://example.com');
 * 
 * // false
 * isValidUrl('not-a-url');
 * 
 * // true (only https)
 * isValidUrl('https://example.com', { protocols: ['https'] });
 * 
 * // false (only https allowed, but http provided)
 * isValidUrl('http://example.com', { protocols: ['https'] });
 * ```
 */
export function isValidUrl(
  url: string,
  options: {
    protocols?: string[];
    requireTld?: boolean;
    requireProtocol?: boolean;
  } = {}
): boolean {
  if (!url) return false;

  const {
    protocols = ['http', 'https'],
    requireTld = true,
    requireProtocol = true,
  } = options;

  try {
    const parsedUrl = new URL(url);
    
    // Check protocol
    if (requireProtocol) {
      const urlProtocol = parsedUrl.protocol.replace(':', '');
      if (!protocols.includes(urlProtocol)) {
        return false;
      }
    }

    // Check TLD
    if (requireTld) {
      const hostnameParts = parsedUrl.hostname.split('.');
      if (hostnameParts.length < 2) {
        return false;
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validate a phone number
 * 
 * @param phoneNumber - Phone number to validate
 * @param options - Validation options
 * @returns Whether the phone number is valid
 * 
 * @example
 * ```typescript
 * // true
 * isValidPhoneNumber('+1-555-123-4567');
 * 
 * // false
 * isValidPhoneNumber('not-a-phone');
 * ```
 */
export function isValidPhoneNumber(
  phoneNumber: string,
  options: {
    strict?: boolean;
    countryCode?: string;
    allowExtensions?: boolean;
  } = {}
): boolean {
  if (!phoneNumber) return false;

  // Remove common formatting characters
  const cleaned = phoneNumber.replace(/[\s\-\(\)\.]/g, '');

  // Loose validation (just check if it's mostly digits)
  if (!options.strict) {
    // Allow "+" at the start and some digits
    return /^\+?\d{8,15}$/.test(cleaned);
  }

  // Stricter validation based on country
  if (options.countryCode === 'US') {
    // US phone: +1 followed by 10 digits
    return /^\+?1?\d{10}$/.test(cleaned);
  }

  // International format (E.164)
  // "+" followed by 1-3 digit country code, then 8-12 digits
  const baseE164Regex = /^\+\d{1,3}\d{8,12}$/;
  
  // If extensions are allowed, also allow some additional digits after the main number
  if (options.allowExtensions) {
    return baseE164Regex.test(cleaned) || /^\+\d{1,3}\d{8,12}(x\d{1,5})?$/.test(cleaned);
  }

  return baseE164Regex.test(cleaned);
}

/**
 * Validate a date string
 * 
 * @param dateString - Date string to validate
 * @param format - Format of the date string (default: 'YYYY-MM-DD')
 * @returns Whether the date string is valid
 * 
 * @example
 * ```typescript
 * // true
 * isValidDate('2023-04-15');
 * 
 * // false
 * isValidDate('2023-13-45');
 * 
 * // true
 * isValidDate('04/15/2023', 'MM/DD/YYYY');
 * ```
 */
export function isValidDate(dateString: string, format: string = 'YYYY-MM-DD'): boolean {
  if (!dateString) return false;

  let day: number;
  let month: number;
  let year: number;

  // Parse based on format
  if (format === 'YYYY-MM-DD') {
    // ISO format
    const parts = dateString.split('-');
    if (parts.length !== 3) return false;

    year = parseInt(parts[0] || '0', 10);
    month = parseInt(parts[1] || '0', 10);
    day = parseInt(parts[2] || '0', 10);
  } else if (format === 'MM/DD/YYYY') {
    // US format
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;

    month = parseInt(parts[0] || '0', 10);
    day = parseInt(parts[1] || '0', 10);
    year = parseInt(parts[2] || '0', 10);
  } else if (format === 'DD/MM/YYYY') {
    // European format
    const parts = dateString.split('/');
    if (parts.length !== 3) return false;

    day = parseInt(parts[0] || '0', 10);
    month = parseInt(parts[1] || '0', 10);
    year = parseInt(parts[2] || '0', 10);
  } else {
    // Try to parse with Date object
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  // Check if the date is valid
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  // Check month range
  if (month < 1 || month > 12) {
    return false;
  }

  // Check day range based on month
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return false;
  }

  return true;
}

/**
 * Validate if value is a valid number
 * 
 * @param value - Value to validate
 * @param options - Validation options
 * @returns Whether the value is a valid number
 * 
 * @example
 * ```typescript
 * // true
 * isValidNumber('123.45');
 * 
 * // false
 * isValidNumber('not-a-number');
 * 
 * // true
 * isValidNumber('42', { min: 0, max: 100 });
 * 
 * // false (outside range)
 * isValidNumber('150', { min: 0, max: 100 });
 * ```
 */
export function isValidNumber(
  value: string | number,
  options: {
    min?: number;
    max?: number;
    integer?: boolean;
    allowLeadingZeros?: boolean;
  } = {}
): boolean {
  if (value === '' || value === null || value === undefined) {
    return false;
  }

  // If value is already a number
  if (typeof value === 'number') {
    // Check if it's NaN or Infinity
    if (isNaN(value) || !isFinite(value)) {
      return false;
    }

    // Check integer constraint
    if (options.integer && !Number.isInteger(value)) {
      return false;
    }

    // Check min/max
    if (options.min !== undefined && value < options.min) {
      return false;
    }
    if (options.max !== undefined && value > options.max) {
      return false;
    }

    return true;
  }

  // Check if there are leading zeros (if not allowed)
  if (!options.allowLeadingZeros && /^0\d+/.test(value.toString())) {
    return false;
  }

  // Try to parse as number
  const numberValue = parseFloat(value.toString());
  
  // Check if parsing failed
  if (isNaN(numberValue) || !isFinite(numberValue)) {
    return false;
  }

  // Check if the string was fully parsed (no trailing non-numeric chars)
  if (numberValue.toString() !== value.toString() && parseFloat(value.toString()).toString() !== value.toString()) {
    return false;
  }

  // Check integer constraint
  if (options.integer && !Number.isInteger(numberValue)) {
    return false;
  }

  // Check min/max
  if (options.min !== undefined && numberValue < options.min) {
    return false;
  }
  if (options.max !== undefined && numberValue > options.max) {
    return false;
  }

  return true;
} 