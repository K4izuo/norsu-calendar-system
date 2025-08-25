import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  const upcomingEvents = [
    { title: "Orientation Day", date: "2025-09-01" },
    { title: "Midterm Exams", date: "2025-10-10" },
    { title: "University Week", date: "2025-11-15" },
    { title: "Christmas Party", date: "2025-12-20" },
    { title: "Final Exams", date: "2026-01-15" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-[1400px] flex flex-col min-h-screen">
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
        <div className="flex flex-1 flex-col lg:flex-row py-4 sm:py-8">
          {/* Sidebar */}
          <div className="w-full max-w-xs mx-auto lg:mx-8 bg-white rounded-lg shadow-md h-auto lg:h-[400px] flex flex-col p-4 sm:p-6 mb-6 lg:mb-0">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 text-center">Upcoming Events</h2>
            <ul className="flex flex-col gap-2 overflow-y-auto">
              {upcomingEvents.map((event, idx) => (
                <li key={idx} className="bg-gray-50 rounded px-3 py-2 shadow-sm border border-gray-100">
                  <div className="font-medium text-gray-800 text-sm">{event.title}</div>
                  <div className="text-xs text-gray-500">{event.date}</div>
                </li>
              ))}
            </ul>
          </div>
          {/* Main content */}
          <div className="flex-1 flex items-center justify-center px-2">
            <div className="text-gray-400 text-lg text-center w-full">
              Main Content Area
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}