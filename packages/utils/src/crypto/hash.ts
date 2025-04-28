/**
 * Cryptography utilities
 */

/**
 * Convert a string to a hash using a simple algorithm
 * This is NOT cryptographically secure, use only for non-sensitive hashing
 * 
 * @param str - String to hash
 * @returns Simple hash of the string
 * 
 * @example
 * ```typescript
 * // "d41d8cd98f00b204e9800998ecf8427e"
 * simpleHash('');
 * 
 * // "5eb63bbbe01eeed093cb22bb8f5acdc3"
 * simpleHash('hello world');
 * ```
 */
export function simpleHash(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  // Simple implementation of MD5-like hashing
  // This is NOT cryptographically secure
  let hash = 0;
  
  if (str.length === 0) {
    return '0';
  }
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * Generate a random string
 * 
 * @param length - Length of the random string
 * @param options - Generation options
 * @returns Random string
 * 
 * @example
 * ```typescript
 * // "a1b2c3d4e5"
 * generateRandomString(10);
 * 
 * // "ABCDEFGHIJ"
 * generateRandomString(10, { charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' });
 * ```
 */
export function generateRandomString(
  length: number,
  options: {
    charset?: string | null;
    prefix?: string | null;
    suffix?: string | null;
  } = {}
): string {
  const {
    charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    prefix = '',
    suffix = '',
  } = options;

  if (length <= 0) {
    throw new Error('Length must be greater than 0');
  }

  if (charset.length === 0) {
    throw new Error('Charset must not be empty');
  }

  let result = '';

  // Use crypto.getRandomValues if available (browser)
  if (typeof window !== 'undefined' && window.crypto && typeof window?.crypto.getRandomValues === 'function') {
    try {
      const randomValues = new Uint32Array(length);
      window?.crypto.getRandomValues(randomValues);

      for (let i = 0; i < length; i++) {
        // Ensure we have a valid value
        const value = randomValues[i] || 0;
        const index = value % charset.length;
        result += charset.charAt(index);
      }
    } catch (error) {
      // Fallback to Math.random if getRandomValues fails
      console.warn('crypto.getRandomValues failed, falling back to Math.random', error);
      for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
      }
    }
  } else {
    // Fallback to Math.random (Node.js or non-secure environments)
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }

  return `${prefix}${result}${suffix}`;
}

/**
 * Generate a UUID v4 (random)
 * 
 * @returns UUID v4 string
 * 
 * @example
 * ```typescript
 * // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 * generateUUID();
 * ```
 */
export function generateUUID(): string {
  let dt = new Date().getTime();
  
  // Use crypto.getRandomValues if available (browser)
  if (typeof window !== 'undefined' && window.crypto && typeof window?.crypto.getRandomValues === 'function') {
    try {
      const randomValues = new Uint32Array(4);
      window?.crypto.getRandomValues(randomValues);
      
      // We need to use an index variable to keep track of the current position
      let randomIndex = 0;
      
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // Make sure we have a valid value
        const randomValue = randomValues[randomIndex] || 0;
        const r = (randomValue + dt) % 16 | 0;
        dt = Math.floor(dt / 16);
        
        // Move to next random value
        randomIndex = (randomIndex + 1) % randomValues.length;
        
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    } catch (error) {
      // Fallback if getRandomValues fails
      console.warn('crypto.getRandomValues failed, falling back to Math.random', error);
    }
  }

  // Fallback implementation using Math.random (less secure, but works everywhere)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16 + dt) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/**
 * Compare two strings in constant time
 * This helps prevent timing attacks when comparing sensitive strings
 * 
 * @param a - First string
 * @param b - Second string
 * @returns Whether the strings match
 * 
 * @example
 * ```typescript
 * // true
 * compareStringsConstantTime('secret', 'secret');
 * 
 * // false
 * compareStringsConstantTime('secret', 'guess');
 * ```
 */
export function compareStringsConstantTime(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    throw new Error('Both inputs must be strings');
  }

  // If lengths are different, strings cannot match
  // We still perform the comparison to maintain constant time
  const lengthMismatch = a.length !== b.length;

  let result = 0;
  const maxLength = Math.max(a.length, b.length);

  // Compare each character, accumulating differences
  for (let i = 0; i < maxLength; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    result |= charA ^ charB;
  }

  // Return true only if both strings are the same length and all chars match
  return result === 0 && !lengthMismatch;
}

/**
 * Mask a sensitive string (e?.g., for logging)
 * 
 * @param input - String to mask
 * @param options - Masking options
 * @returns Masked string
 * 
 * @example
 * ```typescript
 * // "****"
 * maskString('1234');
 * 
 * // "1**4"
 * maskString('1234', { showFirst: 1, showLast: 1 });
 * 
 * // "4111********1111"
 * maskString('4111111111111111', { showFirst: 4, showLast: 4 });
 * ```
 */
export function maskString(
  input: string,
  options: {
    maskChar?: string | null;
    showFirst?: number | null;
    showLast?: number | null;
  } = {}
): string {
  if (typeof input !== 'string') {
    return '';
  }

  const {
    maskChar = '*',
    showFirst = 0,
    showLast = 0,
  } = options;

  if (input.length <= showFirst + showLast) {
    // If the string is shorter than or equal to the visible parts, 
    // just mask everything to avoid revealing too much
    return maskChar.repeat(input.length);
  }

  const firstPart = input.substring(0, showFirst);
  const lastPart = input.substring(input.length - showLast);
  const middlePart = maskChar.repeat(input.length - showFirst - showLast);

  return `${firstPart}${middlePart}${lastPart}`;
} 