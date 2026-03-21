"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarDayType, EventDetails } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";
import {
  getPhilippineDay,
  getPhilippineMonth,
  getPhilippineYear,
} from "@/features/calendar/utils/timezone-utils";
import { useCalendarNavigation } from "@/features/calendar/hooks/use-calendar-navigation";
import { CalendarHeader } from "./norsu-calendar-card/calendar-header";
import { CalendarGrid } from "./norsu-calendar-card/calendar-grid";

interface CalendarProps<T> {
  onDaySelect: (day: CalendarDayType<T>) => void;
  onEventSelect?: (event: T) => void;
  getEventsForDate: (
    year: number,
    month: number,
    day: number,
  ) => {
    hasEvent: boolean;
    count: number;
    eventsList?: T[];
  };
  initialDate?: Date;
  role?: UserRole;
  currentMonth: number;
  currentYear: number;
  onMonthYearChange: (month: number, year: number) => void;
  isDragging?: boolean;
  onPillDragStart?: (event: EventDetails) => void;
  onPillDragEnd?: () => void;
  onNativeDrop?: (dateString: string) => void;
}

function CalendarComponent<T>({
  onDaySelect,
  onEventSelect,
  getEventsForDate,
  role,
  currentMonth,
  currentYear,
  onMonthYearChange,
  isDragging,
  onPillDragStart,
  onPillDragEnd,
  onNativeDrop,
}: CalendarProps<T>) {
  const roleColors = useMemo(() => getRoleColors(role), [role]);

  const {
    direction,
    setDirection,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
  } = useCalendarNavigation(currentMonth, currentYear, onMonthYearChange);

  const calendarDays = useMemo(() => {
    const days: CalendarDayType<T>[] = [];

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const lastDateOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0,
    ).getDate();
    const lastDateOfPrevMonth = new Date(
      currentYear,
      currentMonth,
      0,
    ).getDate();

    const todayDay = getPhilippineDay();
    const todayMonth = getPhilippineMonth();
    const todayYear = getPhilippineYear();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = lastDateOfPrevMonth - i;
      days.push({
        date: prevDate,
        currentMonth: false,
        key: `prev-${prevDate}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
    }

    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday =
        i === todayDay &&
        currentMonth === todayMonth &&
        currentYear === todayYear;

      const { hasEvent, count, eventsList } = getEventsForDate(
        currentYear,
        currentMonth,
        i,
      );

      days.push({
        date: i,
        currentMonth: true,
        key: `curr-${i}-${currentMonth}-${currentYear}`,
        hasEvent,
        eventCount: count,
        dayEvents: eventsList,
        isToday,
        dateString: `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
      });
    }

    let nextMonthDay = 1;
    while (days.length < 35) {
      days.push({
        date: nextMonthDay,
        currentMonth: false,
        key: `next-${nextMonthDay}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
      nextMonthDay++;
    }

    return days;
  }, [currentMonth, currentYear, getEventsForDate]);

  const monthNames = useMemo(
    () => [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December",
    ],
    [],
  );

  const currentMonthYear = useMemo(
    () => `${monthNames[currentMonth]} ${currentYear}`,
    [currentMonth, currentYear, monthNames],
  );

  return (
    <div className="flex flex-col w-full flex-1">
      <CalendarHeader
        currentMonth={currentMonth}
        currentYear={currentYear}
        currentMonthYear={currentMonthYear}
        monthNames={monthNames}
        direction={direction}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onMonthYearChange={onMonthYearChange}
        setDirection={setDirection}
      />

      <CalendarGrid
        calendarDays={calendarDays}
        currentMonth={currentMonth}
        currentYear={currentYear}
        direction={direction}
        roleColors={roleColors}
        role={role}
        onDaySelect={onDaySelect}
        onEventSelect={onEventSelect}
        isDragging={isDragging}
        onPillDragStart={onPillDragStart}
        onPillDragEnd={onPillDragEnd}
        onNativeDrop={onNativeDrop}
      />

      <div className="sm:hidden">
        <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 flex items-center bg-white border border-gray-300 rounded-full px-2 h-10 w-max shadow-md">
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
            aria-label="Previous"
            type="button"
            onClick={goToPreviousMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <span className="mx-1.5 h-5 w-px bg-gray-300 rounded"></span>
          <motion.button
            className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
            aria-label="Next"
            type="button"
            onClick={goToNextMonth}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export const Calendar = React.memo(CalendarComponent) as typeof CalendarComponent;
