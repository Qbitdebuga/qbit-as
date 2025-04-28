/**
 * Format a numeric value as a currency string
 * @param value Number value to format
 * @param locale Locale to use for formatting (default: 'en-US')
 * @param currency Currency code to use (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | undefined | null,
  locale = 'en-US',
  currency = 'USD',
): string => {
  if (value === undefined || value === null) {
    return '$0.00';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a date string or Date object to a human-readable format
 * @param date Date string or object to format
 * @param locale Locale to use for formatting (default: 'en-US')
 * @returns Formatted date string in short format (MMM D, YYYY)
 */
export const formatDate = (date: string | Date | undefined | null, locale = 'en-US'): string => {
  if (!date) {
    return 'N/A';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Format a date with time
 * @param date Date to format
 * @param locale Locale to use for formatting
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  date: Date | string | undefined | null,
  locale = 'en-US',
): string => {
  if (!date) {
    return 'N/A';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
};

/**
 * Format a number with comma separators and optional decimal places
 * @param value Number to format
 * @param decimals Number of decimal places to include (default: 0)
 * @param locale Locale to use for formatting (default: 'en-US')
 * @returns Formatted number string
 */
export const formatNumber = (
  value: number | undefined | null,
  decimals = 0,
  locale = 'en-US',
): string => {
  if (value === undefined || value === null) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format a percentage value
 * @param value Number value to format as percentage
 * @param decimals Number of decimal places to include (default: 2)
 * @param locale Locale to use for formatting (default: 'en-US')
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | undefined | null,
  decimals = 2,
  locale = 'en-US',
): string => {
  if (value === undefined || value === null) {
    return '0%';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Format a date in short format
 * @param date The date to format
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export function formatDateShort(date: Date | string | undefined | null, locale = 'en-US'): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Truncate a string if it exceeds a certain length
 * @param text The string to truncate
 * @param maxLength Maximum length before truncation (default: 50)
 * @returns Truncated string with ellipsis if necessary
 */
export function truncateText(text: string | undefined | null, maxLength = 50): string {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
}
