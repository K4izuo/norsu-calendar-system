/**
 * Timezone utilities for consistent date handling across server and client
 * Ensures dates are always in Philippine Time (UTC+8)
 */

/**
 * Get current date/time in Philippine timezone as separate components
 * This is what you should use for date comparisons in components
 */
export function getPhilippineDateTime(): { year: number, month: number, day: number, date: Date } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });

  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1; // 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');

  return { year, month, day, date: now };
}

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

/**
 * Format time range from "HH:mm:ss" to "h:mm A - h:mm A"
 */
export function formatEventTimeRange(timeStart?: string, timeEnd?: string): string {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return "";
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const formattedStart = formatTime(timeStart);
  const formattedEnd = formatTime(timeEnd);

  if (formattedStart && formattedEnd) {
    return `${formattedStart} - ${formattedEnd}`;
  }
  return formattedStart || formattedEnd || "";
}