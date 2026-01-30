"use client";

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDayType } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/utils/role-colors";
import { calendarVariants, headerVariants } from "@/utils/calendar-animations";
import { getPhilippineDate } from "@/lib/timezone-utils";

// Updated props interface
export function Calendar<T>({
  onDaySelect,
  getEventsForDate,
  role,
  currentMonth,
  currentYear,
  onMonthYearChange,
}: {
  events: T[];
  onDaySelect: (day: CalendarDayType) => void;
  getEventsForDate: (year: number, month: number, day: number) => {
    hasEvent: boolean;
    count: number;
  };
  initialDate?: Date;
  role?: UserRole;
  currentMonth: number;
  currentYear: number;
  onMonthYearChange: (month: number, year: number) => void;
}) {
  // FIX: Use Philippine timezone to ensure correct "today" highlighting
  const [today, setToday] = useState<Date>(() => getPhilippineDate());

  // Update today on client side only, using Philippine timezone
  useEffect(() => {
    setToday(getPhilippineDate());
  }, []);

  // Get role-specific colors
  const roleColors = useMemo(() => getRoleColors(role), [role]);

  // Animation direction state
  const [direction, setDirection] = useState(0);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setDirection(-1);

    setTimeout(() => {
      if (currentMonth === 0) {
        onMonthYearChange(11, currentYear - 1);
      } else {
        onMonthYearChange(currentMonth - 1, currentYear);
      }
    }, 200);
  }, [currentMonth, currentYear, onMonthYearChange]);

  const goToNextMonth = useCallback(() => {
    setDirection(1);

    setTimeout(() => {
      if (currentMonth === 11) {
        onMonthYearChange(0, currentYear + 1);
      } else {
        onMonthYearChange(currentMonth + 1, currentYear);
      }
    }, 200);
  }, [currentMonth, currentYear, onMonthYearChange]);

  const goToToday = useCallback(() => {
    // FIX: Use Philippine time for "Today" button
    const currentDate = getPhilippineDate();
    const currentMonthYear = new Date(currentYear, currentMonth);
    const targetMonthYear = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    setDirection(
      targetMonthYear > currentMonthYear
        ? 1
        : targetMonthYear < currentMonthYear
          ? -1
          : 0
    );

    setTimeout(() => {
      onMonthYearChange(currentDate.getMonth(), currentDate.getFullYear());
    }, 200);
  }, [currentMonth, currentYear, onMonthYearChange]);

  // Build calendar days (6 rows x 7 columns = 42 cells)
  const calendarDays = useMemo(() => {
    const days: CalendarDayType[] = [];

    // Get info for previous, current, and next month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const lastDateOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
    const lastDateOfPrevMonth = new Date(
      currentYear,
      currentMonth,
      0
    ).getDate();

    // 1. Fill in previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = lastDateOfPrevMonth - i;
      days.push({
        date: prevDate,
        currentMonth: false,
        key: `prev-${prevDate}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
    }

    // 2. Fill in current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      // FIX: Use Philippine timezone for today comparison
      const isToday =
        i === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      // Get events for this day using the provided function
      const { hasEvent, count } = getEventsForDate(currentYear, currentMonth, i);

      days.push({
        date: i,
        currentMonth: true,
        key: `curr-${i}-${currentMonth}-${currentYear}`,
        hasEvent,
        eventCount: count,
        isToday,
      });
    }

    // 3. Fill in next month's days to reach 35 cells
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
  }, [currentMonth, currentYear, today, getEventsForDate]);

  const monthNames = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  );

  // Get current month name and year as a formatted string
  const currentMonthYear = useMemo(
    () => `${monthNames[currentMonth]} ${currentYear}`,
    [currentMonth, currentYear, monthNames]
  );

  return (
    <div className="flex flex-col w-full flex-1">
      {/* Calendar header */}
      <div className="w-full grid grid-cols-3 items-center mb-5 sm:mb-7 relative">
        {/* Left: arrow, today, select */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 justify-start relative">
          {/* Arrow buttons group for desktop/tablet */}
          <div className="hidden sm:flex items-center bg-white border border-gray-300 rounded-sm px-2 h-9 w-max">
            <motion.button
              className="w-7 cursor-pointer h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Previous"
              type="button"
              onClick={goToPreviousMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
            <motion.button
              className="w-7 cursor-pointer h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Next"
              type="button"
              onClick={goToNextMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Today button */}
          <motion.button
            className="h-8 cursor-pointer sm:h-9 min-h-0 px-2 sm:px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold shadow-none hover:bg-gray-100 transition-colors"
            aria-label="Today"
            type="button"
            onClick={goToToday}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Today
          </motion.button>

          {/* Month/Year selector - for mobile */}
          <div className="sm:hidden">
            <Select
              value={`${currentMonth}-${currentYear}`}
              onValueChange={(value) => {
                const [monthStr, yearStr] = value.split("-");
                const newMonth = parseInt(monthStr);
                const newYear = parseInt(yearStr);

                const currentMonthYear = new Date(currentYear, currentMonth);
                const targetMonthYear = new Date(newYear, newMonth);
                setDirection(
                  targetMonthYear > currentMonthYear
                    ? 1
                    : targetMonthYear < currentMonthYear
                      ? -1
                      : 0
                );

                setTimeout(() => {
                  onMonthYearChange(newMonth, newYear);
                }, 200);
              }}
            >
              <SelectTrigger className="w-22 h-9 sm:w-auto bg-white text-xs xs:text-sm border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Array.from({ length: 10 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return monthNames.map((monthName, monthIndex) => {
                    const value = `${monthIndex}-${year}`;
                    return (
                      <SelectItem key={value} value={value} className="text-sm">
                        {monthName.substring(0, 3)} {year}
                      </SelectItem>
                    );
                  });
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Center: month/year text */}
        <div className="flex justify-center items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.h2
              key={currentMonthYear}
              custom={direction}
              variants={headerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center text-base xs:text-lg sm:text-xl md:text-2xl font-medium leading-6 whitespace-nowrap"
            >
              {currentMonthYear}
            </motion.h2>
          </AnimatePresence>
        </div>
        {/* Right: month/week/day */}
        <div className="flex items-center justify-end">
          <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
            <motion.button
              className="px-2 cursor-pointer sm:px-4 rounded-sm min-w-12.5 sm:min-w-16 py-1 sm:py-1 text-sm sm:text-lg font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors"
              whileHover={{ backgroundColor: "#f3f4f6" }}
            >
              Month
            </motion.button>
          </div>
        </div>
      </div>

      {/* Calendar table */}
      <div className="flex flex-col w-full flex-1">
        {/* Calendar table header */}
        <div className="w-full px-0 pb-4">
          <div className="grid grid-cols-7 w-full">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="flex-1 text-xs xs:text-sm sm:text-base font-bold uppercase tracking-[1px] text-[#A8B2B9] text-center"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar table days with animation */}
        <div className="flex-1 flex flex-col w-full overflow-visible relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`${currentMonth}-${currentYear}`}
              custom={direction}
              variants={calendarVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              // Use only Tailwind responsive gap classes, no JS logic
              className="grid grid-rows-5 grid-cols-7 w-full gap-1 sm:gap-1.5 bg-white h-full"
            >
              {calendarDays.map((day, idx) => (
                <motion.div
                  key={day.key}
                  data-idx={idx}
                  className={`relative border rounded-md flex flex-col p-1.5 sm:p-2 text-sm xs:text-base sm:text-lg md:text-xl font-medium
                      ${day.currentMonth
                      ? `text-gray-900 border-[1.5px] ${day.hasEvent ? roleColors.eventDayBorder : "border-gray-300"} cursor-pointer ${roleColors.hoverBg} hover:shadow-sm`
                      : "text-gray-400 border-gray-100 bg-gray-50 bg-opacity-50"
                    }
                      ${day.isToday ? `border-[1.5px]` : ""}
                      ${day.hasEvent && day.currentMonth}
                    `}
                  onClick={
                    day.currentMonth
                      ? () => onDaySelect(day)
                      : undefined
                  }
                  initial={{ scale: 0.97, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    transition: {
                      delay: Math.min(0.01 * idx, 0.3),
                      duration: 0.12,
                    },
                  }}
                  whileHover={
                    day.currentMonth
                      ? {
                        scale: 1.02,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                        transition: { duration: 0.1 },
                      }
                      : {}
                  }
                  whileTap={day.currentMonth ? { scale: 0.98 } : {}}
                >
                  {/* Only show date number if it's a real day */}
                  <div className="flex justify-end items-start w-full">
                    <span
                      className={`text-sm md:text-md lg:text-lg ${day.isToday
                        ? `${roleColors.todayText} font-extrabold`
                        : day.currentMonth
                          ? ""
                          : "text-gray-400"
                        }`}
                    >
                      {day.date}
                    </span>
                  </div>

                  {/* Event indicators */}
                  {day.currentMonth &&
                    day.hasEvent &&
                    day.eventCount &&
                    day.eventCount > 0 && (
                      <>
                        {/* Desktop/Tablet: Top-left calendar icon and count */}
                        <motion.div
                          className={`hidden sm:inline-flex items-center ${roleColors.todayText} px-1 sm:px-1.5 py-0.5 rounded-xl text-xs sm:text-sm md:text-base font-semibold absolute top-1.75 left-0.75`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            transition: {
                              delay: Math.min(0.01 * idx + 0.1, 0.3),
                              duration: 0.2,
                              ease: "easeOut"
                            },
                          }}
                        >
                          <CalendarClock
                            size={14}
                            className="mr-0.5 sm:mr-1"
                          />
                          <span>{day.eventCount}</span>
                        </motion.div>

                        {/* Mobile: Centered calendar icon */}
                        <motion.div
                          className="sm:hidden grow flex items-center justify-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            transition: {
                              delay: Math.min(0.01 * idx + 0.1, 0.3),
                              duration: 0.2,
                              ease: "easeOut"
                            },
                          }}
                        >
                          <div className={`inline-flex items-center ${roleColors.todayText} px-1 py-0.5 rounded-xl text-xs xs:text-sm font-semibold w-min`}>
                            <CalendarClock size={12} className="mr-0.5" />
                            <span>{day.eventCount}</span>
                          </div>
                        </motion.div>

                        {/* Desktop: "See event" text - hidden on mobile */}
                        <motion.div
                          className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{
                            opacity: 1,
                            transition: {
                              delay: Math.min(0.01 * idx + 0.2, 0.4),
                              duration: 0.3,
                            },
                          }}
                        >
                          <span className={`${roleColors.todayText} text-xs sm:text-xs md:text-sm lg:text-base font-medium px-2 py-0.5 rounded pointer-events-auto translate-y-3`}>
                            {day.eventCount === 1
                              ? "Event"
                              : "Events..."}
                          </span>
                        </motion.div>
                      </>
                    )}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed arrow buttons group for mobile only */}
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