"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { motion } from "framer-motion"
import { CalendarPlus, Clock, CalendarClock, Search, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { ReserveEventModal } from "@/features/reservations/components/reserve-event-modal"
import type { EventsListModalProps, EventDetails, ReservationAPIPayload, Reservation } from "@/interface/user-props"
import { Input } from "../../../shared/components/ui/input"
import { EventCardsList } from "@/features/calendar/components/events-list-card"
import { getRoleColors } from "@/shared/components/utils/role-colors"

type EventStatus = "pending" | "approved" | "decline"
type Role = "dean" | "staff" | "admin" | "public" | undefined

const getStartedAgo = (eventDate: string, eventTime: string): string | null => {
  if (!eventDate || !eventTime) return null;
  try {
    const [startTimeRaw] = eventTime.split("-");
    const startTime = startTimeRaw.trim();
    const eventStart = new Date(`${eventDate} ${startTime}`);
    if (isNaN(eventStart.getTime())) return null;

    const now = new Date();

    if (eventStart > now) {
      const isToday = eventStart.toDateString() === now.toDateString();

      if (isToday) {
        const hours = eventStart.getHours();
        const minutes = eventStart.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `Starts at ${displayHours}:${displayMinutes} ${ampm}`;
      } else {
        return "Upcoming";
      }
    }

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
  onNewReservation,
  userRole,
  userOffice,
}: EventsListModalProps & {
  showRecent: "upcoming" | "past" | "moved";
  setShowRecent: React.Dispatch<React.SetStateAction<"upcoming" | "past" | "moved">>;
  role?: Role;
  allReservations?: Reservation[];
  onNewReservation?: (reservation: Reservation) => void;
  userRole?: number;
  userOffice?: { oversight_vp_id: number | null };
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [reserveModalOpen, setReserveModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const roleLoadingColors = useMemo(() => getRoleColors(), []);

  // Filter events by search term and mode (past vs upcoming)
  const filteredEvents = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    // Filter by search term first
    const searchFiltered = events.filter(event =>
      event.title_name?.toLowerCase().includes(searchLower) ||
      event.people_tag?.some(tag => tag.toLowerCase().includes(searchLower))
    );

    if (showRecent === "past") {
      return searchFiltered.filter(event => event.date === eventDate && event.isFinished);
    } else if (showRecent === "moved") {
      // Show on the original date (where it was moved FROM)
      return searchFiltered.filter(event =>
        event.is_moved && (event.original_date ? event.original_date === eventDate : event.date === eventDate)
      );
    } else {
      // Show events currently scheduled for this date that are not finished
      return searchFiltered.filter(event => event.date === eventDate && !event.isFinished);
    }
  }, [events, searchTerm, showRecent, eventDate])

  // Check if the event date is in the past
  const isPastDate = useMemo(() => {
    if (!eventDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = new Date(eventDate);
    if (isNaN(checkDate.getTime())) return false;

    // For +08:00 timezone, standard parsing of YYYY-MM-DD (UTC) gives 08:00 local.
    // Resetting to 00:00 local aligns it with "today".
    checkDate.setHours(0, 0, 0, 0);

    return checkDate < today;
  }, [eventDate]);

  const getStatusColor = useCallback((status: EventStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      decline: "bg-destructive/20 text-destructive border-destructive/30",
    }
    return colors[status] || colors.pending
  }, [])

  const getStatus = useCallback((event: EventDetails): EventStatus => {
    if (!event.registration_status) return "pending"

    const status = event.registration_status.toLowerCase()
    if (status === "open") return "approved"
    if (status === "closed") return "decline"

    return status === "pending" || status === "approved" || status === "declined" ? (status as EventStatus) : "pending"
  }, [])

  const handleReserve = useCallback(() => setReserveModalOpen(true), [])
  const handleSubmitReservation = useCallback((formData: ReservationAPIPayload) => {
    setReserveModalOpen(false)
    onReserve?.(formData)
  }, [onReserve])

  const handleEventClick = useCallback((event: EventDetails) => {
    onEventClick?.(event, showRecent === "moved")
  }, [onEventClick, showRecent])

  const handleSelectChange = useCallback((value: string) => {
    setShowRecent(value as "upcoming" | "past" | "moved")
  }, [setShowRecent])

  useEffect(() => {
    if (isOpen) {
      setShowRecent(isPastDate ? "past" : "upcoming")
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen, setShowRecent, isPastDate])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1]
            }}
          />

          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{
              type: "tween",
              duration: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative max-w-216 bg-background rounded-2xl shadow-2xl w-[99%] sm:w-full sm:mx-4 overflow-hidden flex flex-col max-h-[88vh] border border-border transform-gpu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-card border-b border-border p-4 sm:p-6">
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
                    className="pl-10 h-11 bg-background border-border focus:border-primary focus:ring-primary/20 transition-all duration-90"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  {role && role !== 'public' && !isPastDate && (
                    <Button
                      onClick={handleReserve}
                      className="h-11 cursor-pointer px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                    >
                      <CalendarPlus className="w-4 h-4" />
                      Reserve Event
                    </Button>
                  )}
                  <Select
                    value={showRecent}
                    onValueChange={handleSelectChange}
                  >
                    <SelectTrigger className="h-11 cursor-pointer px-3 border border-gray-300 hover:bg-muted bg-transparent">
                      <div className="flex text-sm font-medium items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <SelectValue>
                          {showRecent === "past" ? "Past Events" : showRecent === "moved" ? "Moved Events" : "Upcoming Events"}
                        </SelectValue>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="upcoming">Upcoming Events</SelectItem>
                      <SelectItem className="cursor-pointer" value="past">Past Events</SelectItem>
                      <SelectItem className="cursor-pointer" value="moved">Moved Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <motion.div
                  className="flex items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <div
                      className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 animate-spin-loading ${roleLoadingColors.spinner}`}
                      style={{ willChange: "transform", transform: "translateZ(0)" }}
                    />
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
                    {showRecent === "past"
                      ? "No past events on this day"
                      : showRecent === "moved"
                        ? "No moved events on this day"
                        : "No upcoming events found"}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {showRecent === "past"
                      ? "No events have finished on this date yet."
                      : showRecent === "moved"
                        ? "No reservations have been moved to this date."
                        : searchTerm
                          ? "Try adjusting your search terms or browse all events."
                          : "No upcoming events scheduled for this date."}
                  </p>
                </div>
              )}

              {children}
            </div>
          </motion.div>
        </div>
      )}

      {reserveModalOpen && (
        <ReserveEventModal
          isOpen={reserveModalOpen}
          onClose={() => setReserveModalOpen(false)}
          onSubmit={handleSubmitReservation}
          eventDate={eventDate}
          onNewReservation={onNewReservation}
          userRole={userRole}
          userOffice={userOffice}
        />
      )}
    </>
  )
}
