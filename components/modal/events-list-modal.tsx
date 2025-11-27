"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus, Clock, CalendarClock, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
import { ReserveEventModal } from "@/components/modal/reserve-event-modal"
import type { EventsListModalProps, EventDetails, ReservationAPIPayload, Reservation } from "@/interface/user-props"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "../ui/input"
import { EventCardsList } from "@/components/ui/events-list-card"
import { getRoleColors } from "@/utils/role-colors"

// Simplified status types
type EventStatus = "pending" | "approved" | "rejected"
type Role = "dean" | "staff" | "admin" | "public" | undefined

// Make this a regular function instead of using useCallback at module level
const getStartedAgo = (eventDate: string, eventTime: string): string | null => {
  if (!eventDate || !eventTime) return null;
  try {
    const [startTimeRaw] = eventTime.split("-");
    const startTime = startTimeRaw.trim();
    const eventStart = new Date(`${eventDate} ${startTime}`);
    if (isNaN(eventStart.getTime())) return null;

    const now = new Date();

    // If event is in the future
    if (eventStart > now) {
      const diffMs = eventStart.getTime() - now.getTime();
      // const diffMins = Math.floor(diffMs / 60000);

      // If event is today but later
      const isToday = eventStart.toDateString() === now.toDateString();

      if (isToday) {
        // Format time to 12-hour format with AM/PM
        const hours = eventStart.getHours();
        const minutes = eventStart.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `Starts at ${displayHours}:${displayMinutes} ${ampm}`;
      } else {
        // Event is on a future date
        return "Upcoming";
      }
    }

    // Event has already started
    const diffMs = now.getTime() - eventStart.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Started just now";
    if (diffMins < 60) return `Started ${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Started ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Started ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } catch {
    return null;
  }
};

export function EventsListModal({
  isOpen,
  onClose,
  children,
  onReserve,
  title,
  events = [],
  onEventClick,
  isLoading = false,
  eventDate,
  showRecent,
  setShowRecent,
  role,
  allReservations,
  onNewReservation,
}: EventsListModalProps & {
  showRecent: boolean;
  setShowRecent: React.Dispatch<React.SetStateAction<boolean>>;
  role?: Role;
  allReservations?: Reservation[];
  onNewReservation?: (reservation: Reservation) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [recentLoading, setRecentLoading] = useState(false)
  const recentLoadingTimeout = useRef<NodeJS.Timeout | null>(null)

  // Get role-specific loading colors
  const roleLoadingColors = getRoleColors(role);

  // Filter events by search term and mode
  const filteredEvents = React.useMemo(() => {
    if (showRecent) {
      // Show only past events (finishedOn matches eventDate)
      return events.filter(
        event =>
          event.finished_on === eventDate &&
          (
            event.title_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.people_tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
      )
    } else {
      // Show current events (date matches eventDate), filtered by search
      return events.filter(
        event =>
          event.date === eventDate &&
          (
            event.title_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.people_tag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
      )
    }
  }, [events, searchTerm, showRecent, eventDate])

  const getStatusColor = (status: EventStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",   // Nice yellow
      approved: "bg-green-100 text-green-800 border-green-200",     // Nice green
      rejected: "bg-destructive/20 text-destructive border-destructive/30",
    }
    return colors[status] || colors.pending
  }

  const getStatus = (event: EventDetails): EventStatus => {
    if (!event.registration_status) return "pending"

    const status = event.registration_status.toLowerCase()
    if (status === "open") return "approved"
    if (status === "closed") return "rejected"

    return status === "pending" || status === "approved" || status === "rejected" ? (status as EventStatus) : "pending"
  }

  const handleReserve = useCallback(() => setReserveModalOpen(true), [])
  const handleSubmitReservation = useCallback((formData: ReservationAPIPayload) => {
    setReserveModalOpen(false)
    onReserve?.(formData)
  }, [onReserve])

  const handleEventClick = useCallback((event: EventDetails) => {
    onEventClick?.(event)
  }, [onEventClick])

  const handleSelectChange = useCallback((value: string) => {
    if (!recentLoading) {
      setRecentLoading(true)
      setShowRecent(value === "past")
      if (recentLoadingTimeout.current) clearTimeout(recentLoadingTimeout.current)
      recentLoadingTimeout.current = setTimeout(() => setRecentLoading(false), 1200)
    }
  }, [recentLoading, setShowRecent])

  useEffect(() => {
    if (isOpen) {
      setShowRecent(false) // Always show current events when modal opens
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      if (recentLoadingTimeout.current) clearTimeout(recentLoadingTimeout.current)
    }
  }, [isOpen, setShowRecent])

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none">
            <motion.div
              className="absolute inset-0 bg-black/60 sm:backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            {/* Modal content */}
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{
                type: "tween",
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative max-w-[864px] bg-background rounded-2xl shadow-2xl w-[99%] sm:w-full sm:mx-4 overflow-hidden flex flex-col max-h-[88vh] border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card border-b border-border/100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-2xl font-bold text-foreground text-balance">{title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="h-8 cursor-pointer w-8 p-0 rounded-full hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      className="pl-10 h-11 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all duration-[90ms]"
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReserve}
                      className="h-11 cursor-pointer px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Reserve Event
                    </Button>
                    <Select
                      value={showRecent ? "past" : "upcoming"}
                      onValueChange={handleSelectChange}
                      disabled={recentLoading}
                    >
                      <SelectTrigger className="h-11 cursor-pointer px-3 border border-gray-300 hover:bg-muted bg-transparent">
                        <div className="flex text-sm font-medium items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <SelectValue>
                            {showRecent ? "Past Events" : "Upcoming Events"}
                          </SelectValue>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem className="cursor-pointer" value="current">Upcoming Events</SelectItem>
                        <SelectItem className="cursor-pointer" value="past">Past Events</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {recentLoading || isLoading ? (
                  <motion.div
                    className="flex items-center justify-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-16 w-16 flex items-center justify-center">
                      {/* Spinner rotates with role-specific color */}
                      <motion.div
                        className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 ${roleLoadingColors.spinner}`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                      />
                      {/* Icon stays still with role-specific color */}
                      <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleLoadingColors.icon}`} />
                    </div>
                  </motion.div>
                ) : filteredEvents.length > 0 ? (
                  <EventCardsList
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                    getStartedAgo={getStartedAgo}
                    getStatus={getStatus}
                    getStatusColor={getStatusColor}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <CalendarClock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {showRecent
                        ? "There are no past events on this day"
                        : "No events found"}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {showRecent
                        ? "No past events have finished on this date."
                        : searchTerm
                          ? "Try adjusting your search terms or browse all events."
                          : "No current events scheduled for this date."}
                    </p>
                  </div>
                )}

                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ReserveEventModal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        onSubmit={handleSubmitReservation}
        eventDate={eventDate}
        onNewReservation={onNewReservation}
      />
    </>
  )
}
