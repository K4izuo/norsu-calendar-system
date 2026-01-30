/**
 * Timezone utilities for consistent date handling across server and client
 * Ensures dates are always in Philippine Time (UTC+8)
 */

/**
 * Get current date in Philippine timezone
 * Works consistently on both server (Vercel/UTC) and client
 */
export function getPhilippineDate(): Date {
  // Create a date in Philippine timezone (Asia/Manila = UTC+8)
  const phpDate = new Date(new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Manila'
  }));

  return phpDate;
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