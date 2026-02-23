"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDayType } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";
import { calendarVariants } from "@/features/calendar/utils/calendar-animations";
import { CalendarDayCell } from "./calendar-day-cell";

interface CalendarGridProps {
  calendarDays: CalendarDayType[];
  currentMonth: number;
  currentYear: number;
  direction: number;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onDaySelect: (day: CalendarDayType) => void;
}

export function CalendarGrid({ calendarDays, currentMonth, currentYear, direction, roleColors, role, onDaySelect }: CalendarGridProps) {
  return (
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
              <CalendarDayCell
                key={day.key}
                day={day}
                idx={idx}
                roleColors={roleColors}
                role={role}
                onDaySelect={onDaySelect}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
