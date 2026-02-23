import { useState, useCallback } from "react";
import { getPhilippineMonth, getPhilippineYear } from "@/features/calendar/utils/timezone-utils";

export function useCalendarNavigation(
  currentMonth: number,
  currentYear: number,
  onMonthYearChange: (month: number, year: number) => void
): {
  direction: number;
  setDirection: React.Dispatch<React.SetStateAction<number>>;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
} {
  // Animation direction state
  const [direction, setDirection] = useState(0);

  // ⚡ PERFORMANCE: Debounce state for rapid navigation prevention
  const [isNavigating, setIsNavigating] = useState(false);

  // ⚡ PERFORMANCE: Debounced navigation functions to prevent rapid clicking issues
  const goToPreviousMonth = useCallback(() => {
    if (isNavigating) return; // Prevent rapid clicks

    setIsNavigating(true);
    setDirection(-1);

    setTimeout(() => {
      if (currentMonth === 0) {
        onMonthYearChange(11, currentYear - 1);
      } else {
        onMonthYearChange(currentMonth - 1, currentYear);
      }
      setIsNavigating(false);
    }, 100);
  }, [currentMonth, currentYear, onMonthYearChange, isNavigating]);

  const goToNextMonth = useCallback(() => {
    if (isNavigating) return; // Prevent rapid clicks

    setIsNavigating(true);
    setDirection(1);

    setTimeout(() => {
      if (currentMonth === 11) {
        onMonthYearChange(0, currentYear + 1);
      } else {
        onMonthYearChange(currentMonth + 1, currentYear);
      }
      setIsNavigating(false);
    }, 100);
  }, [currentMonth, currentYear, onMonthYearChange, isNavigating]);

  const goToToday = useCallback(() => {
    // FIX: Use Philippine time for "Today" button
    const todayMonth = getPhilippineMonth();
    const todayYear = getPhilippineYear();

    const currentMonthYear = new Date(currentYear, currentMonth);
    const targetMonthYear = new Date(todayYear, todayMonth);

    setDirection(
      targetMonthYear > currentMonthYear
        ? 1
        : targetMonthYear < currentMonthYear
          ? -1
          : 0
    );

    setTimeout(() => {
      onMonthYearChange(todayMonth, todayYear);
    }, 100);
  }, [currentMonth, currentYear, onMonthYearChange]);

  return { direction, setDirection, goToPreviousMonth, goToNextMonth, goToToday };
}
