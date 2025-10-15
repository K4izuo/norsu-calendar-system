"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus, Clock, CalendarClock, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
import { ReserveEventModal } from "@/components/modal/reserve-event-modal"
import type { EventsListModalProps, EventDetails, ReservationFormData } from "@/interface/faculty-events-props"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "../ui/input"
import { EventCardsList } from "@/components/events-ui/EventsCard"

// Simplified status types
type EventStatus = "pending" | "approved" | "rejected"
type Role = "student" | "faculty" | "staff" | "admin" | undefined

// Make this a regular function instead of using useCallback at module level
const getStartedAgo = (eventDate: string, eventTime: string): string | null => {
  if (!eventDate || !eventTime) return null;
  try {
    const [startTimeRaw] = eventTime.split("-");
    const startTime = startTimeRaw.trim();
    const eventStart = new Date(`${eventDate} ${startTime}`);
    if (isNaN(eventStart.getTime())) return null;

    const now = new Date();
    if (eventStart > now) return "Upcoming";

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
  // role,
}: EventsListModalProps & { showRecent: boolean; setShowRecent: React.Dispatch<React.SetStateAction<boolean>>; role?: Role }) {
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [recentLoading, setRecentLoading] = useState(false)
  const recentLoadingTimeout = useRef<NodeJS.Timeout | null>(null)

  // Filter events by search term and mode
  const filteredEvents = React.useMemo(() => {
    if (showRecent) {
      // Show only past events (finishedOn matches eventDate)
      return events.filter(
        event =>
          event.finishedOn === eventDate &&
          (
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.peopleTag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
          )
      )
    } else {
      // Show current events (date matches eventDate), filtered by search
      return events.filter(
        event =>
          event.date === eventDate &&
          (
            event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.peopleTag?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
    if (!event.registrationStatus) return "pending"

    const status = event.registrationStatus.toLowerCase()
    if (status === "open") return "approved"
    if (status === "closed") return "rejected"

    return status === "pending" || status === "approved" || status === "rejected" ? (status as EventStatus) : "pending"
  }

  const handleReserve = useCallback(() => setReserveModalOpen(true), [])
  const handleSubmitReservation = useCallback((formData: ReservationFormData) => {
    setReserveModalOpen(false)
    onReserve?.(formData)
  }, [onReserve])

  const handleEventClick = useCallback((event: EventDetails) => {
    onEventClick?.(event)
  }, [onEventClick])

  const handleRecentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (!recentLoading) {
      setRecentLoading(true)
      setShowRecent((r) => !r)
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none" onClick={onClose}>
            <motion.div
              className="absolute inset-0 bg-black/60 sm:backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0.1,
              }}
              className="relative max-w-[900px] bg-background rounded-2xl shadow-2xl w-[99%] sm:w-full sm:mx-4 overflow-hidden flex flex-col max-h-[88vh] border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-card border-b border-border/100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground text-balance">{title}</h2>
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
                      className="pl-10 h-11 bg-background border-border focus:border-primary focus:ring-primary/20"
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
                    <Button
                      variant="outline"
                      onClick={handleRecentClick}
                      disabled={recentLoading}
                      className="h-11 cursor-pointer px-6 border-border hover:bg-muted bg-transparent"
                    >
                      <Clock className="w-4 h-4" />
                      {showRecent ? "Current Events" : "Past Events"}
                    </Button>
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
                      {/* Spinner rotates */}
                      <motion.div
                        className="absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                      />
                      {/* Icon stays still */}
                      <CalendarClock className="absolute inset-0 m-auto h-7 w-7 text-blue-500" />
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
      />
    </>
  )
}
