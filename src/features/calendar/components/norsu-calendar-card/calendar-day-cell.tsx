"use client";

import React, { useMemo, useRef, useCallback, useEffect } from "react";
import { CalendarClock, Clock } from "lucide-react";
import { formatEventTimeRange } from "@/features/calendar/utils/timezone-utils";
import { CalendarDayType, EventDetails } from "@/interface/user-props";
import { getRoleColors } from "@/shared/components/utils/role-colors";

// ─── Draggable pill sub-component ────────────────────────────────────────────

interface DraggableEventPillProps {
  event: EventDetails;
  roleColors: ReturnType<typeof getRoleColors>;
  onEventSelect?: (event: EventDetails) => void;
  getTitle: (event: EventDetails) => string;
  getTime: (event: EventDetails) => string;
  onPillDragStart?: (event: EventDetails) => void;
  onPillDragEnd?: () => void;
  canMoveEvent?: (event: EventDetails) => boolean;
}

const DraggableEventPill = React.memo(function DraggableEventPill({
  event,
  roleColors,
  onEventSelect,
  getTitle,
  getTime,
  onPillDragStart,
  onPillDragEnd,
  canMoveEvent,
}: DraggableEventPillProps) {
  const eventId = Number(event.id);
  const status = event.registration_status.toUpperCase();
  const isDraggable =
    !!onPillDragStart &&
    status === "APPROVED" &&
    !!eventId &&
    !!canMoveEvent?.(event);

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

      // Measure the actual rendered cell width and grid gap so the ghost
      // spans the exact same width as the combined multi-day pill on screen.
      const cellEl = pillRef.current?.closest("[data-idx]") as HTMLElement | null;
      const range = Math.max(1, event.range || 1);
      let ghostWidth = pillRef.current?.offsetWidth ?? 120;

      if (cellEl) {
        const cellWidth = cellEl.getBoundingClientRect().width;
        const parentGrid = cellEl.parentElement;
        const gap = parentGrid
          ? parseFloat(window.getComputedStyle(parentGrid).columnGap) || 4
          : 4;
        ghostWidth = Math.round(cellWidth * range + gap * (range - 1));
      }

      // Position cursor inside the ghost relative to which span-day was grabbed.
      const xOffset =
        event.spanPosition === "end"
          ? Math.max(ghostWidth - 18, Math.round(ghostWidth / 2))
          : event.spanPosition === "middle"
          ? Math.round(ghostWidth / 2)
          : 18;

      // Canvas ghost — drawing is synchronous so pixels are immediately in the
      // backing store. setDragImage on a canvas element reads that buffer directly,
      // bypassing the async CSS paint cycle that makes DOM-clone ghosts transparent.
      const pillEl = pillRef.current!;
      const pillHeight = pillEl.offsetHeight || 32;
      const dpr = window.devicePixelRatio || 1;

      const rawBg = window.getComputedStyle(pillEl).backgroundColor;
      const bgColor =
        rawBg && rawBg !== "rgba(0, 0, 0, 0)" && rawBg !== "transparent"
          ? rawBg
          : "rgb(244, 244, 244)"; // ≈ Tailwind v4 gray-100

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(ghostWidth * dpr);
      canvas.height = Math.round(pillHeight * dpr);
      canvas.style.cssText = "position:fixed;left:-9999px;top:-9999px;pointer-events:none;";

      const ctx = canvas.getContext("2d")!;
      ctx.scale(dpr, dpr);

      // Pill background — rounded-l-sm (2px) + rounded-r-md (6px)
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(0, 0, ghostWidth, pillHeight, [2, 6, 6, 2]);
      ctx.fill();

      // Left accent border (gray-500)
      ctx.fillStyle = "rgb(107, 114, 128)";
      ctx.fillRect(0, 0, 1, pillHeight);

      // Title
      const titleText = event.title_name || "Event";
      ctx.fillStyle = "rgb(31, 41, 55)";
      ctx.font = `600 10px ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif`;
      ctx.textBaseline = "top";
      ctx.fillText(titleText, 8, 4, ghostWidth - 12);

      // Time
      const timeText = formatEventTimeRange(event.time_start, event.time_end);
      if (timeText) {
        ctx.fillStyle = "rgb(107, 114, 128)";
        ctx.font = `500 9px ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,sans-serif`;
        ctx.fillText(timeText, 8, 16, ghostWidth - 12);
      }

      document.body.appendChild(canvas);
      e.dataTransfer.setDragImage(canvas, xOffset, Math.floor(pillHeight / 2));
      requestAnimationFrame(() => { canvas.parentNode?.removeChild(canvas); });

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

  const isContinuation = event.spanPosition === "middle" || event.spanPosition === "end";

  const spanRadiusClass =
    event.spanPosition === "start" ? "rounded-l-sm rounded-r-none" :
    event.spanPosition === "middle" ? "rounded-none" :
    event.spanPosition === "end" ? "rounded-l-none rounded-r-md" :
    "rounded-r-md rounded-l-sm";

  const pillBgClass = roleColors.pillBg;
  const pillBorderClass = isContinuation ? "" : `border-l ${roleColors.pillBorder}`;

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
      className={`w-full flex flex-col p-1.5 ${pillBgClass} ${pillBorderClass} ${spanRadiusClass} overflow-hidden select-none
        ${onEventSelect ? "cursor-pointer hover:brightness-95" : ""}
        ${isDraggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      {isContinuation ? (
        <>
          <span className="text-[10px] sm:text-xs leading-tight invisible select-none" aria-hidden="true">{title}</span>
          {time && <span className="mt-px text-[9px] sm:text-[10px] leading-tight invisible select-none" aria-hidden="true">{time}</span>}
        </>
      ) : (
        <>
          <span className="text-[10px] sm:text-xs font-semibold text-gray-800 truncate leading-tight">
            {title}
          </span>
          {time && (
            <span className="flex items-center mt-px text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight">
              <Clock className="w-[9px] text-gray-500 h-[9px] sm:w-[10px] sm:h-[10px] mr-1 shrink-0" />
              {time}
            </span>
          )}
        </>
      )}
    </div>
  );
});

// ─── Calendar day cell ────────────────────────────────────────────────────────

interface CalendarDayCellProps<T = unknown> {
  day: CalendarDayType<T>;
  idx: number;
  roleColors: ReturnType<typeof getRoleColors> & { dragBgRaw?: string };
  onDaySelect: (day: CalendarDayType<T>) => void;
  onEventSelect?: (event: T) => void;
  isDragging?: boolean;
  onPillDragStart?: (event: EventDetails) => void;
  onPillDragEnd?: () => void;
  onNativeDrop?: (dateString: string) => void;
  canMoveEvent?: (event: EventDetails) => boolean;
}

export const CalendarDayCell = React.memo(function CalendarDayCell<T>({
  day,
  idx,
  roleColors,
  onDaySelect,
  onEventSelect,
  isDragging = false,
  onPillDragStart,
  onPillDragEnd,
  onNativeDrop,
  canMoveEvent,
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
                  onEventSelect={
                    onEventSelect ? (e: EventDetails) => onEventSelect(e as T) : undefined
                  }
                  getTitle={getEventTitle}
                  getTime={getEventTime}
                  onPillDragStart={onPillDragStart}
                  onPillDragEnd={onPillDragEnd}
                  canMoveEvent={canMoveEvent}
                />
              ))}

            {day.eventCount > 1 && (
              <div className="hidden sm:inline-flex items-center text-gray-700 px-1 py-1 rounded-xl text-[10px] sm:text-xs md:text-sm font-semibold absolute top-1.5 left-1">
                <CalendarClock size={12} className="mr-0.5 sm:mr-1 shrink-0" />
                <span>{day.eventCount}</span>
              </div>
            )}

            {day.eventCount > 1 && (
              <div className="sm:hidden absolute top-1 left-1">
                <div className="inline-flex items-center text-gray-700 px-1 py-0.5 rounded-xl text-xs xs:text-[10px]">
                  <CalendarClock size={10} className="mr-0.5 shrink-0" />
                  <span>{day.eventCount}</span>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
}) as <T>(props: CalendarDayCellProps<T>) => React.ReactElement;
