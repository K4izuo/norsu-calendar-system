/**
 * Timezone utilities for consistent date handling across server and client
 * Ensures dates are always in Philippine Time (UTC+8)
 */

/**
 * Get current date in Philippine timezone
 * Note: This returns a Date object representing the current moment,
 * NOT a Philippines-localized date. Use getPhilippineDay/Month/Year for components.
 */
export function getPhilippineDate(): Date {
  return new Date();
}

/**
 * Get current month (0-11) in Philippine timezone
 */
export function getPhilippineMonth(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    month: 'numeric'
  });
  return parseInt(formatter.format(now)) - 1; // Month is 0-indexed
}

/**
 * Get current year in Philippine timezone
 */
export function getPhilippineYear(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric'
  });
  return parseInt(formatter.format(now));
}

/**
 * Get current day of month in Philippine timezone
 */
export function getPhilippineDay(): number {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    day: 'numeric'
  });
  return parseInt(formatter.format(now));
}

/**
 * Check if a given date matches today in Philippine timezone
 */
export function isToday(year: number, month: number, day: number): boolean {
  return (
    day === getPhilippineDay() &&
    month === getPhilippineMonth() &&
    year === getPhilippineYear()
  );
}