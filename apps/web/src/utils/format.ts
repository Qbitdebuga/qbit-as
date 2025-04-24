/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code, defaults to USD
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value The number to format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return '0.00%';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Format a date in short format
 * @param date The date to format
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined | null,
  locale = 'en-US',
): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Format a date with time
 * @param date The date to format
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date | string | undefined | null,
  locale = 'en-US',
): string {
  if (!date) {
    return '';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

/**
 * Format a number with commas
 * @param value The number to format
 * @param locale The locale to use for formatting (default: en-US)
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | undefined | null,
  locale = 'en-US',
): string {
  if (value === undefined || value === null) {
    return '0';
  }

  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Truncate a string if it exceeds a certain length
 * @param text The string to truncate
 * @param maxLength Maximum length before truncation (default: 50)
 * @returns Truncated string with ellipsis if necessary
 */
export function truncateText(
  text: string | undefined | null,
  maxLength = 50,
): string {
  if (!text) {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3)}...`;
} 