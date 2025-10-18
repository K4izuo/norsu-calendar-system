"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { User } from "lucide-react";
import { useRole } from "@/contexts/user-role";

export default function AuthRegisterPage() {
  const router = useRouter();
  const { setRole } = useRole();

  // Updated navigation function without query params
  const navigateToRegistration = (path: string, role: "student" | "faculty" | "staff") => {
    setRole(role); // Set role in context
    router.push(path); // Navigate without query param
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 flex flex-col items-center">
        <div className="flex items-center gap-3">
          <Image
            src="/images/norsu.png"
            alt="Negros Oriental State University"
            className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
            width={48}
            height={48}
            priority
          />
          <h1 className="font-semibold text-lg sm:text-2xl md:text-3xl text-gray-800 truncate">
            NORSU Calendar System
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex justify-center items-center px-2">
        <section className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-4xl flex flex-col">
          <div className="flex flex-col items-center mb-5">
            <div className="flex items-center">
              <User className="h-7 w-7 sm:h-8 sm:w-8 text-gray-500 mr-2 sm:mr-3" />
              <h2 className="text-center text-gray-700 text-lg sm:text-2xl font-semibold">
                SELECT USER TO REGISTER
              </h2>
            </div>
          </div>
          <hr className="border-t border-gray-200 mb-6" />

          {/* User Role Cards */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-stretch w-full">
            {/* Student Card */}
            <div
              tabIndex={0}
              role="button"
              className="bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center px-6 py-6 sm:px-10 sm:py-8 w-full sm:w-72 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-green-400 group cursor-pointer outline-none"
              onClick={() => navigateToRegistration("/auth/student/register", "student")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToRegistration("/auth/student/register", "student");
                }
              }}
            >
              <User className="h-7 w-7 sm:h-8 sm:w-8 text-green-500 mb-3 group-hover:text-green-600 transition-colors duration-200" />
              <span className="font-bold text-base sm:text-xl text-gray-800 mb-2 group-hover:text-green-600 transition-colors duration-200">
                Student
              </span>
              <span className="text-sm sm:text-base text-gray-500 text-center mt-2">
                Access your calendar and events.
              </span>
            </div>
            {/* Faculty Card */}
            <div
              tabIndex={0}
              role="button"
              className="bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center px-6 py-6 sm:px-10 sm:py-8 w-full sm:w-72 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 group cursor-pointer outline-none"
              onClick={() => navigateToRegistration("/auth/faculty/register", "faculty")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToRegistration("/auth/faculty/register", "faculty");
                }
              }}
            >
              <User className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500 mb-3 group-hover:text-blue-600 transition-colors duration-200" />
              <span className="font-bold text-base sm:text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                Faculty
              </span>
              <span className="text-sm sm:text-base text-gray-500 text-center mt-2">
                Manage schedules and activities.
              </span>
            </div>
            {/* Staff Card */}
            <div
              tabIndex={0}
              role="button"
              className="bg-white border border-gray-200 rounded-xl shadow-md flex flex-col items-center px-6 py-6 sm:px-10 sm:py-8 w-full sm:w-72 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-yellow-400 group cursor-pointer outline-none"
              onClick={() => navigateToRegistration("/auth/staff/register", "staff")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigateToRegistration("/auth/staff/register", "staff");
                }
              }}
            >
              <User className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-500 mb-3 group-hover:text-yellow-600 transition-colors duration-200" />
              <span className="font-bold text-base sm:text-xl text-gray-800 mb-2 group-hover:text-yellow-600 transition-colors duration-200">
                Staff
              </span>
              <span className="text-sm sm:text-base text-gray-500 text-center mt-2">
                Organize and support campus operations.
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
