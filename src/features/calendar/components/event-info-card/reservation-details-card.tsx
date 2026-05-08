import React from "react";
import { NotebookPen, User } from "lucide-react";
import { EventDetails } from "@/interface/user-props";
import { formatTime } from "@/core/lib/utils";
import { formatDate, getStatusColor, getStatusIcon } from "./helpers";

interface ReservationDetailsCardProps {
  event: EventDetails;
  status: "PENDING" | "APPROVED" | "DECLINED";
}

export function ReservationDetailsCard({ event, status }: ReservationDetailsCardProps) {
  const eventRange = Number(event.range ?? 0);

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6 flex items-center">
        <NotebookPen className="text-gray-700 mr-2 h-5 w-5" />
        <h3 className="text-lg font-medium text-gray-700">Reservation Details</h3>
      </div>
      <div className="border-t border-gray-200" />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Reserved By</p>
            <p className="font-medium text-base">{event.reserve_by_user || "Unknown User"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex mt-1 items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(status)}`}>
                {getStatusIcon(status)}
                {status}
              </span>
              {status === "APPROVED" && event.approved_by_user_details && (
                <span className="text-base text-gray-600">
                  by: {event.approved_by_user_details.first_name} {event.approved_by_user_details.last_name}
                </span>
              )}
              {status === "DECLINED" && event.declined_by_user_details && (
                <span className="text-base text-gray-600">
                  by: {event.declined_by_user_details.first_name} {event.declined_by_user_details.last_name}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Day(s)</p>
            <p className="font-medium text-base">{`${eventRange} ${eventRange === 1 ? "day" : "days"}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Deadline</p>
            <p className="font-medium text-base">{formatDate(event.registration_deadline)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Time</p>
            <p className="font-medium text-base">{`${formatTime(event.time_start)} - ${formatTime(event.time_end)}`}</p>
          </div>
          {event.people_tag && event.people_tag.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Participants</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {event.people_tag.map((person, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 text-base font-medium text-gray-800">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
