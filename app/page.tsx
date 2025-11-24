"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect, useCallback } from "react";
import { EventsListModal } from "@/components/modal/events-list-modal";
import { EventInfoModal } from "@/components/modal/event-info-modal";
import { Calendar } from "@/components/ui/norsu-calendar";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast"; // Import toast

export default function Home() {
  const searchParams = useSearchParams();

  const upcomingEvents = [
    { title: "University Week", date: "2025-11-15" },
    { title: "Christmas Party", date: "2025-12-20" },
    { title: "Final Exams", date: "2026-01-15" },
    { title: "Final Exams", date: "2026-01-15" },
    { title: "Final Exams", date: "2026-01-15" },
  ];

  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(
    undefined
  );
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);

  // Show recent events state
  const [showRecent, setShowRecent] = useState(false);

  // Check for error parameter and show toast
  useEffect(() => {
    const error = searchParams?.get('error');

    if (error === 'session_expired') {
      toast.error("Session Expired. You don't have permission to view that page. Please log in again.", {
        duration: 5000,
      });

      // Remove the error parameter from URL without page reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }
    } else if (error === 'unauthorized') {
      toast.error("Access Denied. You don't have permission to view that page. Please log in.", {
        duration: 5000,
      });

      // Remove the error parameter from URL without page reload
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [searchParams]);

  // Sample events for demonstration
  const eventsMap = useMemo(
    () => ({
      15: { title: "University Meeting", count: 1 },
      20: { title: "Faculty Conference", count: 3 },
      25: { title: "Deadline for Submissions", count: 2 },
    }),
    []
  );

  // Get events for a particular day - used by Calendar component
  const getEventsForDate = useCallback(
    (year: number, month: number, day: number) => {
      const hasEvent = eventsMap[day as keyof typeof eventsMap] !== undefined;
      const count = hasEvent ? eventsMap[day as keyof typeof eventsMap].count : 0;
      return { hasEvent, count };
    },
    [eventsMap]
  );

  // Format month and year
  const monthNames = useMemo(
    () => [
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
    ],
    []
  );

  // Memoize selected day events
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay || !selectedDay.hasEvent || !selectedDay.currentMonth) {
      return [];
    }

    const dayEvents = eventsMap[selectedDay.date as keyof typeof eventsMap];
    if (!dayEvents) return [];

    const eventTypes = [
      { category: "Academic", title: "Faculty Meeting" },
      { category: "Workshop", title: "Research Workshop" },
      { category: "Social", title: "Campus Social Event" },
      { category: "Academic", title: "Department Conference" },
      { category: "Workshop", title: "Professional Development" },
      { category: "Social", title: "Student Organization Event" },
    ];

    const locations = [
      "Main Building, Room 101",
      "Science Building, Room 203",
      "Library Conference Room",
      "Auditorium",
      "Computer Lab, Room 405",
      "Student Center",
    ];

    const events: EventDetails[] = [];

    for (let i = 0; i < dayEvents.count; i++) {
      const eventTypeIndex = (selectedDay.date + i) % eventTypes.length;
      const locationIndex = (i + selectedDay.date * 2) % locations.length;
      const eventType = eventTypes[eventTypeIndex];
      const now = new Date();
      const startHour = now.getHours() - 1;
      const endHour = now.getHours();

      const startTime = `${startHour > 12 ? startHour - 12 : startHour}:${i % 2 === 0 ? "00" : "30"
        } ${startHour >= 12 ? "PM" : "AM"}`;
      const endTime = `${endHour > 12 ? endHour - 12 : endHour}:${i % 2 === 0 ? "30" : "00"
        } ${endHour >= 12 ? "PM" : "AM"}`;

      events.push({
        id: selectedDay.date * 100 + i,
        title_name:
          dayEvents.count > 1 ? `${eventType.title} ${i + 1}` : dayEvents.title,
        date: `${currentYear}-${String(currentMonth + 1).padStart(
          2,
          "0"
        )}-${String(selectedDay.date).padStart(2, "0")}`,
        time_start: startTime,
        time_end: endTime,
        asset: {
          id: locationIndex + 1,
          asset_name: locations[locationIndex],
          capacity: 60 + i * 20,
          facilities: ["Wi-Fi", "Projector", "Air Conditioning"],
          asset_type: "Room"
        },
        category: eventType.category,
        info_type: i % 2 === 0 ? "Public" : "Private",
        description:
          "This event provides an opportunity for faculty and staff to engage with important university matters, share ideas, and collaborate on academic initiatives.",
        people_tag: [
          i % 2 === 0 ? "John Doe" : "Jane Smith",
          i % 3 === 0 ? "Alice Johnson" : "Bob Lee",
        ],
        range: 1,
        registration_status: (i % 3 === 0 ? "REJECTED" : i % 2 === 0 ? "APPROVED" : "PENDING") as "PENDING" | "APPROVED" | "REJECTED",
        registration_deadline: `${monthNames[currentMonth]} ${Math.max(
          1,
          selectedDay.date - 2
        )}, ${currentYear}`,
        reserve_by: i % 2 === 0 ? "Faculty of Science" : "Department of Education",
        approved_by: i % 2 === 0 ? "Dean Johnson" : undefined,
        rejected_by: i % 3 === 0 ? "Admin Smith" : undefined,
        finished_on:
          i % 3 === 0
            ? `${currentYear}-${String(currentMonth + 1).padStart(
              2,
              "0"
            )}-${String(selectedDay.date).padStart(2, "0")}`
            : undefined,
      });
    }

    return events;
  }, [eventsMap, currentMonth, currentYear, selectedDay, monthNames]);

  // Open event info modal with the selected event
  const handleEventClick = useCallback((event: EventDetails) => {
    setSelectedEvent(event);
    setEventInfoLoading(true);
    setEventInfoModalOpen(true);
    setTimeout(() => setEventInfoLoading(false), 700);
  }, []);

  // Calendar day selection handler
  const handleDaySelect = useCallback(
    (day: CalendarDayType) => {
      setSelectedDay(day);
      setModalOpen(true);
    },
    []
  );

  // Add handleMonthYearChange to synchronize state
  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col overflow-x-hidden">
      {/* Navbar: full width */}
      <div className="relative bg-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-36 py-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-center justify-between w-full gap-y-2">
        {/* Logo (left, or with title on mobile) */}
        <div className="flex flex-row items-center justify-center sm:justify-start w-full sm:w-auto gap-2 sm:gap-0">
          <Image
            src="/images/norsu.png"
            alt="Negros Oriental State University"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            width={48}
            height={48}
          />
          {/* Title (side by side on mobile, hidden on sm+) */}
          <div className="flex flex-col items-center min-w-0 sm:hidden ml-2">
            <h1 className="font-semibold text-xl text-gray-800 text-center truncate">
              NORSU Calendar System
            </h1>
            <p className="text-sm text-gray-500 text-center truncate">
              Negros Oriental State University
            </p>
          </div>
        </div>
        {/* Title (centered on sm+ only) */}
        <div className="hidden sm:flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-0">
          <h1 className="font-semibold text-2xl md:text-3xl text-gray-800 text-center truncate">
            NORSU Calendar System
          </h1>
          <p className="text-base md:text-lg text-gray-500 text-center truncate">
            Negros Oriental State University
          </p>
        </div>
        {/* Auth buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant="ghost"
            className="cursor-pointer text-base sm:text-lg md:text-xl px-2"
            type="button"
            onClick={() => (window.location.href = "/auth/login")}
          >
            LOGIN
          </Button>
          <span className="text-gray-200 text-xl select-none xs:inline">|</span>
          <Button
            variant="ghost"
            className="cursor-pointer text-base sm:text-lg md:text-xl px-2"
            type="button"
            onClick={() => (window.location.href = "/auth/register")}
          >
            REGISTER
          </Button>
        </div>
      </div>

      {/* Main container */}
      <div className="w-full flex flex-col flex-1">
        {/* Content area */}
        <div className="flex-1 flex justify-center p-3.5 sm:p-6 md:p-6 lg:p-8">
          <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-8 flex-1">
            {/* Sidebar */}
            <div className="w-full lg:w-[320px] h-[400px] lg:h-[502px] bg-white rounded-md shadow-md flex flex-col p-4 sm:p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center">
                Upcoming Events
              </h2>
              <ul className="custom-scrollbar flex flex-col gap-2 overflow-y-auto flex-1">
                {upcomingEvents.map((event, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-50 rounded-md px-3 py-2 border border-gray-100"
                  >
                    <div className="font-medium text-gray-800 text-lg">
                      {event.title}
                    </div>
                    <div className="text-base text-gray-500">{event.date}</div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col items-start justify-center">
              <div className="w-full bg-white rounded-md shadow-md flex flex-col items-start self-stretch p-4 sm:p-6 gap-6 relative flex-1 min-h-0">
                {/* Calendar component */}
                <Calendar
                  role="public"
                  events={[]}
                  onDaySelect={handleDaySelect}
                  getEventsForDate={getEventsForDate}
                  initialDate={today}
                  isLoading={loading}
                  setLoading={setLoading}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  onMonthYearChange={handleMonthYearChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events List Modal with table implementation */}
      <EventsListModal
        role="public"
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          selectedDay
            ? selectedDay.currentMonth
              ? `Events on ${monthNames[currentMonth]} ${selectedDay.date}, ${currentYear}`
              : `${selectedDay.date} ${monthNames[currentMonth]}, ${currentYear} (Outside current month)`
            : ""
        }
        events={selectedDayEvents}
        onEventClick={handleEventClick}
        isLoading={loading}
        showRecent={showRecent}
        setShowRecent={setShowRecent}
        eventDate={
          selectedDay && selectedDay.currentMonth
            ? `${currentYear}-${String(currentMonth + 1).padStart(
              2,
              "0"
            )}-${String(selectedDay.date).padStart(2, "0")}`
            : ""
        }
      />

      {/* Event Info Modal */}
      <EventInfoModal
        role="public"
        isOpen={eventInfoModalOpen}
        onClose={() => setEventInfoModalOpen(false)}
        event={selectedEvent}
        loading={eventInfoLoading}
      />
    </div>
  );
}