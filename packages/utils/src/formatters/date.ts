/**
 * Date formatting utilities
 */

/**
 * Format options for date formatting
 */
export interface DateFormatOptions {
  /** Format to use (default: 'YYYY-MM-DD') */
  format?: string | null;
  /** Locale to use for formatting (default: 'en-US') */
  locale?: string | null;
  /** Whether to include time (default: false) */
  includeTime?: boolean | null;
  /** Time format (default: 'HH:mm:ss') */
  timeFormat?: string | null;
  /** Timezone to use (default: local timezone) */
  timezone?: string | null;
}

/**
 * Default options for date formatting
 */
const DEFAULT_OPTIONS: DateFormatOptions = {
  format: 'YYYY-MM-DD',
  locale: 'en-US',
  includeTime: false,
  timeFormat: 'HH:mm:ss',
};

/**
 * Format a date string
 * 
 * @param date - Date to format (string, Date, or number)
 * @param options - Format options
 * @returns Formatted date string
 * 
 * @example
 * ```typescript
 * // Format a date: "2023-04-15"
 * formatDate(new Date(2023, 3, 15));
 * 
 * // Format with time: "2023-04-15 14:30:00"
 * formatDate(new Date(2023, 3, 15, 14, 30), { includeTime: true });
 * 
 * // Custom format: "04/15/2023"
 * formatDate(new Date(2023, 3, 15), { format: 'MM/DD/YYYY' });
 * ```
 */
export function formatDate(date: Date | string | number, options: DateFormatOptions = {}): string {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }

  let formatted = mergedOptions.format || 'YYYY-MM-DD';
  
  // Replace year
  formatted = formatted.replace('YYYY', dateObj.getFullYear().toString());
  formatted = formatted.replace('YY', dateObj.getFullYear().toString().slice(2));
  
  // Replace month
  const month = dateObj.getMonth() + 1;
  formatted = formatted.replace('MM', month.toString().padStart(2, '0'));
  formatted = formatted.replace('M', month.toString());
  
  // Replace day
  const day = dateObj.getDate();
  formatted = formatted.replace('DD', day.toString().padStart(2, '0'));
  formatted = formatted.replace('D', day.toString());
  
  // Add time if requested
  if (mergedOptions.includeTime) {
    const timeStr = formatTime(dateObj, { format: mergedOptions.timeFormat });
    formatted = `${formatted} ${timeStr}`;
  }
  
  return formatted;
}

/**
 * Format a time string
 * 
 * @param date - Date to format (string, Date, or number)
 * @param options - Format options
 * @returns Formatted time string
 */
export function formatTime(date: Date | string | number, options: { format?: string } = {}): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const format = options.format || 'HH:mm:ss';
  
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  let formatted = format;
  
  // Replace hours
  const hours = dateObj.getHours();
  formatted = formatted.replace('HH', hours.toString().padStart(2, '0'));
  formatted = formatted.replace('H', hours.toString());
  
  // Replace minutes
  const minutes = dateObj.getMinutes();
  formatted = formatted.replace('mm', minutes.toString().padStart(2, '0'));
  formatted = formatted.replace('m', minutes.toString());
  
  // Replace seconds
  const seconds = dateObj.getSeconds();
  formatted = formatted.replace('ss', seconds.toString().padStart(2, '0'));
  formatted = formatted.replace('s', seconds.toString());
  
  return formatted;
}

/**
 * Format a relative time string (e?.g., "2 days ago")
 * 
 * @param date - Date to format (string, Date, or number)
 * @param relativeTo - Date to compare against (default: now)
 * @returns Relative time string
 * 
 * @example
 * ```typescript
 * // "2 days ago"
 * formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
 * 
 * // "in 3 hours"
 * formatRelativeTime(new Date(Date.now() + 3 * 60 * 60 * 1000));
 * ```
 */
export function formatRelativeTime(
  date: Date | string | number,
  relativeTo: Date | string | number = new Date()
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const relativeToObj = relativeTo instanceof Date ? relativeTo : new Date(relativeTo);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  if (isNaN(relativeToObj.getTime())) {
    throw new Error(`Invalid relativeTo date: ${relativeTo}`);
  }
  
  const diffMs = dateObj.getTime() - relativeToObj.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffMonths / 12);
  
  const absDiffSeconds = Math.abs(diffSeconds);
  const absDiffMinutes = Math.abs(diffMinutes);
  const absDiffHours = Math.abs(diffHours);
  const absDiffDays = Math.abs(diffDays);
  const absDiffMonths = Math.abs(diffMonths);
  const absDiffYears = Math.abs(diffYears);
  
  const isInPast = diffMs < 0;
  const prefix = isInPast ? '' : 'in ';
  const suffix = isInPast ? ' ago' : '';
  
  if (absDiffSeconds < 60) {
    return absDiffSeconds === 0 
      ? 'just now' 
      : `${prefix}${absDiffSeconds} second${absDiffSeconds === 1 ? '' : 's'}${suffix}`;
  }
  
  if (absDiffMinutes < 60) {
    return `${prefix}${absDiffMinutes} minute${absDiffMinutes === 1 ? '' : 's'}${suffix}`;
  }
  
  if (absDiffHours < 24) {
    return `${prefix}${absDiffHours} hour${absDiffHours === 1 ? '' : 's'}${suffix}`;
  }
  
  if (absDiffDays < 30) {
    return `${prefix}${absDiffDays} day${absDiffDays === 1 ? '' : 's'}${suffix}`;
  }
  
  if (absDiffMonths < 12) {
    return `${prefix}${absDiffMonths} month${absDiffMonths === 1 ? '' : 's'}${suffix}`;
  }
  
  return `${prefix}${absDiffYears} year${absDiffYears === 1 ? '' : 's'}${suffix}`;
}

/**
 * Format a date as a fiscal year
 * 
 * @param date - Date to format
 * @param fiscalYearStart - Month when the fiscal year starts (0-11, default: 0 for January)
 * @returns Fiscal year string
 * 
 * @example
 * ```typescript
 * // "FY 2023" (for January 1, 2023 with fiscal year starting in January)
 * formatFiscalYear(new Date(2023, 0, 1));
 * 
 * // "FY 2024" (for January 1, 2023 with fiscal year starting in July)
 * formatFiscalYear(new Date(2023, 0, 1), 6);
 * ```
 */
export function formatFiscalYear(date: Date | string | number, fiscalYearStart = 0): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date: ${date}`);
  }
  
  if (fiscalYearStart < 0 || fiscalYearStart > 11) {
    throw new Error('Fiscal year start month must be between 0 and 11');
  }
  
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  
  // If the current month is before the fiscal year start, use the previous year
  const fiscalYear = month < fiscalYearStart ? year : year + 1;
  
  return `FY ${fiscalYear}`;
} 