"use client";

import React, { useEffect, useState, useCallback } from "react";
import { fetchFacultyEvents } from "@/api/facultyEventsApi";
import { EventsListModal } from "@/components/modal/events-list-modal";
import { EventInfoModal } from "@/components/modal/event-info-modal";
import { Calendar } from "@/components/ui/norsu-calendar";
import { FacultyPageEventDetails, CalendarDayType } from "@/interface/user-props";

export default function FacultyEventsTab() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FacultyPageEventDetails | undefined>(
    undefined
  );
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Events state
  const [events, setEvents] = useState<FacultyPageEventDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(false);

  // Show recent events state
  const [showRecent, setShowRecent] = useState(false);

  // Fetch events ONCE on mount
  useEffect(() => {
    setEventsListLoading(true);
    setLoading(true);

    fetchFacultyEvents()
      .then((data) => {
        if (data.length === 0) {
          // Add mock events for testing
          setEvents([
            {
              id: 1,
              title: "Sample Event",
              date: "2025-10-03",
              time: "10:00-12:00",
              location: "Room 101",
              attendeeCount: 20,
              category: "Seminar",
              infoType: "Info",
              description: "This is a mock event.",
              peopleTag: ["faculty"],
              registrationStatus: "open",
              organizer: "John Doe",
              capacity: "50",
              registrationDeadline: "2025-09-30"
            },
          ]);
        } else {
          setEvents(data);
        }
      })
      .catch(() => setEvents([]))
      .finally(() => {
        setEventsListLoading(false);
        setLoading(false); // Set calendar loading to false
      });
  }, []); 

  // Get events for a particular day - used by Calendar component
  const getEventsForDate = useCallback((year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayEvents = events.filter(event => event.date === dateStr);
    return {
      hasEvent: dayEvents.length > 0,
      count: dayEvents.length
    };
  }, [events]);

  // Properly memoized selectedDayEvents
  const selectedDayEvents = useCallback(() => {
    if (!selectedDay || !selectedDay.currentMonth) return [];
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`;
    
    return events.filter((event) => event.date === dateStr);
  }, [events, selectedDay, currentMonth, currentYear])();
  
  // Event click handler
  const handleEventClick = useCallback((event: FacultyPageEventDetails) => {
    setEventInfoLoading(true);
    setEventInfoModalOpen(true);
    
    // Simulate async loading (replace with real fetch if needed)
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
    // Always reset to current events before opening modal
    setShowRecent(false);
    
    // Update selected day
    setSelectedDay(day);
    
    // Set eventsListLoading to true to show loading animation in the modal
    setEventsListLoading(true);
    
    // Open modal
    setModalOpen(true);
    
    // Simulate API call to fetch events for this date
    const fetchData = async () => {
      try {
        // In real implementation, this would be an API call
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
        
        // Simulated API delay - remove this in production and replace with actual API call
        await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
        
        // Additional data processing could happen here
        
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setEventsListLoading(false);
      }
    };
    
    fetchData();
  }, [currentMonth, currentYear]);

  // Add handler to keep parent state in sync with calendar navigation
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
        Events
      </h1>

      {/* Calendar - improved height and proportions with better responsiveness */}
      <div className="bg-white rounded-md shadow-md flex flex-col flex-1 p-3 sm:p-6 md:p-7">
        {/* Calendar component with month/year change handler */}
        <Calendar
          role="dean"
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

        {/* Events List Modal with proper events data */}
        <EventsListModal
          role="faculty"  // Add this line
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
        />

        {/* Event Info Modal */}
        <EventInfoModal
          role="faculty"
          isOpen={eventInfoModalOpen}
          onClose={() => setEventInfoModalOpen(false)}
          event={selectedEvent}
          loading={eventInfoLoading}
        />
      </div>
    </div>
  );
}
