"use client";

import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import { useMemo, useState, useEffect, useCallback } from "react";
import { EventsListModal } from "@/features/calendar/components/events-list-modal";
import { EventInfoModal } from "@/features/calendar/components/event-info-modal";
import { Calendar } from "@/features/calendar/components/norsu-calendar";
import { CalendarSkeleton } from "@/shared/components/ui/skeleton";
import AboutSection from "@/shared/components/ui/about-section";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { usePublicReservations, usePublicAssets } from "@/features/calendar/services/reservation-service";
import { getPhilippineDateTime, getPhilippineMonth, getPhilippineYear, getPhilippineDay } from "@/features/calendar/utils/timezone-utils";

// Force dynamic rendering so dates are calculated on each request, not at build time
export const dynamic = 'force-dynamic';

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

export default function Home() {
  // PRODUCTION-READY: Client-only rendering to avoid hydration mismatch
  // This ensures 100% accurate Philippine time on every page load
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    // Only runs on client - guarantees correct Philippine timezone
    setMounted(true);
    const { year, month, date } = getPhilippineDateTime();
    setToday(date);
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [eventsListLoading, setEventsListLoading] = useState(false);

  // Fetch reservations using TanStack Query (PUBLIC - no auth required)
  const { reservations, loading, error } = usePublicReservations();

  // Get unique asset IDs from reservations
  const assetIds = useMemo(() => {
    return [...new Set(reservations.map(r => r.asset_id))];
  }, [reservations]);

  const { assets } = usePublicAssets(assetIds);

  // Handle error notifications from URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');

    if (!error) return;

    const hasShown = sessionStorage.getItem('last-toast-error');
    if (hasShown === error) {
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    sessionStorage.setItem('last-toast-error', error);

    const messages: Record<string, string> = {
      session_expired: "Session expired. Please log in again.",
      unauthorized: "Access denied. Please log in to view this page.",
    };

    const message = messages[error] || "An error occurred. Please try again.";
    toast.error(message, {
      duration: 5000,
      id: `toast-${error}-${Date.now()}`,
    });

    const url = new URL(window.location.href);
    url.searchParams.delete('error');
    window.history.replaceState({}, '', url.toString());

    setTimeout(() => sessionStorage.removeItem('last-toast-error'), 500);
  }, []);

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
        };
      });
  }, [reservations, assets]);

  // ⚡ PERFORMANCE: Combine filtering and sorting into single pass
  // Filter ONLY upcoming/current events for calendar display
  const upcomingEvents = useMemo(() => {
    // FIX: Use Philippine timezone for filtering upcoming events
    const year = getPhilippineYear();
    const month = String(getPhilippineMonth() + 1).padStart(2, '0');
    const day = String(getPhilippineDay()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    // ⚡ Single pass: filter, sort, and slice in one operation
    return allEvents
      .reduce<Array<{ title: string; date: string }>>((acc, event) => {
        if (!event.isFinished && event.date >= todayStr && acc.length < 5) {
          acc.push({
            title: event.title_name,
            date: event.date
          });
        }
        return acc;
      }, [])
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [allEvents]);

  // ⚡ PERFORMANCE: Simple filter - calendar only needs upcoming events
  // Get events for calendar - only show upcoming/current events on the calendar
  const calendarEvents = useMemo(() => {
    return allEvents.filter(event => !event.isFinished);
  }, [allEvents]);

  // ⚡ PERFORMANCE: Memoized callback to prevent re-creation on every render
  // Get events for a particular day
  const getEventsForDate = useCallback((year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // ⚡ Early return for better performance
    if (calendarEvents.length === 0) {
      return { hasEvent: false, count: 0 };
    }

    const dayEvents = calendarEvents.filter(event => event.date === dateStr);

    return {
      hasEvent: dayEvents.length > 0,
      count: dayEvents.length
    };
  }, [calendarEvents]);

  const monthNames = useMemo(
    () => [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    []
  );

  // Selected day events - includes ALL events (past and upcoming) for modal filtering
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay || !selectedDay.currentMonth) return [];

    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`;
    const dayEvents = allEvents.filter((event) => event.date === dateStr);

    return dayEvents;
  }, [allEvents, selectedDay, currentMonth, currentYear]);

  const handleEventClick = useCallback((event: EventDetails) => {
    setSelectedEvent(event);
    setEventInfoLoading(true);
    setEventInfoModalOpen(true);
    setTimeout(() => setEventInfoLoading(false), 700);
  }, []);

  const handleDaySelect = useCallback((day: CalendarDayType) => {
    setShowRecent(false);
    setSelectedDay(day);
    setEventsListLoading(true);
    setModalOpen(true);
    setTimeout(() => setEventsListLoading(false), 300);
  }, []);

  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Handle smooth scroll to about section
  const scrollToAbout = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-muted/50 flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <div className="relative bg-white px-2 sm:px-4 md:px-8 lg:px-16 xl:px-36 py-4 shadow-sm flex flex-col sm:flex-row items-center sm:items-center justify-between w-full gap-y-2">
        <div className="flex flex-row items-center justify-center sm:justify-start w-full sm:w-auto gap-2 sm:gap-0">
          <Link href="/login">
            <Image
              src="/images/norsu.png"
              alt="Negros Oriental State University"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain cursor-pointer"
              width={48}
              height={48}
            />
          </Link>
          <div className="flex flex-col items-center min-w-0 sm:hidden ml-2">
            <h1 className="font-semibold text-xl text-gray-800 text-center truncate">
              NORSU Calendar System
            </h1>
            <p className="text-sm text-gray-500 text-center truncate">
              Negros Oriental State University
            </p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-0">
          <h1 className="font-semibold text-2xl md:text-3xl text-gray-800 text-center truncate">
            NORSU Calendar System
          </h1>
          <p className="text-base md:text-lg text-gray-500 text-center truncate">
            Negros Oriental State University
          </p>
        </div>
        <div className="flex items-center space-x-1 shrink-0 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
          <Button asChild variant="ghost">
            <a href="#about-section" onClick={scrollToAbout} className="px-2 text-base sm:text-lg md:text-xl">
              ABOUT
            </a>
          </Button>
          {/* <span className="text-gray-200 text-xl select-none xs:inline">|</span>
          <Button asChild variant="ghost">
            <Link
              href="/auth/login"
              className="px-2 text-base sm:text-lg md:text-xl"
            >
              LOGIN
            </Link>
          </Button>
          <span className="text-gray-200 text-xl select-none xs:inline">|</span>
          <Button asChild variant="ghost">
            <Link
              href="/auth/register"
              className="px-2 text-base sm:text-lg md:text-xl"
            >
              REGISTER
            </Link>
          </Button> */}
        </div>
      </div>

      {/* Main content */}
      <div className="w-full flex flex-col">
        {/* Calendar Section - Takes full viewport height minus navbar */}
        <div className="flex-1 flex justify-center p-3.5 sm:p-6 md:p-6 min-h-[calc(100vh-80px)]">
          <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1">
            {/* Sidebar - Fixed width, height matches parent */}
            <div className="w-full text-card-foreground border lg:w-[320px] bg-white rounded-md shadow relative">
              <div className="flex flex-col p-4 sm:p-6 w-full lg:absolute lg:inset-0">
                <h2 className="text-2xl font-semibold mb-4 text-gray-700 text-center shrink-0">
                  Upcoming Events
                </h2>

                {loading && (
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <div className="text-gray-500">Loading events...</div>
                  </div>
                )}

                {error && (
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <div className="text-red-500 text-center">
                      <p className="font-semibold">Error loading events</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {!loading && !error && (
                  <>
                    {upcomingEvents.length > 0 ? (
                      <ul className="custom-scrollbar flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                        {upcomingEvents.map((event, idx) => (
                          <li
                            key={idx}
                            className="bg-gray-50 rounded-md px-3 py-2 border border-gray-100 shrink-0"
                          >
                            <div className="font-medium text-gray-800 text-lg">{event.title}</div>
                            <div className="text-base text-gray-500">{event.date}</div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex-1 flex items-center justify-center min-h-0">
                        <div className="text-gray-500 text-center">
                          <p className="font-semibold">No upcoming events</p>
                          <p className="text-sm">Check back later for new events</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Calendar - Takes remaining space */}
            <div className="flex-1 flex flex-col items-start justify-center min-h-0">
              <div className="w-full text-card-foreground border bg-white rounded-md shadow flex flex-col items-start self-stretch p-4 sm:p-6 gap-6 relative flex-1 min-h-0">
                {!mounted ? (
                  // CalendarSkeleton - prevents hydration mismatch
                  <CalendarSkeleton />
                ) : (
                  <Calendar
                    role="public"
                    events={calendarEvents}
                    onDaySelect={handleDaySelect}
                    getEventsForDate={getEventsForDate}
                    initialDate={today}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    onMonthYearChange={handleMonthYearChange}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <AboutSection />
      </div>

      {/* Modals */}
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
        isLoading={eventsListLoading}
        showRecent={showRecent}
        setShowRecent={setShowRecent}
        eventDate={
          selectedDay?.currentMonth
            ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`
            : ""
        }
      />

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