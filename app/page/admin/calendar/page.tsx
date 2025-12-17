"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Calendar } from "@/components/ui/norsu-calendar";
import { EventsListModal } from "@/components/modal/events-list-modal";
import { EventInfoModal } from "@/components/modal/event-info-modal";
import { EventDetails, CalendarDayType, Reservation, ReservationWithRelations } from "@/interface/user-props";
import { apiClient } from "@/lib/api-client";

interface Asset {
  id: number;
  asset_name: string;
  capacity: number;
}

export default function AdminCalendarTab() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Reservations state - Change type to ReservationWithRelations
  const [allReservations, setAllReservations] = useState<ReservationWithRelations[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Assets state - NEW
  const [assets, setAssets] = useState<Map<number, Asset>>(new Map());

  // Loading states
  const [loading, setLoading] = useState(false);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(false);

  // Show recent events state
  const [showRecent, setShowRecent] = useState(false);

  // Fetch assets function - NEW
  const fetchAssets = useCallback(async (assetIds: number[]) => {
    const uniqueIds = [...new Set(assetIds)];
    const missingIds = uniqueIds.filter(id => !assets.has(id));

    if (missingIds.length === 0) return;

    try {
      // Fetch all missing assets
      const assetPromises = missingIds.map(id =>
        apiClient.get<Asset[]>(`/reservations/${id}`)
      );

      const responses = await Promise.all(assetPromises);

      const newAssets = new Map(assets);
      responses.forEach((response, index) => {
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const asset = response.data[0];
          newAssets.set(missingIds[index], asset);
        }
      });

      setAssets(newAssets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  }, [assets]);

  // Fetch reservations function with lastUpdate parameter
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);

      const url = lastUpdate
        ? `/reservations/all?lastUpdate=${encodeURIComponent(lastUpdate.toISOString())}`
        : "/reservations/all";

      const response = await apiClient.get<ReservationWithRelations[]>(url);

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setAllReservations(response.data);

        const assetIds = response.data.map(r => r.asset_id);
        await fetchAssets(assetIds);

        setLastUpdate(new Date());
        setError(null);
      } else {
        setError("Unexpected response format from server");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Error fetching reservations: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [lastUpdate]);

  // Handle new reservation from modal
  const handleNewReservation = useCallback(async (newReservation: ReservationWithRelations) => {
    setAllReservations((prevReservations) => {
      const reservationExists = prevReservations.some(
        (reservation) => reservation.id === newReservation.id
      );

      if (reservationExists) {
        return prevReservations.map((reservation) =>
          reservation.id === newReservation.id ? newReservation : reservation
        );
      }

      return [...prevReservations, newReservation];
    });

    await fetchAssets([newReservation.asset_id]);
  }, [fetchReservations]);

  // Initial fetch of reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []); // Empty dependency - only run on mount

  // Convert reservations to events format for calendar
  const events: EventDetails[] = useMemo(() => {
    return allReservations
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
          info_type: reservation.info_type,
          description: reservation.description,
          people_tag: reservation.people_tag.split(", "),
          range: reservation.range,
          registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
          registration_deadline: reservation.date,
          // Now TypeScript knows about reserved_by_user
          reserved_by_user: reservation.reserved_by_user,
          reserve_by_user: reservation.reserved_by_user
            ? `${reservation.reserved_by_user.first_name} ${reservation.reserved_by_user.last_name}`
            : "Unknown User",
          approved_by_user_details: reservation.approved_by_user,
          declined_by_user_details: reservation.declined_by_user,
        };
      });
  }, [allReservations, assets]);

  // Get events for a particular day
  const getEventsForDate = useCallback((year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter(event => event.date === dateStr);

    return {
      hasEvent: dayEvents.length > 0,
      count: dayEvents.length
    };
  }, [events]);

  // Memoized selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay || !selectedDay.currentMonth) return [];

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`;

    const dayEvents = events.filter((event) => event.date === dateStr);

    return dayEvents;
  }, [events, selectedDay, currentMonth, currentYear]);

  // Event click handler
  const handleEventClick = useCallback((event: EventDetails) => {
    setEventInfoLoading(true);
    setEventInfoModalOpen(true);

    setTimeout(() => {
      setSelectedEvent(event);
      setEventInfoLoading(false);
    }, 600);
  }, []);

  // Close modal handler
  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  // Calendar day selection handler
  const handleDaySelect = useCallback((day: CalendarDayType) => {
    setShowRecent(false);
    setSelectedDay(day);
    setEventsListLoading(true);
    setModalOpen(true);

    // Simulate loading for UX
    setTimeout(() => {
      setEventsListLoading(false);
    }, 300);
  }, []);

  // Handle month/year changes
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <div className="h-full flex flex-col max-w-full">
      <h1 className="text-2xl sm:text-3xl font-normal leading-tight mb-4 sm:mb-6 px-2 sm:px-0">
        Admin Calendar
      </h1>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Calendar container */}
      <div className="bg-white rounded-md shadow-sm flex flex-col flex-1 p-3 sm:p-6 md:p-6.5">
        <Calendar
          role="admin"
          events={events}
          onDaySelect={handleDaySelect}
          getEventsForDate={getEventsForDate}
          initialDate={new Date()}
          isLoading={loading}
          setLoading={setLoading}
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthYearChange={handleMonthYearChange}
        />

        {/* Events List Modal */}
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
          allReservations={allReservations}
          onNewReservation={handleNewReservation}
        />

        {/* Event Info Modal */}
        <EventInfoModal
          role="admin"
          isOpen={eventInfoModalOpen}
          onClose={() => setEventInfoModalOpen(false)}
          event={selectedEvent}
          loading={eventInfoLoading}
          showBackdropBlur={false}
        />
      </div>
    </div>
  );
}