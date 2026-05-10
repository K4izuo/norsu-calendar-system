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
  const assetAminities = asset?.aminities;
  const startedAgoText = getStartedAgo(event.date, event.time_start);

  return (
    <div className="bg-white text-card-foreground border border-border rounded-lg">
      <div className="p-6">
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
