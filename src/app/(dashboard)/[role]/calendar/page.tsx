"use client";

import { useState, useCallback, useMemo, useRef } from "react";
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
import { useAuth } from "@/shared/components/context/auth-context";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { useTimedLoading } from "@/shared/components/hooks/use-timed-loading";
import {
  getPhilippineMonth,
  getPhilippineYear,
} from "@/features/calendar/utils/timezone-utils";
import { canMoveApprovedReservation } from "@/features/calendar/utils/move-permissions";
import { buildSpanEventsByDate } from "@/features/calendar/utils/calendar-span-utils";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { getRouteParam } from "@/core/lib/route-params";

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

const PATH_ROLE_MAP: Record<string, number> = {
  dean: 1, staff: 2, admin: 3,
  "student-director": 4, "campus-director": 5,
  vpaa: 6, vpsas: 7, vpaf: 8, vprde: 9, head: 10,
  multimedia: 11, "university-president": 12,
};

export default function CalendarPage() {
  const params = useParams();
  const role = getRouteParam(params, "role");
  const { user } = useAuth();
  const userRoleNumber = PATH_ROLE_MAP[role] ?? (user?.role ? Number(user.role) : undefined);
  const userOffice = user?.office;

  const canDragAndDrop = userRoleNumber === 5 || userRoleNumber === 12;
  const calendarRole =
    role === "dean" ? ("dean" as const) :
    role === "staff" ? ("staff" as const) :
    ("admin" as const);

  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(
    undefined,
  );
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);

  const [currentMonth, setCurrentMonth] = useState(getPhilippineMonth());
  const [currentYear, setCurrentYear] = useState(getPhilippineYear());

  const [showRecent, setShowRecent] = useState<"upcoming" | "past" | "moved">("upcoming");
  const [fromMovedEventsContext, setFromMovedEventsContext] = useState(false);
  const {
    isLoading: timedEventsListLoading,
    startLoading: startEventsListLoading,
    stopLoading: stopEventsListLoading,
  } = useTimedLoading();

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
  const { reservations, loading: reservationsLoading, isFetching, error, refetch } = useReservations();

  const assetIds = useMemo(() => {
    return [...new Set(reservations.map((r) => r.asset_id))];
  }, [reservations]);

  const { assets } = useAssets(assetIds);

  // Only wait for reservations — assets aren't needed to render the calendar grid
  // (event pills show title_name, not asset name). Assets load silently in background.
  usePageReady(reservationsLoading, isFetching);

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
          other_category: reservation.other_category,
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
          is_moved: Boolean(reservation.is_moved),
          original_date: reservation.original_date,
          move_reason: reservation.move_reason,
          equipment: reservation.equipment,
          outsource: reservation.outsource,
          guests: reservation.guests,
          involves_students: reservation.involves_students,
          requires_vpaa: reservation.requires_vpaa,
          requires_vpsas: reservation.requires_vpsas,
          requires_vpaf: reservation.requires_vpaf,
          requires_vprde: reservation.requires_vprde,
          requestor: reservation.requestor,
          requestor_type: reservation.requestor_type,
          student_sub_type: reservation.student_sub_type,
          student_org_name: reservation.student_org_name,
          csg_name: reservation.csg_name,
          requested_by: reservation.requested_by,
          requestor_tagged: reservation.requestor_tagged,
          current_stage: reservation.current_stage,
          declined_at_stage: reservation.declined_at_stage,
          campus_director_action: reservation.campus_director_action,
          approvals: reservation.approvals,
          multimedia_comment: reservation.multimedia_comment,
          proof_of_request: reservation.proof_of_request,
          proof_of_approval: reservation.proof_of_approval,
        };
      });
  }, [reservations, assets]);

  const calendarEvents = useMemo(() => {
    return allEvents.filter((event) => !event.isFinished);
  }, [allEvents]);

  const calendarEventsByDate = useMemo(() => {
    return buildSpanEventsByDate(calendarEvents);
  }, [calendarEvents]);

  const allEventsByDate = useMemo(() => {
    const map = buildSpanEventsByDate(allEvents);

    // Also index moved events under their original_date for the "Moved Events" tab
    for (const event of allEvents) {
      if (event.is_moved && event.original_date && event.original_date !== event.date) {
        const existing = map.get(event.original_date);
        if (existing) {
          existing.push(event);
        } else {
          map.set(event.original_date, [event]);
        }
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

  const handleEventClick = useCallback((event: EventDetails, fromMovedEvents?: boolean) => {
    setFromMovedEventsContext(fromMovedEvents ?? false);
    setSelectedEvent(event);
    setEventInfoModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    stopEventsListLoading();
  }, [stopEventsListLoading]);

  const handleDaySelect = useCallback((day: CalendarDayType) => {
    setShowRecent("upcoming");
    setSelectedDay(day);
    startEventsListLoading(150);
    setModalOpen(true);
  }, [startEventsListLoading]);

  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Native drag-and-drop handlers

  const canCurrentUserMoveEvent = useCallback((event: EventDetails) => {
    return canMoveApprovedReservation(event, userRoleNumber, user?.id);
  }, [user?.id, userRoleNumber]);

  const handlePillDragStart = useCallback((event: EventDetails) => {
    if (!canCurrentUserMoveEvent(event)) return;
    activeDragEventRef.current = event;
    requestAnimationFrame(() => setIsDragging(true));
  }, [canCurrentUserMoveEvent]);

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
        toast.error("Error: This date are already past");
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

      <div className="bg-white text-card-foreground border rounded-md shadow-xs flex flex-col flex-1 p-3 sm:p-6 md:p-6.5">
        <Calendar
          role={calendarRole}
          onDaySelect={handleDaySelect}
          onEventSelect={handleEventClick}
          getEventsForDate={getEventsForDate}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthYearChange={handleMonthYearChange}
          isDragging={canDragAndDrop && isDragging}
          onPillDragStart={canDragAndDrop ? handlePillDragStart : undefined}
          onPillDragEnd={canDragAndDrop ? handlePillDragEnd : undefined}
          onNativeDrop={canDragAndDrop ? handleNativeDrop : undefined}
          canMoveEvent={canDragAndDrop ? canCurrentUserMoveEvent : undefined}
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
          isLoading={timedEventsListLoading}
          showRecent={showRecent}
          setShowRecent={setShowRecent}
          eventDate={
            selectedDay && selectedDay.currentMonth
              ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`
              : ""
          }
          allReservations={reservations}
          onNewReservation={handleNewReservation}
          userRole={userRoleNumber}
          userOffice={userOffice}
        />

        <EventInfoModal
          role="admin"
          userRoleNumber={userRoleNumber}
          isOpen={eventInfoModalOpen}
          onClose={() => { setEventInfoModalOpen(false); setFromMovedEventsContext(false); }}
          event={selectedEvent}
          showBackdropBlur={false}
          fromMovedEvents={fromMovedEventsContext}
          onApprove={refetch}
          onDecline={refetch}
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
