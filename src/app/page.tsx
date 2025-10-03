"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { EventsListModal } from "@/components/modal/EventsListModal";
import { EventInfoModal } from "@/components/modal/EventInfoModal";
import { motion, AnimatePresence } from "framer-motion";
import type { EventDetails } from "@/interface/faculty-events-props";

export default function Home() {
  const upcomingEvents = [
    { title: "Orientation Day", date: "2025-09-01" },
    { title: "Midterm Exams", date: "2025-10-10" },
    { title: "University Week", date: "2025-11-15" },
    { title: "Christmas Party", date: "2025-12-20" },
    { title: "Final Exams", date: "2026-01-15" },
    { title: "Final Exams", date: "2026-01-15" },
    { title: "Final Exams", date: "2026-01-15" },
  ];

  const today = useMemo(() => new Date(), []);

  // State for current month and year - initialized with today's date
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [loading, setLoading] = useState(false);

  // Animation direction state
  const [direction, setDirection] = useState(0); // -1 for previous, 1 for next, 0 for initial/reset

  // Window width state for responsive rendering
  const [windowWidth, setWindowWidth] = useState(0);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(
    undefined
  );
  const [selectedDay, setSelectedDay] = useState<{
    date: number;
    currentMonth: boolean;
    key: string;
    hasEvent: boolean;
    eventCount?: number;
    isToday?: boolean;
  } | null>(null);

  // New state to control recent events visibility
  const [showRecent, setShowRecent] = useState(false);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setDirection(-1);
    setLoading(true);
    setTimeout(() => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
      setLoading(false);
    }, 700); // Adjust delay as needed
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    setDirection(1);
    setLoading(true);
    setTimeout(() => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
      setLoading(false);
    }, 700); // Adjust delay as needed
  }, [currentMonth]);

  const goToToday = useCallback(() => {
    const currentDate = new Date();
    const currentMonthYear = new Date(currentYear, currentMonth);
    const targetMonthYear = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    setDirection(
      targetMonthYear > currentMonthYear
        ? 1
        : targetMonthYear < currentMonthYear
        ? -1
        : 0
    );
    setLoading(true);
    setTimeout(() => {
      setCurrentMonth(today.getMonth());
      setCurrentYear(today.getFullYear());
      setLoading(false);
    }, 700); // Adjust delay as needed
  }, [currentMonth, currentYear, today]);

  // Sample events for demonstration (assuming events on day 15, 20, and 25)
  const eventsMap = useMemo(
    () => ({
      15: { title: "University Meeting", count: 1 },
      20: { title: "Faculty Conference", count: 3 },
      25: { title: "Deadline for Submissions", count: 2 },
    }),
    []
  );

  // Build calendar days (6 rows x 7 columns = 42 cells)
  const calendarDays = useMemo(() => {
    const days: {
      date: number;
      currentMonth: boolean;
      key: string;
      hasEvent: boolean;
      eventCount?: number;
      isToday?: boolean;
    }[] = [];

    // Get info for previous, current, and next month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
    const lastDateOfMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
    ).getDate();
    const lastDateOfPrevMonth = new Date(
      currentYear,
      currentMonth,
      0
    ).getDate();

    // 1. Fill in previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDate = lastDateOfPrevMonth - i;
      days.push({
        date: prevDate,
        currentMonth: false,
        key: `prev-${prevDate}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
    }

    // 2. Fill in current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday =
        i === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();
      days.push({
        date: i,
        currentMonth: true,
        key: `curr-${i}-${currentMonth}-${currentYear}`,
        hasEvent: i in eventsMap,
        eventCount: eventsMap[i as keyof typeof eventsMap]?.count,
        isToday,
      });
    }

    // 3. Fill in next month's days to reach 35 cells
    let nextMonthDay = 1;
    while (days.length < 35) {
      days.push({
        date: nextMonthDay,
        currentMonth: false,
        key: `next-${nextMonthDay}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
      nextMonthDay++;
    }

    return days;
  }, [currentMonth, currentYear, today, eventsMap]);

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

  // Get current month name and year as a formatted string
  const currentMonthYear = useMemo(
    () => `${monthNames[currentMonth]} ${currentYear}`,
    [currentMonth, currentYear, monthNames]
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

    return Array.from({ length: dayEvents.count }, (_, i) => {
      const eventTypeIndex = (selectedDay.date + i) % eventTypes.length;
      const locationIndex = (i + selectedDay.date * 2) % locations.length;
      const eventType = eventTypes[eventTypeIndex];
      const now = new Date();
      const startHour = now.getHours() - 1;
      const endHour = now.getHours();

      const startTime = `${startHour > 12 ? startHour - 12 : startHour}:${
        i % 2 === 0 ? "00" : "30"
      } ${startHour >= 12 ? "PM" : "AM"}`;
      const endTime = `${endHour > 12 ? endHour - 12 : endHour}:${
        i % 2 === 0 ? "30" : "00"
      } ${endHour >= 12 ? "PM" : "AM"}`;

      return {
        id: selectedDay.date * 100 + i,
        title:
          dayEvents.count > 1 ? `${eventType.title} ${i + 1}` : dayEvents.title,
        date: `${currentYear}-${String(currentMonth + 1).padStart(
          2,
          "0"
        )}-${String(selectedDay.date).padStart(2, "0")}`,
        time: `${startTime} - ${endTime}`,
        location: locations[locationIndex],
        description:
          "This event provides an opportunity for faculty and staff to engage with important university matters, share ideas, and collaborate on academic initiatives.",
        organizer:
          i % 2 === 0 ? "Faculty of Science" : "Department of Education",
        capacity: `${60 + i * 20} seats`,
        facilities: ["Wi-Fi", "Projector", "Air Conditioning"],
        registrationStatus: i % 3 === 0 ? "Closed" : "Open",
        attendeeCount: 30 + i * 5,
        registrationDeadline: `${monthNames[currentMonth]} ${Math.max(
          1,
          selectedDay.date - 2
        )}, ${currentYear}`,
        requirements:
          i % 2 === 0
            ? "Please bring your university ID and laptop"
            : undefined,
        category: eventType.category,
        // Use only names for peopleTag
        peopleTag: [
          i % 2 === 0 ? "John Doe" : "Jane Smith",
          i % 3 === 0 ? "Alice Johnson" : "Bob Lee",
        ],
        finishedOn:
          i % 3 === 0
            ? `${currentYear}-${String(currentMonth + 1).padStart(
                2,
                "0"
              )}-${String(selectedDay.date).padStart(2, "0")}`
            : undefined,
      } as EventDetails;
    });
  }, [eventsMap, currentMonth, currentYear, selectedDay, monthNames]);

  // Open event info modal with the selected event
  const handleEventClick = (event: EventDetails) => {
    setSelectedEvent(event);
    setEventInfoModalOpen(true);
  };

  // Animation variants
  const calendarVariants = {
    initial: (direction: number) => ({
      x: direction * 30,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      x: direction * -30,
      opacity: 0,
      transition: {
        x: { type: "spring" as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Header animation variants
  const headerVariants = {
    initial: (direction: number) => ({
      y: direction * 10,
      opacity: 0,
    }),
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: "spring" as const, stiffness: 500, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction: number) => ({
      y: direction * -10,
      opacity: 0,
      transition: {
        y: { type: "spring" as const, stiffness: 500, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  // Update the window width state on mount and on resize
  useEffect(() => {
    // Update the window width state with the initial size
    setWindowWidth(window.innerWidth);

    // Create handler to update state on window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty array ensures effect runs only once on mount

  // Calendar day click handler: open modal, show loading in modal
  const handleDayClick = (day: (typeof calendarDays)[number]) => {
    setSelectedDay(day);
    setModalOpen(true); // Open modal immediately
    setLoading(true); // Start loading animation in modal
    setTimeout(() => {
      setLoading(false); // Stop loading after 700ms
    }, 700);
  };

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
        <div className="flex-1 flex justify-center p-4 sm:p-6 md:p-8">
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
              <div className="w-full bg-white rounded-md shadow-md flex flex-col items-start self-stretch p-6 gap-6 relative flex-1 min-h-0">
                {/* Calendar header */}
                <div className="w-full grid grid-cols-3 items-center mb-1.5 relative">
                  {/* Left: arrow, today, select */}
                  <div className="flex items-center gap-2.5 justify-start relative">
                    {/* Arrow buttons group for desktop/tablet */}
                    <div className="hidden sm:flex items-center bg-white border border-gray-300 rounded-sm px-2 h-9 w-max">
                      <motion.button
                        className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                        aria-label="Previous"
                        type="button"
                        onClick={goToPreviousMonth}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </motion.button>
                      <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
                      <motion.button
                        className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                        aria-label="Next"
                        type="button"
                        onClick={goToNextMonth}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </motion.button>
                    </div>
                    {/* Today button */}
                    <motion.button
                      className="h-9 min-h-0 px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-base font-semibold shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Today"
                      type="button"
                      onClick={goToToday}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Today
                    </motion.button>
                    {/* Select button replaced with Select component */}
                    <Select>
                      <SelectTrigger className="h-9 min-h-0 px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-base font-semibold shadow-none hover:bg-gray-100 transition-colors w-[104px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Input field at the top of the dropdown */}
                        <div className="px-2 py-1 border-b border-gray-200 bg-white sticky top-0 z-10">
                          <input
                            className="w-full px-2 py-1 rounded border border-gray-300 text-base outline-none"
                            placeholder="Type here..."
                          />
                        </div>
                        <SelectItem value="option1" className="text-base">
                          Option 1
                        </SelectItem>
                        <SelectItem value="option2" className="text-base">
                          Option 2
                        </SelectItem>
                        <SelectItem value="option3" className="text-base">
                          Option 3
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Center: calendar title */}
                  <div className="flex flex-col items-center overflow-hidden">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.h2
                        key={currentMonthYear}
                        custom={direction}
                        variants={headerVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="text-center text-2xl font-medium leading-6"
                      >
                        {currentMonthYear}
                      </motion.h2>
                    </AnimatePresence>
                  </div>
                  {/* Right: month/week/day */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
                      <motion.button
                        className="px-4 rounded-sm min-w-[64px] py-2 text-lg font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors"
                        whileHover={{ backgroundColor: "#f3f4f6" }}
                      >
                        Month
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Calendar table */}
                <div className="flex flex-col w-full flex-1 h-full min-h-0">
                  {/* Calendar table header */}
                  <div className="w-full px-0 pb-3">
                    <div className="grid grid-cols-7 w-full">
                      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                        (day) => (
                          <div
                            key={day}
                            className="flex-1 text-base font-bold uppercase tracking-[1px] text-[#A8B2B9] text-center"
                          >
                            {windowWidth === 0
                              ? day // Initial render check
                              : windowWidth < 400
                              ? day.charAt(0)
                              : windowWidth < 640
                              ? day.slice(0, 1)
                              : day}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Calendar table days with animation */}
                  <div className="flex flex-col px-[1px] sm:px-0 py-[0.5px] w-full flex-1 h-full min-h-0 relative">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={`${currentMonth}-${currentYear}`}
                        custom={direction}
                        variants={calendarVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="grid grid-rows-5 grid-cols-7 w-full h-full gap-1.5 sm:gap-2 md:gap-2.5 bg-white flex-1"
                      >
                        {calendarDays.map((day, idx) => (
                          <motion.div
                            key={day.key}
                            data-idx={idx}
                            className={`relative border rounded-md flex flex-col p-2 md:p-3 text-lg md:text-xl font-medium cursor-pointer transition-colors hover:bg-blue-50 active:bg-blue-100 hover:shadow-sm min-h-[60px] sm:min-h-[70px] md:min-h-[80px]
                              ${
                                day.currentMonth
                                  ? "text-gray-900 border-gray-200"
                                  : "text-gray-400 border-gray-100 bg-gray-50"
                              }
                              ${day.isToday ? "border-blue-500 border-2" : ""}
                              ${
                                day.hasEvent && day.currentMonth
                                  ? "bg-blue-50"
                                  : ""
                              }
                            `}
                            onClick={() => handleDayClick(day)}
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              transition: {
                                delay: Math.min(0.01 * idx, 0.3),
                                duration: 0.12,
                              },
                            }}
                            whileHover={{
                              scale: 1.02,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                              transition: { duration: 0.2 },
                            }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Date number (always shown) */}
                            <div className="flex justify-end items-start w-full mb-2">
                              <span
                                className={`text-lg md:text-xl ${
                                  day.isToday
                                    ? "text-blue-600 font-bold"
                                    : day.currentMonth
                                    ? ""
                                    : "text-gray-400"
                                }`}
                              >
                                {day.date}
                              </span>
                            </div>

                            {/* 
                              Event indicators - ONLY SHOWN WHEN:
                              1. Day has events (day.hasEvent is true)
                              2. Day is in current month (day.currentMonth is true)
                              3. Event count is greater than 0 (additional check for API safety)
                            */}
                            {day.hasEvent &&
                              day.currentMonth &&
                              day.eventCount &&
                              day.eventCount > 0 && (
                                <>
                                  {/* Desktop/Laptop: Top-left calendar icon and count */}
                                  <motion.div
                                    className="hidden md:inline-flex items-center bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-xl text-lg md:text-xl font-semibold absolute top-2 left-2"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                      scale: 1,
                                      opacity: 1,
                                      transition: {
                                        delay: Math.min(0.01 * idx + 0.1, 0.4),
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 15,
                                      },
                                    }}
                                  >
                                    <CalendarClock size={18} className="mr-1" />
                                    <span>{day.eventCount}</span>
                                  </motion.div>

                                  {/* Mobile: Centered calendar icon */}
                                  <motion.div
                                    className="md:hidden flex-grow flex items-center justify-center"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                      scale: 1,
                                      opacity: 1,
                                      transition: {
                                        delay: Math.min(0.01 * idx + 0.1, 0.4),
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 15,
                                      },
                                    }}
                                  >
                                    <div className="inline-flex items-center bg-blue-100 text-blue-700 px-1 py-1 rounded-xl text-base font-semibold w-min">
                                      <CalendarClock
                                        size={14}
                                        className="mr-0.5"
                                      />
                                      <span>{day.eventCount}</span>
                                    </div>
                                  </motion.div>

                                  {/* Desktop/Laptop: "See event" or "See events..." text */}
                                  <motion.div
                                    className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                      opacity: 1,
                                      transition: {
                                        delay: Math.min(0.01 * idx + 0.2, 0.5),
                                        duration: 0.3,
                                      },
                                    }}
                                  >
                                    <span className="text-blue-600 text-sm md:text-base font-medium px-2 py-0.5 rounded pointer-events-auto translate-y-3">
                                      {day.eventCount === 1
                                        ? "See event"
                                        : "See events..."}
                                    </span>
                                  </motion.div>
                                </>
                              )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Fixed arrow buttons group for mobile only */}
                <div className="sm:hidden">
                  <div className="absolute bottom-3 left-1/2 z-50 -translate-x-1/2 flex items-center bg-white border border-gray-300 rounded-full px-2 h-10 w-max shadow-md">
                    <motion.button
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Previous"
                      type="button"
                      onClick={goToPreviousMonth}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </motion.button>
                    <span className="mx-1.5 h-5 w-px bg-gray-300 rounded"></span>
                    <motion.button
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Next"
                      type="button"
                      onClick={goToNextMonth}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events List Modal with table implementation */}
      <EventsListModal
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
        isOpen={eventInfoModalOpen}
        onClose={() => setEventInfoModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}
