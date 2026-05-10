"use client";

import { useState, useCallback, useRef, useEffect, useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/features/calendar/components/norsu-calendar";
import { CalendarSkeleton } from "@/shared/components/ui/skeleton";
import UpcomingEventsSidebar from "./upcoming-events-sidebar";
import HomeModals from "./home-modals";
import { useTimedLoading } from "@/shared/components/hooks/use-timed-loading";
import { getPhilippineDateTime } from "@/features/calendar/utils/timezone-utils";
import usePublicCalendarData from "@/app/_hooks/use-public-calendar-data";
import useErrorToast from "@/app/_hooks/use-error-toast";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";

const fadeUp = (delay: number, y: number = 16, duration: number = 0.6) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration, delay, ease: "easeOut" as const },
});

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(0);
  const [currentYear, setCurrentYear] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Modal states
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

  const monthNames = useMemo(
    () => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    [],
  );
  const revealLayerStyle = useMemo<CSSProperties>(() => ({
    backfaceVisibility: "hidden",
    willChange: "transform, opacity",
  }), []);

  useEffect(() => {
    setMounted(true);
    const { year, month, date } = getPhilippineDateTime();
    setToday(date);
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleVisibility = () => {
      if (!document.hidden) video.play().catch(() => { });
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useErrorToast();

  const { loading, error, upcomingEvents, getEventsForDate, selectedDayEvents } =
    usePublicCalendarData({ currentMonth, currentYear, selectedDay });

  const handleMonthYearChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  const handleDaySelect = useCallback((day: CalendarDayType) => {
    setShowRecent("upcoming");
    setSelectedDay(day);
    startEventsListLoading(300);
    setModalOpen(true);
  }, [startEventsListLoading]);

  const handleEventClick = useCallback((event: EventDetails, fromMovedEvents?: boolean) => {
    setFromMovedEventsContext(fromMovedEvents ?? false);
    setSelectedEvent(event);
    startEventInfoLoading(700);
    setEventInfoModalOpen(true);
  }, [startEventInfoLoading]);

  return (
    <section id="hero-section" className="relative overflow-hidden flex flex-col items-center">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/hero-poster.jpg"
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-36 bg-gradient-to-b from-transparent via-background/45 to-background md:h-45"
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full pt-12 md:pt-16 px-4">
        {/* Badge */}
        <motion.div
          {...fadeUp(0, 10, 0.5)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground font-body mb-6"
          style={revealLayerStyle}
        >
          <span><span className="text-red-600">N</span><span className="text-blue-600">EGROS </span><span className="text-red-600">OR</span><span className="text-blue-600">IENTAL </span><span className="text-red-600">S</span><span className="text-blue-600">TATE </span><span className="text-red-600">U</span><span className="text-blue-600">NIVERSITY</span></span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1, 16, 0.6)}
          className="text-center font-display text-5xl md:text-6xl lg:text-[5rem] leading-[0.95] tracking-tight text-foreground max-w-xl"
          style={revealLayerStyle}
        >
          Our Pride, Our Hope, <em className="font-display italic">Our Future</em>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          {...fadeUp(0.2, 16, 0.6)}
          className="mt-4 text-center text-base md:text-lg text-muted-foreground max-w-[650px] leading-relaxed"
          style={revealLayerStyle}
        >
          NORSU Calendar System: Digital Scheduling and Event Management for Main Campus I & II
        </motion.p>

        <motion.div
          {...fadeUp(0.3, 16, 0.6)}
          className="relative mt-16 h-20 w-full"
          style={revealLayerStyle}
        >
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">SCROLL</div>
            <div className="relative w-px h-10 overflow-hidden">
              <div className="absolute left-0 right-0 h-8 bg-text-primary animate-scroll-down" />
            </div>
          </div>
        </motion.div>

        {/* Calendar Preview */}
        <motion.div
          {...fadeUp(0.5, 30, 0.8)}
          className="mt-4 w-full max-w-355 pb-24"
          style={revealLayerStyle}
        >
          <div
            className="rounded-2xl p-3 md:p-4 flex flex-col min-h-[calc(100vh-80px)]"
            style={{
              background: "rgba(255, 255, 255, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "var(--shadow-dashboard)",
            }}
          >
            <div className="flex flex-col lg:flex-row gap-3 md:gap-4 flex-1 lg:items-stretch">
              {/* Upcoming Events — LEFT */}
              <div className="shrink-0">
                <UpcomingEventsSidebar
                  loading={loading}
                  error={error}
                  upcomingEvents={upcomingEvents}
                />
              </div>
              {/* Calendar — RIGHT */}
              <div className="flex-1 flex flex-col items-start min-h-0">
                <div className="w-full bg-white rounded-lg p-3 md:p-4 min-w-0 flex flex-col self-stretch flex-1 min-h-0">
                  {!mounted ? (
                    <CalendarSkeleton />
                  ) : (
                    <Calendar
                      role="public"
                      currentMonth={currentMonth}
                      currentYear={currentYear}
                      initialDate={today}
                      onMonthYearChange={handleMonthYearChange}
                      getEventsForDate={getEventsForDate}
                      onDaySelect={handleDaySelect}
                      onEventSelect={handleEventClick}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
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
    </section>
  );
};

export default HeroSection;
