"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
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

  // Build calendar days (6 rows x 7 columns = 42 cells)
  const calendarDays = useMemo(() => {
    const days: {
      date: number;
      currentMonth: boolean;
      key: string;
    }[] = [];

    // Previous month's days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: lastDateOfPrevMonth - i,
        currentMonth: false,
        key: `prev-${lastDateOfPrevMonth - i}`,
      });
    }
    // Current month's days
    for (let i = 1; i <= lastDateOfMonth; i++) {
      days.push({
        date: i,
        currentMonth: true,
        key: `curr-${i}`,
      });
    }
    // Next month's days
    for (let i = 1; days.length < 42; i++) {
      days.push({
        date: i,
        currentMonth: false,
        key: `next-${i}`,
      });
    }
    return days;
  }, [firstDayOfMonth, lastDateOfMonth, lastDateOfPrevMonth]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <div className="w-full max-w-[1400px] flex flex-col flex-1 mx-auto">
        {/* Navbar */}
        <div className="bg-white px-4 sm:px-8 md:px-16 lg:px-24 xl:px-36 py-4 shadow-sm grid grid-cols-1 md:grid-cols-3 items-center gap-4">
          <div className="flex items-center justify-center md:justify-start">
            <Image 
              src="/images/norsu.png" 
              alt="Negros Oriental State University" 
              className="h-12 w-12 object-contain"
              width={64}
              height={64}
            />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="font-semibold text-lg sm:text-xl text-gray-800 text-center">
              NORSU Calendar System
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 text-center">
              Negros Oriental State University
            </p>
          </div>
          <div className="flex items-center justify-center md:justify-end space-x-1 mt-4 md:mt-0">
            <Button variant="ghost" className="cursor-pointer text-xs sm:text-sm md:text-base">LOGIN</Button>
            <span className="text-gray-300 text-lg select-none">|</span>
            <Button variant="ghost" className="cursor-pointer text-xs sm:text-sm md:text-base">REGISTER</Button>
          </div>
        </div>
        {/* Content area */}
        <div className="flex-1 flex justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-full sm:max-w-[98vw] md:max-w-[1306px] flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-[320px] h-[400px] lg:h-[502px] bg-white rounded-md shadow-md flex flex-col p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">Upcoming Events</h2>
              <ul className="custom-scrollbar flex flex-col gap-2 overflow-y-auto flex-1">
                {upcomingEvents.map((event, idx) => (
                  <li key={idx} className="bg-gray-50 rounded-md px-3 py-2 border border-gray-100">
                    <div className="font-medium text-gray-800 text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </li>
                ))}
              </ul>
            </div>
            {/* Main content */}
            <div className="flex-1 flex items-start justify-center">
              <div className="w-full bg-white rounded-md shadow-md flex flex-col items-start self-stretch p-6 gap-8 relative">
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
                        <span className="text-lg text-gray-500">&lt;</span>
                      </Button>
                      <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
                      <Button
                        className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                        aria-label="Next"
                        type="button"
                      >
                        <span className="text-lg text-gray-500">&gt;</span>
                      </Button>
                    </div>
                    {/* Today button */}
                    <Button
                      className="h-9 min-h-0 px-3 flex items-center justify-center rounded-sm bg-white border border-gray-300 text-gray-700 text-xs font-semibold shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Today"
                      type="button"
                    >
                      Today
                    </Button>
                    {/* Select button replaced with Select component */}
                    <Select>
                      <SelectTrigger className="h-9 min-h-0 px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-xs font-semibold shadow-none hover:bg-gray-100 transition-colors w-[104px]">
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
                    <h2 className="text-center text-[16px] font-medium leading-4">August 2025</h2>
                  </div>
                  {/* Right: month/week/day */}
                  <div className="flex items-center justify-end">
                    <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
                      <Button
                        className="px-4 rounded-sm min-w-[64px] py-2 text-sm font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors"
                      >
                        Month
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Calendar table */}
                <div className="flex flex-col items-start gap-[0.5px]">
                  {/* Calendar table header */}
                  <div className="w-full pt-[22px] pb-[18px]">
                    <div className="grid grid-cols-7 w-full">
                      {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                        <div
                          key={day}
                          className="flex-1 w-32 text-[10px] font-bold uppercase tracking-[1px] text-[#A8B2B9] text-right font-manrope pr-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Calendar table days */}
                  <div className="flex flex-col items-start px-[1px] py-[0.5px] self-stretch">
                    <div className="grid grid-rows-6 grid-cols-7 w-full gap-0.5 sm:gap-1 bg-white">
                      {calendarDays.map((day, idx) => (
                        <div
                          key={day.key}
                          data-idx={idx}
                          className={`border rounded-sm border-[#e5e7eb] h-16 flex items-start justify-end px-2 pt-2 text-xs font-bold cursor-pointer transition-colors hover:bg-gray-100 active:bg-gray-200 hover:shadow-sm
                            ${day.currentMonth ? "text-black" : "text-gray-300"}
                          `}
                          onClick={() => alert(`Show modal for ${day.currentMonth ? "current" : "other"} month day: ${day.date}`)}
                        >
                          {day.date}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Fixed arrow buttons group for mobile only, positioned at the bottom of the main calendar content */}
                <div className="sm:hidden">
                  <div
                    className="
                      absolute bottom-3 left-1/2 z-50
                      -translate-x-1/2
                      flex items-center bg-white border border-gray-300 rounded-sm px-2 h-9 w-max shadow-md
                    "
                  >
                    <Button
                      className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Previous"
                      type="button"
                    >
                      <span className="text-lg text-gray-500">&lt;</span>
                    </Button>
                    <span className="mx-1 h-5 w-px bg-gray-200 rounded"></span>
                    <Button
                      className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none shadow-none hover:bg-gray-100 transition-colors"
                      aria-label="Next"
                      type="button"
                    >
                      <span className="text-lg text-gray-500">&gt;</span>
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