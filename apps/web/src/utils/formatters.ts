/**
 * Utility functions for formatting values in the application
 */

/**
 * Format a date according to the specified format
 * @param date The date to format (Date object, ISO string, or timestamp)
 * @param format The format to use (default: 'medium')
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' | 'custom' = 'medium',
  locale = 'en-US',
): string => {
  if (date === null || date === undefined) return 'N/A';

  let dateObj: Date;

  if (typeof date === 'string') {
    dateObj = new Date(date);
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  if (isNaN(dateObj.getTime())) return 'N/A';

  if (format === 'custom') {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  }

  const options: Intl.DateTimeFormatOptions = { dateStyle: format };

  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency code (default: USD)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | string | null | undefined,
  currency = 'USD',
  locale = 'en-US',
): string => {
  if (value === null || value === undefined) return '';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

/**
 * Format a number with specified decimal places
 * @param value The number to format
 * @param decimalPlaces Number of decimal places (default: 2)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | string | null | undefined,
  decimalPlaces = 2,
  locale = 'en-US',
): string => {
  if (value === null || value === undefined) return '';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(numValue);
};

/**
 * Format a percentage value
 * @param value The number to format as percentage (0-1)
 * @param decimalPlaces Number of decimal places (default: 2)
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | string | null | undefined,
  decimalPlaces = 2,
  locale = 'en-US',
): string => {
  if (value === null || value === undefined) return '';

  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '';

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(numValue);
};

/**
 * Format a quantity or stock value
 * @param value The quantity to format
 * @returns Formatted quantity string
 */
export const formatQuantity = (value: number | string | null | undefined): string => {
  return formatNumber(value, 0);
};

/**
 * Format a date and time string
 * @param date Date string or Date object
 * @param locale The locale code (default: en-US)
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string | Date | undefined | null, locale = 'en-US'): string {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}
