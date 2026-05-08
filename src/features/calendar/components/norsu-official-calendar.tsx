"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/features/calendar/components/norsu-calendar";
import { CalendarSkeleton } from "@/shared/components/ui/skeleton";
import UpcomingEventsSidebar from "@/app/_components/upcoming-events-sidebar";
import HomeModals from "@/app/_components/home-modals";
import { useTimedLoading } from "@/shared/components/hooks/use-timed-loading";
import usePublicCalendarData from "@/app/_hooks/use-public-calendar-data";
import useErrorToast from "@/app/_hooks/use-error-toast";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";
import { getPhilippineDateTime } from "@/features/calendar/utils/timezone-utils";

const monthNames = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export function NorsuOfficialCalendar() {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    setMounted(true);
    const { year, month, date } = getPhilippineDateTime();
    setToday(date);
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<CalendarDayType | null>(null);
  const [showRecent, setShowRecent] = useState<"upcoming" | "past" | "moved">("upcoming");
  const [fromMovedEventsContext, setFromMovedEventsContext] = useState(false);
  const {
    isLoading: eventInfoLoading,
    startLoading: startEventInfoLoading,
    stopLoading: stopEventInfoLoading,
  } = useTimedLoading();
  const {
    isLoading: eventsListLoading,
    startLoading: startEventsListLoading,
    stopLoading: stopEventsListLoading,
  } = useTimedLoading();

  useErrorToast();

  const { loading, error, upcomingEvents, getEventsForDate, selectedDayEvents } =
    usePublicCalendarData({ currentMonth, currentYear, selectedDay });

  const handleEventClick = useCallback((event: EventDetails, fromMovedEvents?: boolean) => {
    setFromMovedEventsContext(fromMovedEvents ?? false);
    setSelectedEvent(event);
    startEventInfoLoading(700);
    setEventInfoModalOpen(true);
  }, [startEventInfoLoading]);

  const handleDaySelect = useCallback((day: CalendarDayType) => {
    setShowRecent("upcoming");
    setSelectedDay(day);
    startEventsListLoading(300);
    setModalOpen(true);
  }, [startEventsListLoading]);

  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  return (
    <div className="flex-1 flex justify-center p-3.5 sm:p-6 min-h-[calc(100vh-80px)]">
      <div className="w-full flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 lg:items-stretch">
        <UpcomingEventsSidebar
          loading={loading}
          error={error}
          upcomingEvents={upcomingEvents}
        />

        <div className="flex-1 flex flex-col items-start min-h-0 lg:h-full">
          <div className="w-full text-card-foreground border bg-white rounded-md shadow-xs flex flex-col items-start self-stretch p-4 sm:p-6 gap-6 relative flex-1 min-h-0 lg:h-full">
            {!mounted ? (
              <CalendarSkeleton />
            ) : (
              <Calendar
                role="public"
                onDaySelect={handleDaySelect}
                onEventSelect={handleEventClick}
                getEventsForDate={getEventsForDate}
                initialDate={today}
                currentMonth={currentMonth}
                currentYear={currentYear}
                onMonthYearChange={handleMonthYearChange}
              />
            )}
          </div>
        </div>

        <HomeModals
          modalOpen={modalOpen}
          onModalClose={() => {
            setModalOpen(false);
            stopEventsListLoading();
          }}
          eventInfoModalOpen={eventInfoModalOpen}
          onEventInfoModalClose={() => {
            setEventInfoModalOpen(false);
            setFromMovedEventsContext(false);
            stopEventInfoLoading();
          }}
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
          fromMovedEventsContext={fromMovedEventsContext}
        />
      </div>
    </div>
  );
}
