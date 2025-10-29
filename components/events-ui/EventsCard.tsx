import React from "react"
import { Badge } from "@/components/ui/badge"
import { CalendarClock, Clock, MapPin, User, Layers, FileText } from "lucide-react"
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
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {events.map((event, index) => {
        const startedAgo = getStartedAgo(event.date, event.time)
        const status = getStatus(event)
        const reservedBy = event.reservedBy || "Unknown"
        const approvedBy = event.approvedBy || "Unknown"
        const rejectedBy = event.rejectedBy || "Unknown"

        let tooltipText = ""
        if (status === "pending") tooltipText = `Reserved by: ${reservedBy}`
        else if (status === "approved") tooltipText = `Approved by: ${approvedBy}`
        else if (status === "rejected") tooltipText = `Rejected by: ${rejectedBy}`

        return (
          <div
            key={event.id || index}
            className="group bg-card border border-border/100 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:bg-card/80"
            onClick={() => onEventClick?.(event)}
            data-index={index}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors text-pretty">
                  {event.title}
                </h3>
                {startedAgo && (
                  <span className="ml-2 text-xs text-gray-600 font-semibold bg-gray-100 rounded px-2 py-0.5">
                    {startedAgo}
                  </span>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(status)} font-medium px-3 py-1 text-xs uppercase tracking-wide`}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center text-muted-foreground">
                <CalendarClock className="h-4 w-4 mr-3 text-primary" />
                <span className="text-base font-medium">{event.date}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="h-4 w-4 mr-3 text-primary" />
                <span className="text-base font-medium">{event.time}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-3 text-primary" />
                <span className="text-base font-medium truncate">{event.location}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <User className="h-4 w-4 mr-3 text-primary" />
                <span className="text-base font-medium">
                  {event.attendeeCount?.toString() || event.capacity} attendees
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Layers className="h-4 w-4 mr-3 text-primary" />
                <span className="text-sm font-medium">
                  {event.category || "General"}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <FileText className="h-4 w-4 mr-3 text-primary" />
                <span className="text-base font-medium">{event.infoType || "—"}</span>
              </div>
            </div>

            {event.peopleTag && event.peopleTag.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {event.peopleTag.map((tag, tagIndex) => (
                    <Badge
                      key={tagIndex}
                      variant="secondary"
                      className="text-sm bg-muted text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <p className="text-muted-foreground text-base leading-relaxed mb-4 line-clamp-2">
              {event.description}
            </p>

            <div className="flex justify-end">
              <span className="text-primary text-sm font-medium group-hover:underline">
                View details →
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
})