"use client";

import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Clock } from "lucide-react";
import { formatEventTimeRange } from "@/features/calendar/utils/timezone-utils";
import { CalendarDayType, EventDetails } from "@/interface/user-props";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";

// ─── Draggable pill sub-component ────────────────────────────────────────────

interface DraggableEventPillProps {
  event: EventDetails;
  roleColors: ReturnType<typeof getRoleColors>;
  role?: UserRole;
  onEventSelect?: (event: EventDetails) => void;
  getTitle: (event: EventDetails) => string;
  getTime: (event: EventDetails) => string;
  onPillDragStart?: (event: EventDetails) => void;
  onPillDragEnd?: () => void;
}

const DraggableEventPill = React.memo(function DraggableEventPill({
  event,
  roleColors,
  role,
  onEventSelect,
  getTitle,
  getTime,
  onPillDragStart,
  onPillDragEnd,
}: DraggableEventPillProps) {
  const eventId = Number(event.id);
  const status = event.registration_status.toUpperCase();
  const isDraggable = role === "admin" && status === "APPROVED" && !!eventId;

  const pillRef = useRef<HTMLDivElement>(null);
  const title = getTitle(event);
  const time = getTime(event);

  const clearDragVisualState = useCallback(() => {
    document.body.classList.remove("dragging-pill");

    const el = pillRef.current;
    if (el) {
      el.style.opacity = "1";
      el.removeAttribute("data-dragging");
    }
  }, []);

  useEffect(() => {
    const cleanup = () => clearDragVisualState();

    window.addEventListener("dragend", cleanup);
    window.addEventListener("drop", cleanup);
    window.addEventListener("mouseup", cleanup);
    window.addEventListener("blur", cleanup);

    return () => {
      window.removeEventListener("dragend", cleanup);
      window.removeEventListener("drop", cleanup);
      window.removeEventListener("mouseup", cleanup);
      window.removeEventListener("blur", cleanup);
    };
  }, [clearDragVisualState]);

  const handleMouseDown = useCallback(() => {
    if (!isDraggable) return;
    document.body.classList.add("dragging-pill");
  }, [isDraggable]);

  const handleMouseUp = useCallback(() => {
    const el = pillRef.current;
    const currentlyDragging = el?.getAttribute("data-dragging") === "1";
    if (!currentlyDragging) {
      document.body.classList.remove("dragging-pill");
    }
  }, []);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(eventId));

      document.body.classList.add("dragging-pill");
      pillRef.current?.setAttribute("data-dragging", "1");
      onPillDragStart?.(event);

      requestAnimationFrame(() => {
        const el = pillRef.current;
        if (el) el.style.opacity = "0";
      });
    },
    [event, eventId, onPillDragStart],
  );

  const handleDragEnd = useCallback(() => {
    clearDragVisualState();
    onPillDragEnd?.();
  }, [clearDragVisualState, onPillDragEnd]);

  return (
    <div
      ref={pillRef}
      draggable={isDraggable || undefined}
      onPointerDown={isDraggable ? (e) => e.stopPropagation() : undefined}
      onMouseDown={isDraggable ? handleMouseDown : undefined}
      onMouseUp={isDraggable ? handleMouseUp : undefined}
      onMouseLeave={isDraggable ? handleMouseUp : undefined}
      onDragStart={isDraggable ? handleDragStart : undefined}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      onClick={
        onEventSelect
          ? (e) => {
            e.stopPropagation();
            onEventSelect(event);
          }
          : undefined
      }
      className={`w-full flex flex-col p-1.5 ${roleColors.pillBg} border-l ${roleColors.pillBorder} rounded-r-md rounded-l-sm overflow-hidden select-none
        ${onEventSelect ? "cursor-pointer hover:brightness-95" : ""}
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
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
    </div>
  );
});

// ─── Calendar day cell ────────────────────────────────────────────────────────

interface CalendarDayCellProps<T = unknown> {
  day: CalendarDayType<T>;
  idx: number;
  roleColors: ReturnType<typeof getRoleColors> & { dragBgRaw?: string };
  role?: UserRole;
  onDaySelect: (day: CalendarDayType<T>) => void;
  onEventSelect?: (event: T) => void;
  isDragging?: boolean;
  onPillDragStart?: (event: EventDetails) => void;
  onPillDragEnd?: () => void;
  onNativeDrop?: (dateString: string) => void;
}

export const CalendarDayCell = React.memo(function CalendarDayCell<T>({
  day,
  idx,
  roleColors,
  role,
  onDaySelect,
  onEventSelect,
  isDragging = false,
  onPillDragStart,
  onPillDragEnd,
  onNativeDrop,
}: CalendarDayCellProps<T>) {
  const getEventTitle = (event: EventDetails) => {
    return event.title_name || "Event";
  };

  const getEventTime = (event: EventDetails) => {
    return formatEventTimeRange(event.time_start, event.time_end);
  };

  const isPastDate = useMemo(() => {
    if (!day.dateString) return true;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return new Date(day.dateString + "T00:00:00") < todayStart;
  }, [day.dateString]);

  const isActiveDrag = isDragging;
  const canDrop = !!day.currentMonth && !isPastDate;

  const cellRef = useRef<HTMLDivElement | null>(null);
  const dragCounterRef = useRef(0);
  const bgColor = roleColors.dragBgRaw ?? "rgba(107, 114, 128, 0.10)";

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (day.currentMonth && day.dateString) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }
    },
    [day.currentMonth, day.dateString],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current++;
      if (dragCounterRef.current === 1 && canDrop && cellRef.current) {
        cellRef.current.style.backgroundColor = bgColor;
      }
    },
    [canDrop, bgColor],
  );

  const handleDragLeave = useCallback(() => {
    dragCounterRef.current--;
    if (dragCounterRef.current === 0 && cellRef.current) {
      cellRef.current.style.backgroundColor = "";
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      document.body.classList.remove("dragging-pill");
      dragCounterRef.current = 0;

      if (cellRef.current) {
        cellRef.current.style.backgroundColor = "";
      }

      if (day.dateString && onNativeDrop) {
        onNativeDrop(day.dateString);
      }
    },
    [day.dateString, onNativeDrop],
  );

  const baseClassName = `relative border rounded-md flex flex-col p-1.5 sm:p-2 text-sm xs:text-base sm:text-lg md:text-xl font-medium ${isActiveDrag ? "" : "transition-colors"
    } ${day.currentMonth
      ? `text-gray-900 border-[1.5px] border-gray-300/70 cursor-pointer ${roleColors.hoverBg} hover:shadow-sm`
      : "text-gray-400 border-gray-100 bg-gray-50 bg-opacity-50"
    } ${day.isToday ? "border-[1.5px]" : ""}`;

  return (
    <div
      ref={cellRef}
      key={day.key}
      data-idx={idx}
      className={baseClassName}
      onClick={day.currentMonth ? () => onDaySelect(day) : undefined}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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

      {day.currentMonth &&
        day.hasEvent &&
        day.eventCount &&
        day.eventCount > 0 && (
          <div className="flex mt-1 flex-col flex-1 w-full gap-0.5 sm:gap-1 overflow-hidden">
            {day.dayEvents &&
              day.dayEvents.slice(0, 1).map((event, eventIdx) => (
                <DraggableEventPill
                  key={`pill-${idx}-${eventIdx}`}
                  event={event as unknown as EventDetails}
                  roleColors={roleColors}
                  role={role}
                  onEventSelect={
                    onEventSelect ? (e: EventDetails) => onEventSelect(e as T) : undefined
                  }
                  getTitle={getEventTitle}
                  getTime={getEventTime}
                  onPillDragStart={onPillDragStart}
                  onPillDragEnd={onPillDragEnd}
                />
              ))}

            {day.eventCount > 1 && (
              <motion.div
                className="hidden sm:inline-flex items-center text-gray-700 px-1 py-1 rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold absolute top-1.5 left-1"
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
                  className="inline-flex items-center text-gray-700 px-1 py-0.5 rounded-xl text-xs xs:text-[10px]"
                >
                  <CalendarClock size={10} className="mr-0.5 shrink-0" />
                  <span>{day.eventCount}</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
    </div>
  );
}) as <T>(props: CalendarDayCellProps<T>) => React.ReactElement;
