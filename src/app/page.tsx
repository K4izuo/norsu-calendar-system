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
import { Calendar as CalendarIcon, Clock, Bell } from "lucide-react";
import { useMemo } from "react";

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

  // Calendar grid generation
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  // Get first day of the month (0=Sun, 6=Sat)
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Get last date of the month
  const lastDateOfMonth = new Date(year, month + 1, 0).getDate();
  // Get last date of previous month
  const lastDateOfPrevMonth = new Date(year, month, 0).getDate();

  // Sample events for demonstration (assuming events on day 15, 20, and 25)
  const eventsMap = {
    15: { title: "University Meeting", count: 1 },
    20: { title: "Faculty Conference", count: 3 },
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

  // Format month and year
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
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
            <h1 className="font-semibold text-lg text-gray-800 text-center truncate">
              NORSU Calendar System
            </h1>
            <p className="text-xs text-gray-500 text-center truncate">
              Negros Oriental State University
            </p>
          </div>
        </div>
        {/* Title (centered on sm+ only) */}
        <div className="hidden sm:flex flex-col items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-0">
          <h1 className="font-semibold text-xl md:text-2xl text-gray-800 text-center truncate">
            NORSU Calendar System
          </h1>
          <p className="text-sm md:text-base text-gray-500 text-center truncate">
            Negros Oriental State University
          </p>
        </div>
        {/* Auth buttons */}
        <div className="flex items-center space-x-1 flex-shrink-0 mt-2 sm:mt-0 w-full sm:w-auto justify-center sm:justify-end">
          <Button
            variant="ghost"
            className="cursor-pointer text-sm sm:text-base md:text-lg px-2"
            type="button"
            onClick={() => (window.location.href = "/auth/student/login")}
          >
            LOGIN
          </Button>
          <span className="text-gray-500 text-lg select-none xs:inline">|</span>
          <Button
            variant="ghost"
            className="cursor-pointer text-sm sm:text-base md:text-lg px-2"
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
              <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center">
                Upcoming Events
              </h2>
              <ul className="custom-scrollbar flex flex-col gap-2 overflow-y-auto flex-1">
                {upcomingEvents.map((event, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-50 rounded-md px-3 py-2 border border-gray-100"
                  >
                    <div className="font-medium text-gray-800 text-base">
                      {event.title}
                    </div>
                    <div className="text-sm text-gray-500">{event.date}</div>
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
                      <Button
                        className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                        aria-label="Previous"
                        type="button"
                      >
                        <span className="text-xl text-gray-500">&lt;</span>
                      </Button>
                      <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
                      <Button
                        className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                        aria-label="Next"
                        type="button"
                      >
                        <span className="text-xl text-gray-500">&gt;</span>
                      </Button>
                    </div>
                    {/* Today button */}
                    <Button
                      className="h-9 min-h-0 px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-sm font-semibold shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Today"
                      type="button"
                    >
                      Today
                    </Button>
                    {/* Select button replaced with Select component */}
                    <Select>
                      <SelectTrigger className="h-9 min-h-0 px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-sm font-semibold shadow-none hover:bg-gray-100 transition-colors w-[104px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Input field at the top of the dropdown */}
                        <div className="px-2 py-1 border-b border-gray-200 bg-white sticky top-0 z-10">
                          <input
                            className="w-full px-2 py-1 rounded border border-gray-300 text-sm outline-none"
                            placeholder="Type here..."
                          />
                        </div>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Center: calendar title */}
                  <div className="flex flex-col items-center">
                    <h2 className="text-center text-xl font-medium leading-6">
                      {currentMonthYear}
                    </h2>
                  </div>
                  {/* Right: month/week/day */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
                      <Button className="px-4 rounded-sm min-w-[64px] py-2 text-base font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors">
                        Month
                      </Button>
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
                            className="flex-1 text-sm font-bold uppercase tracking-[1px] text-[#A8B2B9] text-center"
                          >
                            {day}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Calendar table days - MODIFIED to use numbers with icons */}
                  <div className="flex flex-col px-[1px] sm:px-0 py-[0.5px] w-full flex-1 h-full min-h-0">
                    <div className="grid grid-rows-6 grid-cols-7 w-full h-full gap-1.5 sm:gap-2 bg-white flex-1">
                      {calendarDays.map((day, idx) => (
                        <div
                          key={day.key}
                          data-idx={idx}
                          className={`relative border rounded-md flex flex-col items-stretch p-2 text-sm font-medium cursor-pointer transition-colors hover:bg-blue-50 active:bg-blue-100 hover:shadow-sm min-h-[60px] sm:min-h-[70px]
                            ${day.currentMonth ? "text-gray-900 border-gray-200" : "text-gray-400 border-gray-100 bg-gray-50"}
                            ${day.isToday ? "border-blue-500 border-2" : ""}
                            ${day.hasEvent && day.currentMonth ? "bg-blue-50" : ""}
                          `}
                          onClick={() =>
                            alert(
                              `Show modal for ${
                                day.currentMonth ? "current" : "other"
                              } month day: ${day.date}`
                            )
                          }
                        >
                          {/* Date number in top right */}
                          <div className="flex justify-end w-full">
                            <span className={`${day.isToday ? "text-blue-600 font-bold" : ""}`}>
                              {day.date}
                            </span>
                          </div>

                          {/* Event indicators with icons */}
                          {day.hasEvent && day.currentMonth && (
                            <div className="mt-auto">
                              {day.eventCount === 1 && (
                                <div className="flex items-center text-blue-600 font-medium text-xs mt-1">
                                  <CalendarIcon size={12} className="mr-1" />
                                  <span>1 event</span>
                                </div>
                              )}
                              
                              {day.eventCount === 2 && (
                                <div className="flex items-center text-blue-600 font-medium text-xs mt-1">
                                  <Clock size={12} className="mr-1" />
                                  <span>2 events</span>
                                </div>
                              )}
                              
                              {day.eventCount && day.eventCount >= 3 && (
                                <div className="flex items-center text-blue-600 font-medium text-xs mt-1">
                                  <Bell size={12} className="mr-1" />
                                  <span>{day.eventCount} events</span>
                                </div>
                              )}
                            </div>
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
                      <span className="text-xl text-gray-500">&lt;</span>
                    </Button>
                    <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
                    <Button
                      className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Next"
                      type="button"
                    >
                      <span className="text-xl text-gray-500">&gt;</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
