/**
 * Format a number as currency
 * @param value The number to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number | undefined): string {
  if (value === undefined) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a percentage
 * @param value The number to format
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number | undefined): string {
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
 * Format a date as a string
 * @param date The date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number with proper thousands separators
 * @param value The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number | undefined): string {
  if (value === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US').format(value);
} 