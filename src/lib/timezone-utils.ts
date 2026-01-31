/**
 * Timezone utilities for consistent date handling across server and client
 * Ensures dates are always in Philippine Time (UTC+8)
 */

/**
 * Get current date in Philippine timezone
 * Works consistently on both server (Vercel/UTC) and client
 */
export function getPhilippineDate(): Date {
  const now = new Date();
  
  // Get Philippine time components using Intl.DateTimeFormat
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(now);
  const getValue = (type: string) => parts.find(p => p.type === type)?.value || '0';
  
  // Construct date in Philippine timezone
  // This works consistently regardless of server timezone
  return new Date(
    parseInt(getValue('year')),
    parseInt(getValue('month')) - 1, // Month is 0-indexed
    parseInt(getValue('day')),
    parseInt(getValue('hour')),
    parseInt(getValue('minute')),
    parseInt(getValue('second'))
  );
}

/**
 * Get current month (0-11) in Philippine timezone
 */
export function getPhilippineMonth(): number {
  return getPhilippineDate().getMonth();
}

/**
 * Get current year in Philippine timezone
 */
export function getPhilippineYear(): number {
  return getPhilippineDate().getFullYear();
}

/**
 * Get current day of month in Philippine timezone
 */
export function getPhilippineDay(): number {
  return getPhilippineDate().getDate();
}

/**
 * Check if a given date matches today in Philippine timezone
 */
export function isToday(year: number, month: number, day: number): boolean {
  const today = getPhilippineDate();
  return (
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear()
  );
}