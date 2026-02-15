import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format time string "HH:mm:ss" to "h:mm AM/PM"
export const formatTime = (timeStr: string | undefined): string => {
  if (!timeStr) return "";
  try {
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
};
