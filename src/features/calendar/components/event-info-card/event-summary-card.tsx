"use client";

import React, { useState } from "react";
import { MapPin, GripVertical, MoveRight } from "lucide-react";
import { EventDetails } from "@/interface/user-props";
import { UserRole } from "@/shared/components/utils/role-colors";
import { getStartedAgo, formatDate } from "./helpers";

interface EventSummaryCardProps {
  event: EventDetails;
  role?: UserRole;
  status: "PENDING" | "APPROVED" | "DECLINED";
  onMoveReservation: () => void;
}

export function EventSummaryCard({ event, role, status, onMoveReservation }: EventSummaryCardProps) {
  const [showDotsMenu, setShowDotsMenu] = useState(false);

  const asset = event.asset;
  const assetName = asset?.asset_name || "Not specified";
  const assetCapacity = asset?.capacity || "N/A";
  const assetAminities = asset?.aminities;
  const startedAgoText = getStartedAgo(event.date, event.time_start);

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg capitalize font-medium">{event.title_name || "Event Title"}</h3>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
              <MapPin className="h-4 w-4" />
              {assetName}
              {startedAgoText && ` - ${startedAgoText}`}
            </p>
          </div>
          {role && role !== "public" && status === "APPROVED" && (
            <div className="relative ml-2">
              <button
                onClick={() => setShowDotsMenu(prev => !prev)}
                className="p-1.5 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                aria-label="More options"
              >
                <GripVertical className="h-5 w-5 text-gray-500" />
              </button>
              {showDotsMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowDotsMenu(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <button
                      onClick={() => { setShowDotsMenu(false); onMoveReservation(); }}
                      className="flex cursor-pointer items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                      <MoveRight className="h-4 w-4" />
                      Move Reservation
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-base">{formatDate(event.date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Information Type</p>
            <p className="font-medium capitalize text-base">{event.info_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="font-medium text-base">{assetCapacity} people</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium capitalize text-base">
              {event.category === "other" && event.other_category ? event.other_category : event.category}
            </p>
          </div>
          {assetAminities && assetAminities.length > 0 && (
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <p className="text-sm text-gray-500 mb-2">Venue Facilities</p>
              <div className="flex flex-wrap gap-2">
                {assetAminities.map((facility, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent">
                    {facility}
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
