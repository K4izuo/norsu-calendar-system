"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Calendar } from "@/components/ui/norsu-calendar";
import { EventsListModal } from "@/components/modal/events-list-modal";
import { EventInfoModal } from "@/components/modal/event-info-modal";
import { CalendarDayType } from "@/interface/user-props";
import { AdminEventDetails } from "@/interface/user-props";

// Mock function to fetch admin events - replace with actual API
const fetchAdminEvents = async (): Promise<AdminEventDetails[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return [
    {
      id: 1,
      title: "Admin Meeting",
      date: "2025-10-16",
      time: "10:00-12:00",
      location: "Admin Building, Room 101",
      attendeeCount: 15,
      category: "Administrative",
      infoType: "Internal",
      description: "Monthly administrative meeting to discuss university policies.",
      peopleTag: ["admin", "management"],
      registrationStatus: "open",
      organizer: "Admin Office",
      capacity: "20",
      registrationDeadline: "2025-10-14",
      approvalStatus: "approved",
      createdBy: "System Administrator"
    },
    {
      id: 2,
      title: "Budget Planning Session",
      date: "2025-10-20",
      time: "14:00-16:00",
      location: "Finance Department",
      attendeeCount: 8,
      category: "Finance",
      infoType: "Confidential",
      description: "Annual budget planning for academic departments.",
      peopleTag: ["admin", "finance"],
      registrationStatus: "open",
      organizer: "Finance Director",
      capacity: "10",
      registrationDeadline: "2025-10-18",
      approvalStatus: "approved",
      createdBy: "Finance Department"
    }
  ];
};

export default function AdminCalendarTab() {
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AdminEventDetails | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Events state
  const [events, setEvents] = useState<AdminEventDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(false);

  // Show recent events state
  const [showRecent, setShowRecent] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    setEventsListLoading(true);
    setLoading(true); // Set calendar loading to true
    
    fetchAdminEvents()
      .then(data => {
        setEvents(data);
      })
      .catch(error => {
        console.error("Error fetching admin events:", error);
        setEvents([]);
      })
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

  // Memoized selected day events
  const selectedDayEvents = useCallback(() => {
    if (!selectedDay || !selectedDay.currentMonth) return [];
    
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`;
    
    return events.filter((event) => event.date === dateStr);
  }, [events, selectedDay, currentMonth, currentYear])();
  
  // Event click handler
  const handleEventClick = useCallback((event: AdminEventDetails) => {
    setEventInfoLoading(true);
    setEventInfoModalOpen(true);
    
    // Simulate fetching detailed event info
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
    // Reset to current events before opening modal
    setShowRecent(false);
    
    // Update selected day
    setSelectedDay(day);
    
    // Show loading animation
    setEventsListLoading(true);
    
    // Open modal
    setModalOpen(true);
    
    // Simulate API call for events on this date
    const fetchData = async () => {
      try {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
        
        // In a real implementation, you'd fetch events for this specific date
        // const response = await fetch(`/api/admin/events?date=${dateStr}`);
        // const data = await response.json();
        
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 200));
        
      } catch (error) {
        console.error("Error fetching admin event details:", error);
      } finally {
        setEventsListLoading(false);
      }
    };
    
    fetchData();
  }, [currentMonth, currentYear]);

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

      {/* Calendar container */}
      <div className="bg-white rounded-md shadow-md flex flex-col flex-1 p-3 sm:p-6 md:p-7">
        {/* Calendar component */}
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
          role="admin"  // Add this line
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