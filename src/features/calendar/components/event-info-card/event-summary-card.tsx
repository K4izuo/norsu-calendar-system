import React from "react";
import { MapPin } from "lucide-react";
import { EventDetails } from "@/interface/user-props";
import { getStartedAgo, formatDate } from "./helpers";

interface EventSummaryCardProps {
  event: EventDetails;
}

export function EventSummaryCard({ event }: EventSummaryCardProps) {
  const asset = event.asset;
  const assetName = asset?.asset_name || "Not specified";
  const assetCapacity = asset?.capacity || "N/A";
  const capacityText = asset?.capacity ? `${assetCapacity} people` : "N/A";
  const startedAgoText = getStartedAgo(event.date, event.time_start);

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-4 sm:p-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="min-w-0 break-words text-base sm:text-lg capitalize font-medium">
              {event.title_name || "Event Title"}
            </h3>
          </div>
          <p className="text-sm text-gray-500 flex items-start gap-1.5 mt-1">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="min-w-0 break-words">
              {assetName}
              {startedAgoText && ` - ${startedAgoText}`}
            </span>
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-5 md:grid-cols-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Date</p>
            <p className="font-medium text-sm sm:text-base leading-snug break-words">{formatDate(event.date)}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Information Type</p>
            <p className="font-medium capitalize text-sm sm:text-base leading-snug break-words">{event.info_type}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Capacity</p>
            <p className="font-medium text-sm sm:text-base leading-snug break-words">{capacityText}</p>
          </div>
          <div className="min-w-0">
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium capitalize text-sm sm:text-base leading-snug break-words">
              {event.category === "other" && event.other_category ? event.other_category : event.category}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
