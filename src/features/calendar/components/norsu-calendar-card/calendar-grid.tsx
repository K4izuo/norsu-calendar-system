"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CalendarDayType, EventDetails } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";
import { calendarVariants } from "@/features/calendar/utils/calendar-animations";
import { CalendarDayCell } from "./calendar-day-cell";

interface CalendarGridProps<T = unknown> {
  calendarDays: CalendarDayType<T>[];
  currentMonth: number;
  currentYear: number;
  direction: number;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onDaySelect: (day: CalendarDayType<T>) => void;
  onEventSelect?: (event: T) => void;
  /** True while a drag is in progress — prevents hover scale animations on all cells */
  isDragging?: boolean;
  onPillDragStart?: (event: EventDetails) => void;
  onPillDragEnd?: () => void;
  onNativeDrop?: (dateString: string) => void;
  currentUserId?: number;
}

export function CalendarGrid<T>({
  calendarDays,
  currentMonth,
  currentYear,
  direction,
  roleColors,
  onDaySelect,
  onEventSelect,
  isDragging,
  onPillDragStart,
  onPillDragEnd,
  onNativeDrop,
  currentUserId,
}: CalendarGridProps<T>) {
  return (
    <div className="flex flex-col w-full flex-1">
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

      <div className="flex-1 flex flex-col w-full relative" style={{ overflow: "clip", overflowClipMargin: "30px" }}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`${currentMonth}-${currentYear}`}
            custom={direction}
            variants={calendarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="grid grid-rows-5 grid-cols-7 w-full gap-1 sm:gap-1.5 bg-white h-full"
          >
            {calendarDays.map((day, idx) => (
              <CalendarDayCell
                key={day.key}
                day={day}
                idx={idx}
                roleColors={roleColors}
                onDaySelect={onDaySelect}
                onEventSelect={onEventSelect}
                isDragging={isDragging}
                onPillDragStart={onPillDragStart}
                onPillDragEnd={onPillDragEnd}
                onNativeDrop={onNativeDrop}
                currentUserId={currentUserId}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
