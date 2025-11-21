"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Calendar } from "@/components/ui/norsu-calendar";
import { EventsListModal } from "@/components/modal/events-list-modal";
import { EventInfoModal } from "@/components/modal/event-info-modal";
import { EventDetails, CalendarDayType, Reservation } from "@/interface/user-props";
import { apiClient } from "@/lib/api-client";

export default function AdminCalendarTab() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Reservations state
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(false);

  // Show recent events state
  const [showRecent, setShowRecent] = useState(false);

  // Fetch reservations function with lastUpdate parameter
  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);

      // Build URL with lastUpdate query parameter
      const url = lastUpdate
        ? `/reservations/all?lastUpdate=${encodeURIComponent(lastUpdate.toISOString())}`
        : "/reservations/all";

      const response = await apiClient.get<Reservation[]>(url); // Changed from { reservations: Reservation[] }

      if (response.error) {
        setError(response.error);
        return;
      }

      // Check if response.data is an array directly
      if (response.data && Array.isArray(response.data)) {
        setAllReservations(response.data);
        setLastUpdate(new Date()); // Update timestamp after successful fetch
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
  const handleNewReservation = useCallback((newReservation: Reservation) => {
    setAllReservations((prevReservations) => {
      const reservationExists = prevReservations.some(
        (reservation) => reservation.id === newReservation.id
      );

      if (reservationExists) {
        // Update existing reservation
        return prevReservations.map((reservation) =>
          reservation.id === newReservation.id ? newReservation : reservation
        );
      }

      // Add new reservation
      return [...prevReservations, newReservation];
    });

    // Trigger immediate fetch after creation to sync with backend
    fetchReservations();
  }, [fetchReservations]);

  // Initial fetch of reservations on mount
  useEffect(() => {
    fetchReservations();
  }, []); // Empty dependency - only run on mount

  // Convert reservations to events format for calendar
  const events: EventDetails[] = React.useMemo(() => {
    
    return allReservations.map(reservation => ({
      id: reservation.id,
      title_name: reservation.title_name,
      date: reservation.date,
      time_start: reservation.time_start,
      time_end: reservation.time_end,
      asset: {
        id: reservation.asset_id,
        asset_name: `Asset #${reservation.asset_id}`, // Changed to show asset ID
        capacity: 0,
      },
      category: reservation.category,
      info_type: reservation.info_type,
      description: reservation.description,
      people_tag: reservation.people_tag.split(", "),
      range: reservation.range,
      registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED",
      registration_deadline: reservation.date,
      reserve_by: `User #${reservation.reserve_by_user}`, // Added reserve_by_user
    }));
  }, [allReservations]);

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
  const selectedDayEvents = React.useMemo(() => {
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
      <div className="bg-white rounded-md shadow-md flex flex-col flex-1 p-3 sm:p-6 md:p-7">
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
        />
      </div>
    </div>
  );
}