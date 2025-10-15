import { UsersRound, Calendar } from "lucide-react";

export default function FacultyDashboardTab() {
  return (
    <div className="flex flex-col items-start self-stretch p-2 sm:p-2">
      {/* Dashboard Title */}
      <h1 className="text-[26px] font-normal text-gray-800 mb-6">Dashboard</h1>
      <div className="flex flex-col items-start gap-6 flex-1 self-stretch">
        {/* Card div */}
        <div className="flex gap-7 justify-center items-start flex-wrap">
          <div className="flex flex-row items-center rounded-md border-l-4 border-l-[#4E73DF] bg-white shadow-sm p-6 max-w-full min-h-[110px] gap-x-16">
            <div className="flex flex-col justify-center">
              <h2 className="text-xs font-semibold text-[#4E73DF] tracking-wide mb-2">
                TOTAL USERS
              </h2>
              <h1 className="text-2xl font-bold text-gray-700">3,000</h1>
            </div>
            <div className="flex items-center justify-center rounded-md">
              <UsersRound className="w-9 h-9 text-gray-500" />
            </div>
          </div>
          <div className="flex flex-row items-center rounded-md border-l-4 border-l-[#4edf88] bg-white shadow-sm p-6 max-w-full min-h-[110px] gap-x-16">
            <div className="flex flex-col justify-center">
              <h2 className="text-xs font-semibold text-[#4edf88] tracking-wide mb-2">
                TOTAL EVENTS
              </h2>
              <h1 className="text-2xl font-bold text-gray-700">3,000</h1>
            </div>
            <div className="flex items-center justify-center rounded-md">
              <Calendar className="w-9 h-9 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
