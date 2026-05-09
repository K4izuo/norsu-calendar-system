"use client";

import { useMemo, useCallback } from "react";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";
import { usePublicReservations, usePublicAssets } from "@/features/calendar/services/reservation-service";
import { getPhilippineYear, getPhilippineMonth, getPhilippineDay } from "@/features/calendar/utils/timezone-utils";

const EMPTY_EVENTS: EventDetails[] = [];

// Helper function to check if an event has finished
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

interface UsePublicCalendarDataParams {
  currentMonth: number;
  currentYear: number;
  selectedDay: CalendarDayType | null;
}

interface UsePublicCalendarDataResult {
  reservations: ReturnType<typeof usePublicReservations>["reservations"];
  loading: boolean;
  error: string | null;
  assets: ReturnType<typeof usePublicAssets>["assets"];
  allEvents: EventDetails[];
  upcomingEvents: { title: string; date: string }[];
  calendarEvents: EventDetails[];
  getEventsForDate: (year: number, month: number, day: number) => { hasEvent: boolean; count: number; eventsList?: EventDetails[] };
  selectedDayEvents: EventDetails[];
}

export default function usePublicCalendarData({
  currentMonth,
  currentYear,
  selectedDay,
}: UsePublicCalendarDataParams): UsePublicCalendarDataResult {
  // Fetch reservations using TanStack Query (PUBLIC - no auth required)
  const { reservations, loading, error } = usePublicReservations();

  // Get unique asset IDs from reservations
  const assetIds = useMemo(() => {
    return [...new Set(reservations.map(r => r.asset_id))];
  }, [reservations]);

  const { assets } = usePublicAssets(assetIds);

  // Convert reservations to events format - ONLY APPROVED
  const allEvents: EventDetails[] = useMemo(() => {
    return reservations
      .filter(reservation => reservation.status.toUpperCase() === "APPROVED")
      .map(reservation => {
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
          other_category: reservation.other_category,
          info_type: reservation.info_type,
          description: reservation.description,
          people_tag: reservation.people_tag.split(", "),
          range: reservation.range,
          registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED",
          registration_deadline: reservation.date,
          reserved_by_user: reservation.reserved_by_user,
          reserve_by_user: reservation.reserved_by_user
            ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
            : "Unknown User",
          approved_by_user_details: reservation.approved_by_user,
          declined_by_user_details: reservation.declined_by_user,
          // Calculate if event is finished
          isFinished: isEventFinished(reservation.date, reservation.time_end),
          is_moved: Boolean(reservation.is_moved),
          original_date: reservation.original_date,
          move_reason: reservation.move_reason,
          equipment: reservation.equipment,
          outsource: reservation.outsource,
          guests: reservation.guests,
          requestor: reservation.requestor,
          requestor_type: reservation.requestor_type,
          student_sub_type: reservation.student_sub_type,
          student_org_name: reservation.student_org_name,
          csg_name: reservation.csg_name,
          requestor_tagged: reservation.requestor_tagged,
        };
      });
  }, [reservations, assets]);

  // Filter ONLY upcoming/current events for calendar display
  const upcomingEvents = useMemo(() => {
    // FIX: Use Philippine timezone for filtering upcoming events
    const year = getPhilippineYear();
    const month = String(getPhilippineMonth() + 1).padStart(2, '0');
    const day = String(getPhilippineDay()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    return allEvents
      .filter(event => !event.isFinished && event.date >= todayStr)
      .sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time_start.localeCompare(b.time_start);
      })
      // .slice(0, 5)
      .map(event => ({
        title: event.title_name,
        date: event.date
      }));
  }, [allEvents]);

  // Get events for calendar - only show upcoming/current events on the calendar
  const calendarEvents = useMemo(() => {
    return allEvents.filter(event => !event.isFinished);
  }, [allEvents]);

  const calendarEventsByDate = useMemo(() => {
    const eventsByDate = new Map<string, EventDetails[]>();

    for (const event of calendarEvents) {
      const eventsForDate = eventsByDate.get(event.date);

      if (eventsForDate) {
        eventsForDate.push(event);
      } else {
        eventsByDate.set(event.date, [event]);
      }
    }

    return eventsByDate;
  }, [calendarEvents]);

  // Get events for a particular day
  const getEventsForDate = useCallback((year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dayEvents = calendarEventsByDate.get(dateStr) ?? EMPTY_EVENTS;

    return {
      hasEvent: dayEvents.length > 0,
      count: dayEvents.length,
      eventsList: dayEvents
    };
  }, [calendarEventsByDate]);

  // Selected day events - includes ALL events (past and upcoming) for modal filtering
  // Also includes moved events indexed by their original_date
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay || !selectedDay.currentMonth) return [];

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`;
    const seen = new Set<number>();
    const dayEvents: typeof allEvents = [];

    for (const event of allEvents) {
      if (event.date === dateStr || (event.is_moved && event.original_date === dateStr)) {
        if (!seen.has(event.id)) {
          seen.add(event.id);
          dayEvents.push(event);
        }
      }
    }

    return dayEvents;
  }, [allEvents, selectedDay, currentMonth, currentYear]);

  return {
    reservations,
    loading,
    error,
    assets,
    allEvents,
    upcomingEvents,
    calendarEvents,
    getEventsForDate,
    selectedDayEvents,
  };
}
