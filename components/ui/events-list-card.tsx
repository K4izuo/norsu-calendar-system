import React from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, User } from "lucide-react"
import type { EventCardsListProps } from "@/interface/user-props"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export const EventCardsList = React.memo(function EventCardsList({
  events,
  onEventClick,
  getStartedAgo,
  getStatus,
  getStatusColor,
}: EventCardsListProps) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {events.map((event, index) => {
        const reservation_time = `${event.time_start} - ${event.time_end}`
        const startedAgo = getStartedAgo(event.date, event.time_start, event.time_end)
        const status = getStatus(event)
        const reservedBy = event.reserve_by_user || "Unknown"
        const approvedBy = event.approved_by_user || "Unknown"
        const rejectedBy = event.declined_by_user || "Unknown"

        let tooltipText = ""
        if (status === "pending") tooltipText = `Reserved by: ${reservedBy}`
        else if (status === "approved") tooltipText = `Approved by: ${approvedBy}`
        else if (status === "rejected") tooltipText = `Rejected by: ${rejectedBy}`

        return (
          <div
            key={event.id || index}
            className="relative group cursor-pointer rounded-3xl bg-white border border-border p-6"
            onClick={() => onEventClick?.(event)}
            data-index={index}
          >
            {/* Image Section with rounded corners */}
            <div className="relative h-60 overflow-hidden rounded-3xl mb-6">
              <img
                src="https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=400&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/5 to-transparent" />
              
              {/* Title and Status Badge on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-end justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-white mb-1.5 drop-shadow-lg line-clamp-2">
                      {event.title_name}
                    </h3>
                    {startedAgo && (
                      <p className="text-sm text-white/95 drop-shadow-md font-medium">
                        {startedAgo}
                      </p>
                    )}
                  </div>
                  
                  {/* Status Badge */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(status)} font-semibold px-4 py-1.5 text-xs uppercase tracking-wide backdrop-blur-sm shadow-lg shrink-0`}
                        >
                          {status}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-popover text-popover-foreground border border-border"
                      >
                        {tooltipText}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            {/* Bottom Info Section */}
            <div className="flex items-start justify-between gap-6">
              {/* Left Side: Venue and Time */}
              <div className="grid grid-cols-2 gap-6 flex-1">
                {/* Venue */}
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">
                    Venue
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">
                      {event.asset?.asset_name}
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div>
                  <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">
                    Time
                  </p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="font-semibold text-gray-900 text-sm">
                      {reservation_time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Reserve By */}
              <div>
                <p className="text-gray-500 text-xs font-medium mb-2 uppercase tracking-wide">
                  Reserve By
                </p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600 shrink-0" />
                  <span className="font-semibold text-gray-900 text-sm">
                    {reservedBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
})