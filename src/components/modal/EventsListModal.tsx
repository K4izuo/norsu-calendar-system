"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus, Clock, MapPin, User, CalendarClock, Layers, FileText, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReserveEventModal } from "@/components/modal/ReserveEventModal"
import type { EventsListModalProps, EventDetails } from "@/interface/faculty-events-props"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "../ui/input"

// Simplified status types
type EventStatus = "pending" | "approved" | "rejected"
type Role = "student" | "faculty" | "staff" | "admin" | undefined

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
  const handleSubmitReservation = useCallback((formData: any) => {
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

  const getLoadingColor = () => {
    switch (role) {
      case "student":
        return { spinner: "border-green-400", icon: "text-green-600" }
      case "faculty":
      case "staff":
        return { spinner: "border-blue-400", icon: "text-blue-600" }
      case "admin":
        return { spinner: "border-neutral-700", icon: "text-neutral-900" }
      default:
        return { spinner: "border-primary", icon: "text-primary" }
    }
  }
  const loadingColor = getLoadingColor()

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
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                duration: 0.4,
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
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    {filteredEvents.map((event, index) => {
                      const status = getStatus(event)
                      const reservedBy = event.reservedBy || "Unknown"
                      const approvedBy = event.approvedBy || "Unknown"
                      const rejectedBy = event.rejectedBy || "Unknown"

                      let tooltipText = ""
                      if (status === "pending") {
                        tooltipText = `Reserved by: ${reservedBy}`
                      } else if (status === "approved") {
                        tooltipText = `Approved by: ${approvedBy}`
                      } else if (status === "rejected") {
                        tooltipText = `Rejected by: ${rejectedBy}`
                      }

                      return (
                        <div
                          key={event.id}
                          className="group bg-card border border-border/100 rounded-xl p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:bg-card/80"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors text-pretty">
                              {event.title}
                            </h3>
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
                                {event.attendeeCount || event.capacity} attendees
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
