"use client";

import React, { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/shared/components/ui/select";
import { headerVariants } from "@/features/calendar/utils/calendar-animations";

interface CalendarHeaderProps {
  currentMonth: number;
  currentYear: number;
  currentMonthYear: string;
  monthNames: string[];
  direction: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onMonthYearChange: (month: number, year: number) => void;
  setDirection: (d: number) => void;
}

export function CalendarHeader({
  currentMonth,
  currentYear,
  currentMonthYear,
  monthNames,
  direction,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onMonthYearChange,
  setDirection,
}: CalendarHeaderProps) {
  // ── Native DnD: drag-to-navigate by hovering arrows during drag ───────────
  const prevTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onPrevRef = useRef(onPreviousMonth);
  const onNextRef = useRef(onNextMonth);
  onPrevRef.current = onPreviousMonth;
  onNextRef.current = onNextMonth;

  const handlePrevDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    prevTimerRef.current = setTimeout(() => onPrevRef.current(), 700);
  }, []);
  const handlePrevDragLeave = useCallback(() => {
    clearTimeout(prevTimerRef.current);
  }, []);
  const handlePrevDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleNextDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    nextTimerRef.current = setTimeout(() => onNextRef.current(), 700);
  }, []);
  const handleNextDragLeave = useCallback(() => {
    clearTimeout(nextTimerRef.current);
  }, []);
  const handleNextDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Track drag-over state for ring highlight (purely visual, no React re-render needed)
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);

  const prevEnter = useCallback((e: React.DragEvent) => {
    handlePrevDragEnter(e);
    prevRef.current?.classList.add("ring-2", "ring-amber-400");
  }, [handlePrevDragEnter]);
  const prevLeave = useCallback(() => {
    handlePrevDragLeave();
    prevRef.current?.classList.remove("ring-2", "ring-amber-400");
  }, [handlePrevDragLeave]);

  const nextEnter = useCallback((e: React.DragEvent) => {
    handleNextDragEnter(e);
    nextRef.current?.classList.add("ring-2", "ring-amber-400");
  }, [handleNextDragEnter]);
  const nextLeave = useCallback(() => {
    handleNextDragLeave();
    nextRef.current?.classList.remove("ring-2", "ring-amber-400");
  }, [handleNextDragLeave]);

  return (
    <div className="w-full grid grid-cols-3 items-center mb-5 sm:mb-7 relative">
      {/* Left: arrow, today, select */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 justify-start relative">
        {/* Arrow buttons group for desktop/tablet */}
        <div className="hidden text-card-foreground border shadow sm:flex items-center bg-white rounded-sm px-2 h-9 w-max">
          {/* Wrap prev button */}
          <div
            ref={prevRef}
            className="rounded"
            onDragEnter={prevEnter}
            onDragLeave={prevLeave}
            onDragOver={handlePrevDragOver}
          >
            <motion.button
              className="w-7 cursor-pointer h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Previous"
              type="button"
              onClick={onPreviousMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
          <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
          {/* Wrap next button */}
          <div
            ref={nextRef}
            className="rounded"
            onDragEnter={nextEnter}
            onDragLeave={nextLeave}
            onDragOver={handleNextDragOver}
          >
            <motion.button
              className="w-7 cursor-pointer h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Next"
              type="button"
              onClick={onNextMonth}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>
        </div>

        {/* Today button */}
        <motion.button
          className="h-8 cursor-pointer sm:h-9 min-h-0 px-2 sm:px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold shadow-none hover:bg-gray-100 transition-colors"
          aria-label="Today"
          type="button"
          onClick={onToday}
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
        <AnimatePresence mode="wait" initial={false} custom={direction}>
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
  );
}
