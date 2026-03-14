"use client";

import React, { useState, useCallback, useMemo, useRef } from "react";
import { Calendar } from "@/features/calendar/components/norsu-calendar";
import { EventsListModal } from "@/features/calendar/components/events-list-modal";
import { EventInfoModal } from "@/features/calendar/components/event-info-modal";
import { MoveReservationModal } from "@/features/reservations/components/move-reservation-modal";
import { EventDetails, CalendarDayType } from "@/interface/user-props";
import {
  useReservations,
  useAssets,
} from "@/features/calendar/services/reservation-service";
import { checkReservationConflicts } from "@/features/reservations/utils/reservation-conflict-check";
import { useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/core/auth/auth";
import {
  getPhilippineMonth,
  getPhilippineYear,
} from "@/features/calendar/utils/timezone-utils";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const isEventFinished = (eventDate: string, timeEnd: string): boolean => {
  try {
    const endTime = timeEnd.trim();
    const eventEndDateTime = new Date(`${eventDate} ${endTime}`);
    const now = new Date();
    return eventEndDateTime < now;
  } catch {
    return false;
  }
};

export default function CalendarPage() {
  const params = useParams();
  const role = params.role as string;

  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(
    undefined,
  );
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);

  const [currentMonth, setCurrentMonth] = useState(getPhilippineMonth());
  const [currentYear, setCurrentYear] = useState(getPhilippineYear());

  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  // Native drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const activeDragEventRef = useRef<EventDetails | null>(null);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [moveEvent, setMoveEvent] = useState<EventDetails | undefined>(
    undefined,
  );
  const [moveTargetDate, setMoveTargetDate] = useState<string | undefined>(
    undefined,
  );

  // Data fetching
  const { reservations, error } = useReservations();

  const assetIds = useMemo(() => {
    return [...new Set(reservations.map((r) => r.asset_id))];
  }, [reservations]);

  const { assets } = useAssets(assetIds);

  const queryClient = useQueryClient();
  const userId = getUserId();

  const handleNewReservation = useCallback(async () => {
    queryClient.invalidateQueries({
      queryKey: ["reservations", userId],
      refetchType: "none",
    });
  }, [queryClient, userId]);

  const allEvents: EventDetails[] = useMemo(() => {
    return reservations
      .filter((reservation) => reservation.status.toUpperCase() === "APPROVED")
      .map((reservation) => {
        const asset = assets.get(reservation.asset_id);

        return {
          id: reservation.id,
          title_name: reservation.title_name,
          date: reservation.date,
          time_start: reservation.time_start,
          time_end: reservation.time_end,
          asset: {
            id: reservation.asset_id,
            asset_name: asset?.asset_name || `Asset #${reservation.asset_id}`,
            capacity: asset?.capacity || 0,
          },
          category: reservation.category,
          info_type: reservation.info_type,
          description: reservation.description,
          people_tag: reservation.people_tag.split(", "),
          range: reservation.range,
          registration_status: reservation.status.toUpperCase() as
            | "PENDING"
            | "APPROVED"
            | "DECLINED",
          registration_deadline: reservation.date,
          reserved_by_user: reservation.reserved_by_user,
          reserve_by_user: reservation.reserved_by_user
            ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
            : "Unknown User",
          approved_by_user_details: reservation.approved_by_user,
          declined_by_user_details: reservation.declined_by_user,
          isFinished: isEventFinished(reservation.date, reservation.time_end),
        };
      });
  }, [reservations, assets]);

  const calendarEvents = useMemo(() => {
    return allEvents.filter((event) => !event.isFinished);
  }, [allEvents]);

  const calendarEventsByDate = useMemo(() => {
    const map = new Map<string, EventDetails[]>();

    for (const event of calendarEvents) {
      const existing = map.get(event.date);
      if (existing) {
        existing.push(event);
      } else {
        map.set(event.date, [event]);
      }
    }

    return map;
  }, [calendarEvents]);

  const allEventsByDate = useMemo(() => {
    const map = new Map<string, EventDetails[]>();

    for (const event of allEvents) {
      const existing = map.get(event.date);
      if (existing) {
        existing.push(event);
      } else {
        map.set(event.date, [event]);
      }
    }

    return map;
  }, [allEvents]);

  const getEventsForDate = useCallback(
    (year: number, month: number, day: number) => {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = calendarEventsByDate.get(dateStr) ?? [];

      return {
        hasEvent: dayEvents.length > 0,
        count: dayEvents.length,
        eventsList: dayEvents,
      };
    },
    [calendarEventsByDate],
  );

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay || !selectedDay.currentMonth) return [];

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`;
    return allEventsByDate.get(dateStr) ?? [];
  }, [allEventsByDate, selectedDay, currentMonth, currentYear]);

  const handleEventClick = useCallback((event: EventDetails) => {
    setEventInfoLoading(true);
    setEventInfoModalOpen(true);
    setTimeout(() => {
      setSelectedEvent(event);
      setEventInfoLoading(false);
    }, 600);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handleDaySelect = useCallback((day: CalendarDayType) => {
    setShowRecent(false);
    setSelectedDay(day);
    setEventsListLoading(true);
    setModalOpen(true);
    setTimeout(() => {
      setEventsListLoading(false);
    }, 300);
  }, []);

  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Native drag-and-drop handlers

  const handlePillDragStart = useCallback((event: unknown) => {
    activeDragEventRef.current = event as EventDetails;
    requestAnimationFrame(() => setIsDragging(true));
  }, []);

  const handlePillDragEnd = useCallback(() => {
    activeDragEventRef.current = null;
    setIsDragging(false);
  }, []);

  const handleNativeDrop = useCallback(
    (newDate: string) => {
      const draggedEvent = activeDragEventRef.current;
      if (!draggedEvent) return;

      if (newDate === draggedEvent.date) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (new Date(newDate + "T00:00:00") < todayStart) {
        toast.error("Cannot move a reservation to a past date");
        return;
      }

      const conflicts = checkReservationConflicts({
        assetId: draggedEvent.asset.id,
        date: newDate,
        timeStart: draggedEvent.time_start,
        timeEnd: draggedEvent.time_end,
        reservations,
        excludeId: draggedEvent.id,
      });

      if (conflicts.length > 0) {
        toast.error(`Conflict with "${conflicts[0].title_name}" on that date`);
        return;
      }

      setMoveEvent(draggedEvent);
      setMoveTargetDate(newDate);
      setMoveModalOpen(true);
    },
    [reservations],
  );

  const monthNames = [
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
  ];

  return (
    <div className="h-full flex flex-col max-w-full min-h-125">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/page/${role}/dashboard` },
          { label: "Calendar" },
        ]}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white text-card-foreground border rounded-md shadow flex flex-col flex-1 p-3 sm:p-6 md:p-6.5">
        <Calendar
          role="admin"
          onDaySelect={handleDaySelect}
          onEventSelect={handleEventClick}
          getEventsForDate={getEventsForDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthYearChange={handleMonthYearChange}
          isDragging={isDragging}
          onPillDragStart={handlePillDragStart}
          onPillDragEnd={handlePillDragEnd}
          onNativeDrop={handleNativeDrop}
        />

        <EventsListModal
          role="admin"
          isOpen={modalOpen}
          onClose={handleCloseModal}
          title={
            selectedDay
              ? selectedDay.currentMonth
                ? `Events on ${monthNames[currentMonth]} ${selectedDay.date}, ${currentYear}`
                : `${selectedDay.date} ${monthNames[currentMonth]}, ${currentYear} (Outside current month)`
              : ""
          }
          events={selectedDayEvents}
          onEventClick={handleEventClick}
          isLoading={eventsListLoading}
          showRecent={showRecent}
          setShowRecent={setShowRecent}
          eventDate={
            selectedDay && selectedDay.currentMonth
              ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`
              : ""
          }
          allReservations={reservations}
          onNewReservation={handleNewReservation}
        />

        <EventInfoModal
          role="admin"
          isOpen={eventInfoModalOpen}
          onClose={() => setEventInfoModalOpen(false)}
          event={selectedEvent}
          loading={eventInfoLoading}
          showBackdropBlur={false}
        />
      </div>

      <MoveReservationModal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        event={moveEvent}
        prefillDate={moveTargetDate}
        onMoved={() => setMoveModalOpen(false)}
      />
    </div>
  );
}
