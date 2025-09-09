"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EventsListModal } from "@/components/modal/public-events/EventsListModal";
import { EventInfoModal } from "@/components/modal/EventInfoModal";
import { AnimatePresence, motion } from "framer-motion";
import { EventDetails } from "@/types/faculty-events-details";
import toast from "react-hot-toast";

export default function FacultyEventsTab() {
  const today = new Date();
  
  // State for current month and year - initialized with today's date
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  
  // Animation direction state
  const [direction, setDirection] = useState(0); // -1 for previous, 1 for next, 0 for initial/reset
  
  // Calculate calendar data based on current month and year
  const firstDayOfMonth = useMemo(() => 
    new Date(currentYear, currentMonth, 1).getDay(),
  [currentMonth, currentYear]);
  
  const lastDateOfMonth = useMemo(() => 
    new Date(currentYear, currentMonth + 1, 0).getDate(),
  [currentMonth, currentYear]);
  
  const lastDateOfPrevMonth = useMemo(() => 
    new Date(currentYear, currentMonth, 0).getDate(),
  [currentMonth, currentYear]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined);
  const [selectedDay, setSelectedDay] = useState<{
    date: number;
    currentMonth: boolean;
    key: string;
    hasEvent: boolean;
    eventCount?: number;
    isToday?: boolean;
  } | null>(null);

  // Window width state for responsive rendering
  const [windowWidth, setWindowWidth] = useState(0);

  // Navigation functions
  const goToPreviousMonth = () => {
    setDirection(-1); // Set direction for animation
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection(1); // Set direction for animation
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const goToToday = () => {
    // If going to past, use negative direction, if going to future, use positive
    const currentDate = new Date();
    const currentMonthYear = new Date(currentYear, currentMonth);
    const targetMonthYear = new Date(currentDate.getFullYear(), currentDate.getMonth());
    setDirection(targetMonthYear > currentMonthYear ? 1 : targetMonthYear < currentMonthYear ? -1 : 0);
    
    // Set the current month and year to today's date
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // Sample events for demonstration (assuming events on day 15, 20, and 25)
  const eventsMap = {
    15: { title: "University Meeting", count: 1 },
    20: { title: "Faculty Conference", count: 6 },
    25: { title: "Deadline for Submissions", count: 2 },
  };

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

    // Previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: lastDateOfPrevMonth - i,
        currentMonth: false,
        key: `prev-${lastDateOfPrevMonth - i}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
    }
    
    // Current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      days.push({
        date: i,
        currentMonth: true,
        key: `curr-${i}-${currentMonth}-${currentYear}`,
        hasEvent: i in eventsMap,
        eventCount: eventsMap[i as keyof typeof eventsMap]?.count,
        isToday,
      });
    }
    
    // Next month's days
    for (let i = 1; days.length < 42; i++) {
      days.push({
        date: i,
        currentMonth: false,
        key: `next-${i}-${currentMonth}-${currentYear}`,
        hasEvent: false,
      });
    }
    
    return days;
  }, [firstDayOfMonth, lastDateOfMonth, lastDateOfPrevMonth, currentMonth, currentYear, today]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  
  // Get current month name and year as a formatted string
  const currentMonthYear = useMemo(() => 
    `${monthNames[currentMonth]} ${currentYear}`,
  [currentMonth, currentYear, monthNames]);

  // Generate enhanced events for the selected day
  const getEventsForSelectedDay = () => {
    if (!selectedDay || !selectedDay.hasEvent || !selectedDay.currentMonth) {
      return [];
    }
    
    const dayEvents = eventsMap[selectedDay.date as keyof typeof eventsMap];
    if (!dayEvents) return [];
    
    // Enhanced event generation with more variety and realistic data
    const eventTypes = [
      { category: "Academic", title: "Faculty Meeting" },
      { category: "Workshop", title: "Research Workshop" },
      { category: "Social", title: "Campus Social Event" },
      { category: "Academic", title: "Department Conference" },
      { category: "Workshop", title: "Professional Development" },
      { category: "Social", title: "Student Organization Event" }
    ];
    
    const locations = [
      "Main Building, Room 101",
      "Science Building, Room 203",
      "Library Conference Room",
      "Auditorium",
      "Computer Lab, Room 405",
      "Student Center"
    ];
    
    return Array.from({ length: dayEvents.count }, (_, i) => {
      // Get a consistent but pseudo-random event type and location
      const eventTypeIndex = (selectedDay.date + i) % eventTypes.length;
      const locationIndex = (i + selectedDay.date * 2) % locations.length;
      const eventType = eventTypes[eventTypeIndex];
      const startHour = 8 + Math.floor(i / 2);
      const endHour = startHour + 1 + (i % 2);
      
      // Format times with AM/PM
      const startTime = `${startHour > 12 ? startHour - 12 : startHour}:${i % 2 === 0 ? '00' : '30'} ${startHour >= 12 ? 'PM' : 'AM'}`;
      const endTime = `${endHour > 12 ? endHour - 12 : endHour}:${i % 2 === 0 ? '30' : '00'} ${endHour >= 12 ? 'PM' : 'AM'}`;
      
      return {
        id: `event-${selectedDay.date}-${i}`,
        title: dayEvents.count > 1 ? `${eventType.title} ${i + 1}` : dayEvents.title,
        date: `${monthNames[currentMonth]} ${selectedDay.date}, ${currentYear}`,
        time: `${startTime} - ${endTime}`,
        location: locations[locationIndex],
        description: "This event provides an opportunity for faculty and staff to engage with important university matters, share ideas, and collaborate on academic initiatives.",
        organizer: i % 2 === 0 ? "Faculty of Science" : "Department of Education",
        capacity: `${60 + (i * 20)} seats`,
        facilities: ["Wi-Fi", "Projector", "Air Conditioning"],
        registrationStatus: i % 3 === 0 ? "Closed" : "Open",
        attendeeCount: `${30 + i * 5}/${60 + (i * 20)}`,
        registrationDeadline: `${monthNames[currentMonth]} ${Math.max(1, selectedDay.date - 2)}, ${currentYear}`,
        requirements: i % 2 === 0 ? "Please bring your university ID and laptop" : undefined,
        category: eventType.category
      };
    });
  };

  // Open event info modal with the selected event
  const handleEventClick = useCallback((event: EventDetails) => {
    setSelectedEvent(event);
    setEventInfoModalOpen(true);
  }, []);

  // Format selected date for display
  const selectedDateLabel = useMemo(() => {
    if (!selectedDay) return "";
    return `${monthNames[currentMonth]} ${selectedDay.date}, ${currentYear}`;
  }, [selectedDay, currentMonth, currentYear]);

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
    window.addEventListener('resize', handleResize);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty array ensures effect runs only once on mount

  // Only generate events when modal is actually open
  const eventsForSelectedDay = useMemo(() => {
    if (!modalOpen || !selectedDay) return [];
    return getEventsForSelectedDay();
  }, [modalOpen, selectedDay]);

  return (
    <div className="h-full flex flex-col max-w-full overflow-hidden p-2 sm:p-2">
      <h1 className="text-2xl sm:text-3xl font-normal leading-tight mb-4 sm:mb-6 px-2 sm:px-0">Events</h1>

      {/* Calendar - improved height and proportions with better responsiveness */}
      <div className="bg-white rounded-md shadow-md flex flex-col flex-1 p-3 sm:p-6 md:p-8">
        {/* Calendar header */}
        <div className="w-full grid grid-cols-3 items-center mb-3 sm:mb-5 relative">
          {/* Left: arrow, today, select */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 justify-start relative">
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
              className="h-8 sm:h-9 min-h-0 px-2 sm:px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Today"
              type="button"
              onClick={goToToday}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Today
            </motion.button>
            {/* Select component - hide on very small screens */}
            <div className="hidden xs:block">
              <Select>
                <SelectTrigger className="h-8 sm:h-9 min-h-0 px-2 sm:px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-sm sm:text-base font-semibold shadow-none hover:bg-gray-100 transition-colors w-[80px] sm:w-[104px]">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <input
                      className="w-full px-2 py-1 rounded border border-gray-300 text-base outline-none"
                      placeholder="Type here..."
                    />
                  </div>
                  <SelectItem value="option1" className="text-base">Option 1</SelectItem>
                  <SelectItem value="option2" className="text-base">Option 2</SelectItem>
                  <SelectItem value="option3" className="text-base">Option 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
                className="text-center text-base xs:text-lg sm:text-xl md:text-2xl font-medium leading-6 whitespace-nowrap"
              >
                {currentMonthYear}
              </motion.h2>
            </AnimatePresence>
          </div>
          {/* Right: month/week/day */}
          <div className="flex items-center justify-end">
            <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
              <motion.button 
                className="px-2 sm:px-4 rounded-sm min-w-[50px] sm:min-w-[64px] py-1 sm:py-2 text-sm sm:text-lg font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors"
                whileHover={{ backgroundColor: "#f3f4f6" }}
              >
                Month
              </motion.button>
            </div>
          </div>
        </div>

        {/* Calendar table */}
        <div className="flex flex-col w-full flex-1">
          {/* Calendar table header */}
          <div className="w-full px-0 pb-2 sm:pb-3">
            <div className="grid grid-cols-7 w-full">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div
                  key={day}
                  className="flex-1 text-xs xs:text-sm sm:text-base font-bold uppercase tracking-[1px] text-[#A8B2B9] text-center"
                >
                  {windowWidth === 0 ? day : // Initial render check
                    windowWidth < 400 ? day.charAt(0) : windowWidth < 640 ? day.slice(0, 1) : day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar table days with animation */}
          <div className="flex-1 flex flex-col w-full overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${currentMonth}-${currentYear}`}
                custom={direction}
                variants={calendarVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="grid grid-rows-6 grid-cols-7 w-full gap-1 xs:gap-1.5 sm:gap-2 md:gap-2.5 bg-white h-full"
              >
                {calendarDays.map((day, idx) => (
                  <motion.div
                    key={day.key}
                    data-idx={idx}
                    className={`relative border rounded-md flex flex-col p-1 xs:p-1.5 sm:p-2 md:p-3 text-sm xs:text-base sm:text-lg md:text-xl font-medium cursor-pointer transition-colors hover:bg-blue-50 active:bg-blue-100 hover:shadow-sm min-h-[40px] xs:min-h-[50px] sm:min-h-[60px] md:min-h-[75px]
                      ${day.currentMonth ? "text-gray-900 border-gray-200" : "text-gray-400 border-gray-100 bg-gray-50"}
                      ${day.isToday ? "border-blue-500 border-2" : ""}
                      ${day.hasEvent && day.currentMonth ? "bg-blue-50" : ""}
                    `}
                    onClick={() => {
                      setSelectedDay(day);
                      setModalOpen(true);
                    }}
                    initial={{ scale: 0.97, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      transition: { 
                        delay: Math.min(0.01 * idx, 0.3), // Cap maximum delay
                        duration: 0.12
                      }
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Date number (always shown) */}
                    <div className="flex justify-end items-start w-full mb-0.5 sm:mb-1 md:mb-2">
                      <span
                        className={`text-xs xs:text-sm sm:text-base md:text-lg ${
                          day.isToday ? "text-blue-600 font-bold" : ""
                        }`}
                      >
                        {day.date}
                      </span>
                    </div>

                    {/* Event indicators - ONLY SHOWN WHEN there are events */}
                    {day.hasEvent && day.currentMonth && day.eventCount && day.eventCount > 0 && (
                      <>
                        {/* Desktop/Tablet: Top-left calendar icon and count */}
                        <motion.div 
                          className="hidden sm:inline-flex items-center bg-blue-100 text-blue-700 px-1 sm:px-1.5 py-0.5 rounded-xl text-xs sm:text-sm md:text-base font-semibold absolute top-1 sm:top-2 left-1 sm:left-2"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            transition: { 
                              delay: Math.min(0.01 * idx + 0.1, 0.4),
                              type: "spring",
                              stiffness: 500,
                              damping: 15
                            }
                          }}
                        >
                          <CalendarClock size={14} className="mr-0.5 sm:mr-1" />
                          <span>{day.eventCount}</span>
                        </motion.div>
                        
                        {/* Mobile: Centered calendar icon */}
                        <motion.div 
                          className="sm:hidden flex-grow flex items-center justify-center"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: 1, 
                            opacity: 1,
                            transition: { 
                              delay: Math.min(0.01 * idx + 0.1, 0.4),
                              type: "spring",
                              stiffness: 500,
                              damping: 15
                            }
                          }}
                        >
                          <div className="inline-flex items-center bg-blue-100 text-blue-700 px-1 py-0.5 rounded-xl text-xs xs:text-sm font-semibold w-min">
                            <CalendarClock size={12} className="mr-0.5" />
                            <span>{day.eventCount}</span>
                          </div>
                        </motion.div>

                        {/* Desktop: "See event" text - hidden on mobile */}
                        <motion.div 
                          className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none"
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: 1,
                            transition: { 
                              delay: Math.min(0.01 * idx + 0.2, 0.5),
                              duration: 0.3
                            }
                          }}
                        >
                          <span className="text-blue-600 text-xs sm:text-sm md:text-base font-medium px-2 py-0.5 rounded pointer-events-auto translate-y-3">
                            {day.eventCount === 1 ? "See event" : "See events..."}
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
          <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 flex items-center bg-white border border-gray-300 rounded-full px-2 h-10 w-max shadow-md">
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

        {/* Events List Modal with proper events data */}
        <EventsListModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedDay ? 
            selectedDay.currentMonth 
              ? `Events on ${monthNames[currentMonth]} ${selectedDay.date}, ${currentYear}` 
              : `${selectedDay.date} ${monthNames[currentMonth]}, ${currentYear} (Outside current month)` 
            : ""
          }
          events={eventsForSelectedDay}
          onEventClick={handleEventClick}
        />

        {/* Event Info Modal */}
        <EventInfoModal
          isOpen={eventInfoModalOpen}
          onClose={() => setEventInfoModalOpen(false)}
          event={selectedEvent}
        />
      </div>
    </div>
  );
}
