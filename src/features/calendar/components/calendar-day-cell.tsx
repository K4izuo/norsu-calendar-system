"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";
import { CalendarDayType } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";

interface CalendarDayCellProps {
  day: CalendarDayType;
  idx: number;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onDaySelect: (day: CalendarDayType) => void;
}

export function CalendarDayCell({ day, idx, roleColors, role, onDaySelect }: CalendarDayCellProps) {
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
              className={`hidden sm:inline-flex items-center ${role === 'admin' ? 'text-gray-700' : roleColors.todayText} px-1 sm:px-1.5 py-0.5 rounded-xl text-xs sm:text-sm md:text-base font-semibold absolute top-1.75 left-0.75`}
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
              <div className={`inline-flex items-center ${role === 'admin' ? 'text-gray-700' : roleColors.todayText} px-1 py-0.5 rounded-xl text-xs xs:text-sm font-semibold w-min`}>
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
              <span className={`${role === 'admin' ? 'text-gray-700' : roleColors.todayText} text-xs sm:text-xs md:text-sm lg:text-base font-medium px-2 py-0.5 rounded pointer-events-auto translate-y-3`}>
                {day.eventCount === 1
                  ? "Event"
                  : "Events..."}
              </span>
            </motion.div>
          </>
        )}
    </motion.div>
  );
}
