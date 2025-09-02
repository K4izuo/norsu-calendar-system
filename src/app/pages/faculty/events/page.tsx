"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

export default function FacultyEventsTab() {
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
    <div>
      <h1 className="text-3xl font-normal leading-[33.6px] mb-6">Events</h1>

      {/* Calendar */}
      <div className="bg-white rounded-md shadow-md flex flex-col items-start p-6 gap-8 relative">
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
            {/* Select component */}
            <Select>
              <SelectTrigger className="h-9 min-h-0 px-3 rounded-sm bg-white border border-gray-300 text-gray-700 text-xs font-semibold shadow-none hover:bg-gray-100 transition-colors w-[104px]">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
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
            <h2 className="text-center text-[16px] font-medium leading-4">
              {currentMonthYear}
            </h2>
          </div>
          {/* Right: month/week/day */}
          <div className="flex items-center justify-end">
            <div className="flex items-center bg-white border border-gray-300 rounded-sm overflow-hidden">
              <Button className="px-4 rounded-sm min-w-[64px] py-2 text-sm font-semibold text-gray-700 bg-white focus:outline-none hover:bg-gray-100 transition-colors">
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar table */}
        <div className="flex flex-col gap-[0.5px] w-full flex-1">
          {/* Calendar table header */}
          <div className="w-full px-0 pb-4">
            <div className="grid grid-cols-7 w-full">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <div
                  key={day}
                  className="flex-1 text-[10px] font-bold uppercase tracking-[1px] text-[#A8B2B9] text-center"
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar table days */}
          <div className="flex flex-col px-[1px] sm:px-0 py-[0.5px] w-full flex-1">
            <div
              className="grid min-h-[500px] grid-rows-6 grid-cols-7 w-full h-full gap-0.5 sm:gap-1 bg-white flex-1"
            >
              {calendarDays.map((day, idx) => (
                <div
                  key={day.key}
                  data-idx={idx}
                  className={`border rounded-sm border-[#e5e7eb] flex items-start justify-end px-2 pt-2 text-xs font-bold cursor-pointer transition-colors hover:bg-gray-100 active:bg-gray-200 hover:shadow-sm
                    ${day.currentMonth ? "text-black" : "text-gray-300"}
                  `}
                  onClick={() =>
                    alert(
                      `Selected: ${
                        day.currentMonth ? "current" : "other"
                      } month day: ${day.date}`
                    )
                  }
                >
                  {day.date}
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
  );
}
