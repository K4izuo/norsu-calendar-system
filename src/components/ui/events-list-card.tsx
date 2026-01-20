import React from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Clock, User, Tag } from "lucide-react"
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
    <div className="p-4 sm:p-6 space-y-6">
      {events.map((event, index) => {
        const reservation_time = `${event.time_start} - ${event.time_end}`
        const startedAgo = getStartedAgo(event.date, event.time_start, event.time_end)
        const status = getStatus(event)
        const reservedBy = event.reserve_by_user || "Unknown"
        const approvedBy = event.approved_by_user || "Unknown"
        const declinedBy = event.declined_by_user || "Unknown"

        let tooltipText = ""
        if (status === "pending") tooltipText = `Reserved by: ${reservedBy}`
        else if (status === "approved") tooltipText = `Approved by: ${approvedBy}`
        else if (status === "decline") tooltipText = `Declined by: ${declinedBy}`

        return (
          <div
            key={event.id || index}
            className="bg-white text-card-foreground border rounded-3xl overflow-hidden shadow w-full cursor-pointer"
            onClick={() => onEventClick?.(event)}
            data-index={index}
          >
            {/* Image Section with Blur Transition */}
            <div className="relative">
              {/* Main Image */}
              <div className="h-50 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&h=400&fit=crop"
                  alt={event.title_name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Blur Gradient Transition */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-b from-transparent via-white/30 to-white backdrop-blur-[0.4px]"></div>

              {/* Calendar Icon Badge (overlapping on left) */}
              <div className="absolute left-6 -bottom-7.5 z-10">
                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-4 border-white shadow-md">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-6 pt-8 pb-7 bg-white">
              {/* Event Name, Started Ago, and Status Badge */}
              <div className="mb-6 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {event.title_name}
                  </h3>
                  {startedAgo && (
                    <p className="text-sm text-gray-500">
                      {startedAgo}
                    </p>
                  )}
                </div>

                {/* Status Badge with Tooltip */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(status)} font-semibold px-3 py-1 text-xs uppercase tracking-wide shrink-0`}
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

              {/* Event Details Grid */}
              <div className="grid grid-cols-4 gap-4">
                {/* Venue */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase mb-1.5">Venue</span>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{event.asset?.asset_name}</span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase mb-1.5">Time</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{reservation_time}</span>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase mb-1.5">Category</span>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{event.category || "Uncategorized"}</span>
                  </div>
                </div>

                {/* Reserved By */}
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase mb-1.5">Reserved By</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{reservedBy}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
})