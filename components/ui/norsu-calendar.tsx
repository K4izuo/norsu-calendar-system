"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import { calendarVariants, headerVariants } from "@/utils/calendar-animations"

// Updated props interface
export function Calendar<T>({
  onDaySelect,
  getEventsForDate,
  initialDate = new Date(),
  isLoading = false,
  setLoading,
  role, // Remove default value
  // Required props (not optional)
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
  isLoading?: boolean;
  setLoading?: (loading: boolean) => void;
  role?: UserRole; // Keep as optional but no default
  currentMonth: number;
  currentYear: number;
  onMonthYearChange: (month: number, year: number) => void;
}) {
  const today = useMemo(() => initialDate || new Date(), [initialDate]);

  // Get role-specific colors
  const roleColors = useMemo(() => getRoleColors(role), [role]);

  // Animation direction state
  const [direction, setDirection] = useState(0);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setDirection(-1);
    if (setLoading) setLoading(true);
    setTimeout(() => {
      if (currentMonth === 0) {
        onMonthYearChange(11, currentYear - 1);
      } else {
        onMonthYearChange(currentMonth - 1, currentYear);
      }
      if (setLoading) setLoading(false);
    }, 700);
  }, [currentMonth, currentYear, setLoading, onMonthYearChange]);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    if (setLoading) setLoading(true);
    setTimeout(() => {
      if (currentMonth === 11) {
        onMonthYearChange(0, currentYear + 1);
      } else {
        onMonthYearChange(currentMonth + 1, currentYear);
      }
      if (setLoading) setLoading(false);
    }, 700);
  }, [currentMonth, currentYear, setLoading, onMonthYearChange]);

  const goToToday = useCallback(() => {
    const currentDate = new Date();
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
    if (setLoading) setLoading(true);
    setTimeout(() => {
      onMonthYearChange(today.getMonth(), today.getFullYear());
      if (setLoading) setLoading(false);
    }, 700);
  }, [currentMonth, currentYear, today, setLoading, onMonthYearChange]);

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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Today
          </motion.button>
          {/* Select component - hide on very small screens */}
          <div className="hidden xs:block">
            <Select>
              <SelectTrigger className="h-8 sm:h-9 min-h-0 px-2 sm:px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold shadow-none hover:bg-gray-100 transition-colors w-[80px] sm:w-[104px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <div className="px-2 py-1 border-b border-gray-200 bg-white sticky top-0 z-10">
                  <input
                    className="w-full px-2 py-1 rounded border border-gray-300 text-base outline-none"
                    placeholder="Type here..."
                  />
                </div>
                <SelectItem value="option1" className="text-base">
                  Option 1
                </SelectItem>
                <SelectItem value="option2" className="text-base">
                  Option 2
                </SelectItem>
                <SelectItem value="option3" className="text-base">
                  Option 3
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Center: calendar title */}
        <div className="flex flex-col items-center overflow-hidden">
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
              className="px-2 cursor-pointer sm:px-4 rounded-sm min-w-[50px] sm:min-w-[64px] py-1 sm:py-1 text-sm sm:text-lg font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors"
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
          {isLoading ? (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-16 w-16 flex items-center justify-center">
                <motion.div
                  className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 ${roleColors.spinner}`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                />
                <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleColors.icon}`} />
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentMonth}-${currentYear}`}
                custom={direction}
                variants={calendarVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                // Use only Tailwind responsive gap classes, no JS logic
                className="grid grid-rows-5 grid-cols-7 w-full gap-1 sm:gap-1.5 md:gap-1.5 lg:gap-2 bg-white h-full"
              >
                {calendarDays.map((day, idx) => (
                  <motion.div
                    key={day.key}
                    data-idx={idx}
                    className={`relative border rounded-md flex flex-col p-1 xs:p-1.5 sm:p-2 md:p-3 text-sm xs:text-base sm:text-lg md:text-xl font-medium
                      ${
                        day.currentMonth
                          ? `text-gray-900 border-2 ${day.hasEvent ? roleColors.eventDayBorder : "border-gray-200"} cursor-pointer ${roleColors.hoverBg} ${roleColors.activeBg} hover:shadow-sm`
                          : "text-gray-400 border-gray-100 bg-gray-50"
                      }
                      ${day.isToday ? `border-2` : ""}
                      ${day.hasEvent && day.currentMonth ? roleColors.eventDayBg : ""}
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
                    <div className="flex justify-end items-start w-full mb-2">
                      <span
                        className={`text-sm md:text-md lg:text-xl ${
                          day.isToday
                            ? `${roleColors.todayText} font-bold`
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
                            className={`hidden sm:inline-flex items-center ${roleColors.badgeColor} ${roleColors.todayText} px-1 sm:px-1.5 py-0.5 rounded-xl text-xs sm:text-sm md:text-base font-semibold absolute top-1 sm:top-2 left-1 sm:left-2`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              transition: {
                                delay: Math.min(0.01 * idx + 0.1, 0.4),
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
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
                            className="sm:hidden flex-grow flex items-center justify-center"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              transition: {
                                delay: Math.min(0.01 * idx + 0.1, 0.4),
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                              },
                            }}
                          >
                            <div className={`inline-flex items-center ${roleColors.badgeColor} ${roleColors.todayText} px-1 py-0.5 rounded-xl text-xs xs:text-sm font-semibold w-min`}>
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
                                delay: Math.min(0.01 * idx + 0.2, 0.5),
                                duration: 0.3,
                              },
                            }}
                          >
                            <span className={`${roleColors.todayText} text-xs sm:text-xs md:text-base lg:text-lg font-medium px-2 py-0.5 rounded pointer-events-auto translate-y-3`}>
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
          )}
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