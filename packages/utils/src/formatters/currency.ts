/**
 * Currency formatting utilities
 */

/**
 * Format options for currency formatting
 */
export interface CurrencyFormatOptions {
  /** Currency code (default: 'USD') */
  currency?: string;
  /** Locale to use for formatting (default: 'en-US') */
  locale?: string;
  /** Number of decimal places (default: 2) */
  decimals?: number;
  /** Whether to include the currency symbol (default: true) */
  symbol?: boolean;
  /** Whether to include the currency code (default: false) */
  code?: boolean;
  /** Whether to use accounting notation (negative numbers in parentheses) (default: false) */
  accounting?: boolean;
  /** Whether to round to the nearest cent (default: true) */
  round?: boolean;
  /** Custom currency symbol to use */
  customSymbol?: string;
}

/**
 * Default options for currency formatting
 */
const DEFAULT_OPTIONS: CurrencyFormatOptions = {
  currency: 'USD',
  locale: 'en-US',
  decimals: 2,
  symbol: true,
  code: false,
  accounting: false,
  round: true,
};

/**
 * Currency symbols by currency code
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  RUB: '₽',
  KRW: '₩',
  SGD: 'S$',
  CAD: 'CA$',
  AUD: 'A$',
  MXN: 'MX$',
};

/**
 * Format a number as currency
 * 
 * @param amount - Amount to format
 * @param options - Format options
 * @returns Formatted currency string
 * 
 * @example
 * ```typescript
 * // Format as USD: "$1,234.56"
 * formatCurrency(1234.56);
 * 
 * // Format as EUR: "€1,234.56"
 * formatCurrency(1234.56, { currency: 'EUR' });
 * 
 * // Accounting notation: "(€1,234.56)"
 * formatCurrency(-1234.56, { currency: 'EUR', accounting: true });
 * 
 * // Custom symbol: "¥1,234.56"
 * formatCurrency(1234.56, { customSymbol: '¥' });
 * ```
 */
export function formatCurrency(amount: number, options: CurrencyFormatOptions = {}): string {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Round the amount if requested
  let value = amount;
  if (mergedOptions.round) {
    value = Math.round(value * Math.pow(10, mergedOptions.decimals || 0)) / Math.pow(10, mergedOptions.decimals || 0);
  }
  
  // Format with Intl.NumberFormat if available
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    try {
      const formatter = new Intl.NumberFormat(mergedOptions.locale, {
        style: mergedOptions.symbol ? 'currency' : 'decimal',
        currency: mergedOptions.currency,
        minimumFractionDigits: mergedOptions.decimals,
        maximumFractionDigits: mergedOptions.decimals,
        currencyDisplay: mergedOptions.code ? 'code' : 'symbol',
      });
      
      // Handle accounting notation
      if (mergedOptions.accounting && value < 0) {
        return `(${formatter.format(Math.abs(value))})`;
      }
      
      return formatter.format(value);
    } catch (error) {
      // Fall back to manual formatting if Intl.NumberFormat fails
      console.warn('Intl.NumberFormat failed, falling back to manual formatting', error);
    }
  }
  
  // Manual formatting as fallback
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const symbolToUse = mergedOptions.customSymbol || 
                      (mergedOptions.symbol ? CURRENCY_SYMBOLS[mergedOptions.currency || 'USD'] || '$' : '');
  const codeToUse = mergedOptions.code ? ` ${mergedOptions.currency}` : '';
  
  // Format the number with thousand separators and decimal places
  const parts = absValue.toFixed(mergedOptions.decimals).split('.');
  const integer = parts[0] || '0';
  const fraction = parts[1] || '';
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formattedValue = fraction ? `${formattedInteger}.${fraction}` : formattedInteger;
  
  // Handle accounting notation
  if (mergedOptions.accounting && value < 0) {
    return `(${symbolToUse}${formattedValue}${codeToUse})`;
  }
  
  return `${sign}${symbolToUse}${formattedValue}${codeToUse}`;
}

/**
 * Format a number as a percentage
 * 
 * @param value - Value to format (0.1 = 10%)
 * @param options - Format options
 * @returns Formatted percentage string
 * 
 * @example
 * ```typescript
 * // "10%"
 * formatPercentage(0.1);
 * 
 * // "10.50%"
 * formatPercentage(0.105, { decimals: 2 });
 * ```
 */
export function formatPercentage(
  value: number,
  options: { decimals?: number; locale?: string } = {}
): string {
  const decimals = options.decimals ?? 0;
  const locale = options.locale || 'en-US';
  
  // Format with Intl.NumberFormat if available
  if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
    try {
      const formatter = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      
      return formatter.format(value);
    } catch (error) {
      // Fall back to manual formatting if Intl.NumberFormat fails
      console.warn('Intl.NumberFormat failed, falling back to manual formatting', error);
    }
  }
  
  // Manual formatting as fallback
  const percentage = value * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Calculate compound interest
 * 
 * @param principal - Principal amount
 * @param rate - Interest rate (as a decimal, e.g., 0.05 for 5%)
 * @param time - Time period (in years)
 * @param frequency - Compounding frequency per year (default: 1)
 * @returns Future value
 * 
 * @example
 * ```typescript
 * // Principal: $1000, Rate: 5%, Time: 5 years, Annual compounding
 * // Result: $1276.28
 * calculateCompoundInterest(1000, 0.05, 5);
 * 
 * // Principal: $1000, Rate: 5%, Time: 5 years, Monthly compounding
 * // Result: $1283.36
 * calculateCompoundInterest(1000, 0.05, 5, 12);
 * ```
 */
export function calculateCompoundInterest(
  principal: number,
  rate: number,
  time: number,
  frequency = 1
): number {
  return principal * Math.pow(1 + rate / frequency, frequency * time);
}

/**
 * Calculate simple interest
 * 
 * @param principal - Principal amount
 * @param rate - Interest rate (as a decimal, e.g., 0.05 for 5%)
 * @param time - Time period (in years)
 * @returns Future value
 * 
 * @example
 * ```typescript
 * // Principal: $1000, Rate: 5%, Time: 5 years
 * // Result: $1250.00
 * calculateSimpleInterest(1000, 0.05, 5);
 * ```
 */
export function calculateSimpleInterest(principal: number, rate: number, time: number): number {
  return principal * (1 + rate * time);
} 