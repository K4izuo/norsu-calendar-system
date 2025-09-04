"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Clock } from "lucide-react";
import { useMemo, useState } from "react";
import { EventsListModal } from "@/components/modal/public-events/EventsListModal";

export default function FacultyEventsTab() {
  // Calendar grid generation logic remains the same
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{
    date: number;
    currentMonth: boolean;
    key: string;
    hasEvent: boolean;
    eventCount?: number;
    isToday?: boolean;
  } | null>(null);

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
        key: `prev-${lastDateOfPrevMonth - i}`,
        hasEvent: false,
      });
    }
    // Current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      const isToday = i === today.getDate() && month === today.getMonth();
      days.push({
        date: i,
        currentMonth: true,
        key: `curr-${i}`,
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
        key: `next-${i}`,
        hasEvent: false,
      });
    }
    return days;
  }, [firstDayOfMonth, lastDateOfMonth, lastDateOfPrevMonth]);

  const monthNames = [
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
  ];
  const currentMonthYear = `${monthNames[month]} ${year}`;

  // Generate events for the selected day
  const getEventsForSelectedDay = () => {
    if (!selectedDay || !selectedDay.hasEvent || !selectedDay.currentMonth) {
      return [];
    }
    
    const dayEvents = eventsMap[selectedDay.date as keyof typeof eventsMap];
    if (!dayEvents) return [];
    
    return Array.from({ length: dayEvents.count }, (_, i) => ({
      id: i,
      title: dayEvents.count > 1 ? `${dayEvents.title} ${i + 1}` : dayEvents.title,
      time: "10:00 AM",
      location: "Main Hall",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies."
    }));
  };

  // Format selected date for display
  const selectedDateLabel = useMemo(() => {
    if (!selectedDay) return "";
    return `${monthNames[month]} ${selectedDay.date}, ${year}`;
  }, [selectedDay, month, year]);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-3xl font-normal leading-[33.6px] mb-6">Events</h1>

      {/* Calendar - improved height and proportions */}
      <div className="bg-white rounded-md shadow-md flex flex-col flex-1 p-6 sm:p-8">
        {/* Calendar header */}
        <div className="w-full grid grid-cols-3 items-center mb-5 relative">
          {/* Left: arrow, today, select */}
          <div className="flex items-center gap-2.5 justify-start relative">
            {/* Arrow buttons group for desktop/tablet */}
            <div className="hidden sm:flex items-center bg-white border border-gray-300 rounded-sm px-2 h-9 w-max">
              <Button
                className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                aria-label="Previous"
                type="button"
              >
                <span className="text-2xl text-gray-500">&lt;</span>
              </Button>
              <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
              <Button
                className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                aria-label="Next"
                type="button"
              >
                <span className="text-2xl text-gray-500">&gt;</span>
              </Button>
            </div>
            {/* Today button */}
            <Button
              className="h-9 min-h-0 px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-base font-semibold shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Today"
              type="button"
            >
              Today
            </Button>
            {/* Select component */}
            <Select>
              <SelectTrigger className="h-9 min-h-0 px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-base font-semibold shadow-none hover:bg-gray-100 transition-colors w-[104px]">
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
          {/* Center: calendar title */}
          <div className="flex flex-col items-center">
            <h2 className="text-center text-2xl font-medium leading-6">
              {currentMonthYear}
            </h2>
          </div>
          {/* Right: month/week/day */}
          <div className="flex items-center justify-end">
            <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
              <Button className="px-4 rounded-sm min-w-[64px] py-2 text-lg font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors">
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar table */}
        <div className="flex flex-col w-full flex-1">
          {/* Calendar table header */}
          <div className="w-full px-0 pb-3">
            <div className="grid grid-cols-7 w-full">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div
                  key={day}
                  className="flex-1 text-base font-bold uppercase tracking-[1px] text-[#A8B2B9] text-center"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar table days - improved proportions */}
          <div className="flex-1 flex flex-col w-full">
            <div className="grid grid-rows-6 grid-cols-7 w-full gap-1.5 sm:gap-2 md:gap-2.5 bg-white h-full">
              {calendarDays.map((day, idx) => (
                <div
                  key={day.key}
                  data-idx={idx}
                  className={`relative border rounded-md flex flex-col p-2 md:p-3 text-lg md:text-xl font-medium cursor-pointer transition-colors hover:bg-blue-50 active:bg-blue-100 hover:shadow-sm min-h-[60px] sm:min-h-[70px] md:min-h-[80px]
                    ${day.currentMonth ? "text-gray-900 border-gray-200" : "text-gray-400 border-gray-100 bg-gray-50"}
                    ${day.isToday ? "border-blue-500 border-2" : ""}
                    ${day.hasEvent && day.currentMonth ? "bg-blue-50" : ""}
                  `}
                  onClick={() => {
                    setSelectedDay(day);
                    setModalOpen(true);
                  }}
                >
                  {/* Date number (always shown) */}
                  <div className="flex justify-end items-start w-full mb-2">
                    <span
                      className={`text-lg md:text-xl ${
                        day.isToday ? "text-blue-600 font-bold" : ""
                      }`}
                    >
                      {day.date}
                    </span>
                  </div>

                  {/* Event indicators - ONLY SHOWN WHEN there are events */}
                  {day.hasEvent && day.currentMonth && day.eventCount && day.eventCount > 0 && (
                    <>
                      {/* Desktop/Laptop: Top-left calendar icon and count */}
                      <div className="hidden md:inline-flex items-center bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-xl text-lg md:text-xl font-semibold absolute top-2 left-2">
                        <CalendarClock size={18} className="mr-1" />
                        <span>{day.eventCount}</span>
                      </div>
                      
                      {/* Mobile: Centered calendar icon */}
                      <div className="md:hidden flex-grow flex items-center justify-center">
                        <div className="inline-flex items-center bg-blue-100 text-blue-700 px-1 py-1 rounded-xl text-base font-semibold w-min">
                          <CalendarClock size={14} className="mr-0.5" />
                          <span>{day.eventCount}</span>
                        </div>
                      </div>

                      {/* Desktop/Laptop: "See event" or "See events..." text */}
                      <div className="absolute inset-0 hidden md:flex items-center justify-center pointer-events-none">
                        <span className="text-blue-600 text-sm md:text-base font-medium px-2 py-0.5 rounded pointer-events-auto translate-y-3">
                          {day.eventCount === 1 ? "See event" : "See events..."}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed arrow buttons group for mobile only */}
        <div className="sm:hidden">
          <div className="absolute bottom-3 left-1/2 z-50 -translate-x-1/2 flex items-center bg-white border border-gray-300 rounded-sm px-2 h-9 w-max shadow-md">
            <Button
              className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Previous"
              type="button"
            >
              <span className="text-2xl text-gray-500">&lt;</span>
            </Button>
            <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
            <Button
              className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
              aria-label="Next"
              type="button"
            >
              <span className="text-2xl text-gray-500">&gt;</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Events List Modal */}
      <EventsListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onReserve={() => console.log("Reserve event clicked")}
        title={selectedDay ? 
          selectedDay.currentMonth 
            ? `Events on ${monthNames[month]} ${selectedDay.date}, ${year}` 
            : `${selectedDay.date} ${monthNames[month]}, ${year} (Outside current month)` 
          : ""
        }
      >
        {selectedDay && (
          <div className="space-y-6">
            {selectedDay.isToday && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Today
              </span>
            )}
            
            {/* Event cards */}
            {selectedDay.hasEvent && selectedDay.currentMonth ? (
              <div className="space-y-4">
                {getEventsForSelectedDay().map((event) => (
                  <div 
                    key={event.id} 
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="font-medium text-lg text-gray-800">{event.title}</h3>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1.5" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1.5">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p className="text-gray-600 mt-3 text-sm">
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <CalendarClock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 text-lg">No events scheduled for this date.</p>
                {!selectedDay.currentMonth && (
                  <p className="text-gray-400 text-sm mt-1">This date is outside the current month.</p>
                )}
              </div>
            )}

            {/* <div className="flex sticky bottom-0 z-10 justify-end border-b border-gray-200 bg-white">
              <Button 
                className="px-4"
                onClick={() => setModalOpen(false)}
              >
                Close
              </Button>
            </div> */}
          </div>
        )}
      </EventsListModal>
    </div>
  );
}
