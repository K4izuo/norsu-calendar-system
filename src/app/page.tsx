"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { Calendar } from "@/features/calendar/components/norsu-calendar";
import { CalendarSkeleton } from "@/shared/components/ui/skeleton";
import AboutSection from "@/shared/components/ui/about-section";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";
import { getPhilippineDateTime } from "@/features/calendar/utils/timezone-utils";
import HomeNavbar from "./_components/home-navbar";
import UpcomingEventsSidebar from "./_components/upcoming-events-sidebar";
import HomeModals from "./_components/home-modals";
import usePublicCalendarData from "./_hooks/use-public-calendar-data";
import useErrorToast from "./_hooks/use-error-toast";

// Force dynamic rendering so dates are calculated on each request, not at build time
export const dynamic = 'force-dynamic';

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

  useErrorToast();

  const { loading, error, calendarEvents, upcomingEvents, getEventsForDate, selectedDayEvents } =
    usePublicCalendarData({ currentMonth, currentYear, selectedDay });

  const monthNames = useMemo(
    () => [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ],
    []
  );

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
      <HomeNavbar onScrollToAbout={scrollToAbout} />

      {/* Main content */}
      <div className="w-full flex flex-col">
        {/* Calendar Section - Takes full viewport height minus navbar */}
        <div className="flex-1 flex justify-center p-3.5 sm:p-6 md:p-6 min-h-[calc(100vh-80px)]">
          <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 lg:items-stretch">
            {/* Sidebar - Fixed width, height matches parent */}
            <UpcomingEventsSidebar loading={loading} error={error} upcomingEvents={upcomingEvents} />

            {/* Calendar - Takes remaining space */}
            <div className="flex-1 flex flex-col items-start min-h-0 lg:h-full">
              <div className="w-full text-card-foreground border bg-white rounded-md shadow flex flex-col items-start self-stretch p-4 sm:p-6 gap-6 relative flex-1 min-h-0 lg:h-full">
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
      <HomeModals
        modalOpen={modalOpen}
        onModalClose={() => setModalOpen(false)}
        eventInfoModalOpen={eventInfoModalOpen}
        onEventInfoModalClose={() => setEventInfoModalOpen(false)}
        selectedDay={selectedDay}
        currentMonth={currentMonth}
        currentYear={currentYear}
        monthNames={monthNames}
        selectedDayEvents={selectedDayEvents}
        onEventClick={handleEventClick}
        eventsListLoading={eventsListLoading}
        showRecent={showRecent}
        setShowRecent={setShowRecent}
        selectedEvent={selectedEvent}
        eventInfoLoading={eventInfoLoading}
      />
    </div>
  );
}
