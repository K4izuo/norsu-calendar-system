"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarClock, Clock } from "lucide-react";
import { formatEventTimeRange } from "@/features/calendar/utils/timezone-utils";
import { CalendarDayType } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";

interface CalendarDayCellProps<T = unknown> {
  day: CalendarDayType<T>;
  idx: number;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onDaySelect: (day: CalendarDayType<T>) => void;
  onEventSelect?: (event: T) => void;
}

export function CalendarDayCell<T>({
  day,
  idx,
  roleColors,
  role,
  onDaySelect,
  onEventSelect,
}: CalendarDayCellProps<T>) {
  const getEventTitle = (event: unknown) => {
    if (typeof event === "object" && event !== null) {
      if ("title_name" in event) return String(event.title_name);
      if ("title" in event) return String(event.title);
    }
    return "Event";
  };
  const getEventTime = (event: unknown) => {
    if (typeof event === "object" && event !== null) {
      const timeStart =
        "time_start" in event ? String(event.time_start) : undefined;
      const timeEnd = "time_end" in event ? String(event.time_end) : undefined;

      if (timeStart || timeEnd) {
        return formatEventTimeRange(timeStart, timeEnd);
      }

      if ("time" in event) return String(event.time);
    }
    return "";
  };
  return (
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
      onClick={day.currentMonth ? () => onDaySelect(day) : undefined}
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
          className={`text-sm md:text-base ${day.isToday
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
          <div className="flex mt-1 flex-col flex-1 w-full gap-0.5 sm:gap-1 overflow-hidden">
            {/* Pill Bills rendering */}
            {day.dayEvents &&
              day.dayEvents.slice(0, 1).map((event, eventIdx) => {
                const title = getEventTitle(event);
                const time = getEventTime(event);

                return (
                  <motion.div
                    key={`event-${idx}-${eventIdx}`}
                    onClick={
                      onEventSelect
                        ? (e) => {
                          e.stopPropagation();
                          onEventSelect(event as T);
                        }
                        : undefined
                    }
                    className={`w-full flex flex-col px-1.5 py-1.5 ${roleColors.pillBg} border-l ${roleColors.pillBorder} rounded-r-md rounded-l-sm overflow-hidden ${onEventSelect ? "cursor-pointer hover:brightness-95" : ""}`}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: Math.min(0.01 * idx + 0.1 * eventIdx + 0.1, 0.4),
                        duration: 0.2,
                      },
                    }}
                  >
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-800 truncate leading-tight">
                      {title}
                    </span>
                    {time && (
                      <span className="flex items-center mt-px text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight">
                        <Clock className="w-[9px] text-gray-500 h-[9px] sm:w-[10px] sm:h-[10px] mr-1 shrink-0" />
                        {time}
                      </span>
                    )}
                  </motion.div>
                );
              })}

            {/* Desktop/Tablet: Top-left calendar icon and count */}
            {day.eventCount > 1 && (
              <motion.div
                className={`hidden sm:inline-flex items-center ${role === "admin" ? "text-gray-700" : roleColors.todayText} px-1 py-1 rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold absolute top-1.5 left-1`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    delay: Math.min(0.01 * idx + 0.3, 0.4),
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}
              >
                <CalendarClock size={12} className="mr-0.5 sm:mr-1 shrink-0" />
                <span>{day.eventCount}</span>
              </motion.div>
            )}

            {/* Mobile: Top-left calendar icon */}
            {day.eventCount > 1 && (
              <motion.div
                className="sm:hidden absolute top-1 left-1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    delay: Math.min(0.01 * idx + 0.3, 0.4),
                    duration: 0.2,
                    ease: "easeOut",
                  },
                }}
              >
                <div
                  className={`inline-flex items-center ${role === "admin" ? "text-gray-700" : roleColors.todayText} px-1 py-0.5 rounded-xl text-xs xs:text-[10px]`}
                >
                  <CalendarClock size={10} className="mr-0.5 shrink-0" />
                  <span>{day.eventCount}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
    </motion.div>
  );
}
