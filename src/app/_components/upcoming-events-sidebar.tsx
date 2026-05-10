"use client";

import { memo } from "react";
import { formatDate } from "@/features/calendar/components/event-info-card/helpers";
import { formatEventTimeRange } from "@/features/calendar/utils/timezone-utils";
import type { EventDetails } from "@/interface/user-props";

interface UpcomingEventsSidebarProps {
  loading: boolean;
  error: string | null;
  upcomingEvents: EventDetails[];
  onEventClick: (event: EventDetails) => void;
}

function UpcomingEventsSidebar({ loading, error, upcomingEvents, onEventClick }: UpcomingEventsSidebarProps) {
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
                {upcomingEvents.map(event => (
                  <li
                    key={event.id}
                    className="shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() => onEventClick(event)}
                      className="landing-event-list-item w-full min-w-0 bg-gray-50 rounded-md px-3 py-2 border border-gray-300/70 text-left cursor-pointer transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      aria-label={`View details for ${event.title_name} on ${event.date}`}
                      title={event.title_name}
                    >
                      <div className="truncate font-medium text-gray-800 text-sm">{event.title_name}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                        <span>{formatDate(event.date)}</span>
                        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gray-400" />
                        <span>{formatEventTimeRange(event.time_start, event.time_end)}</span>
                      </div>
                    </button>
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

export default memo(UpcomingEventsSidebar);
