"use client";

interface UpcomingEventsSidebarProps {
  loading: boolean;
  error: string | null;
  upcomingEvents: { title: string; date: string }[];
}

export default function UpcomingEventsSidebar({ loading, error, upcomingEvents }: UpcomingEventsSidebarProps) {
  return (
    <div className="w-full text-card-foreground border lg:w-[320px] bg-white rounded-md shadow-xs relative lg:h-full">
      <div className="flex flex-col p-4 sm:p-4 w-full lg:absolute lg:inset-0">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 text-center shrink-0">
          Upcoming Events
        </h2>

        {loading && (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="text-gray-500">Loading events...</div>
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="text-red-500 text-center">
              <p className="font-semibold">Error loading events</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {upcomingEvents.length > 0 ? (
              <ul className="custom-scrollbar flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
                {upcomingEvents.map((event, idx) => (
                  <li
                    key={idx}
                    className="bg-gray-50 rounded-md px-3 py-2 border border-gray-100 shrink-0"
                  >
                    <div className="font-medium text-gray-800 text-sm">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-0">
                <div className="text-gray-500 text-center">
                  <p className="font-semibold">No upcoming events</p>
                  <p className="text-sm">Check back later for new events</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
