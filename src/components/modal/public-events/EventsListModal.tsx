"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus, Clock, MapPin, User, CalendarClock, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReserveEventModal } from "@/components/modal/ReserveEventModal"
import toast from "react-hot-toast"
import { EventDetails } from "@/types/faculty-events-details" 

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  onReserve?: (formData?: any) => void
  title?: string
  events?: EventDetails[]
  onEventClick?: (event: EventDetails) => void
}

export const EventsListModal = React.memo(function EventsListModal({ 
  isOpen, 
  onClose, 
  children, 
  onReserve, 
  title, 
  events = [], 
  onEventClick 
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  // State to control the ReserveEventModal
  const [reserveModalOpen, setReserveModalOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Updated to open the ReserveEventModal
  const handleReserve = () => {
    setReserveModalOpen(true)
  }

  // Handle submission from the ReserveEventModal
  const handleSubmitReservation = (formData: any) => {
    // Close the reserve modal
    setReserveModalOpen(false)
    
    // Call the onReserve prop with the form data
    if (onReserve) {
      onReserve(formData)
    }
  }

  const handleEventClick = (event: EventDetails) => {
    if (onEventClick) {
      onEventClick(event)
    }
  }

  // Get category badge color
  const getCategoryColor = (category?: string) => {
    if (!category) return "bg-gray-100"
    
    switch(category.toLowerCase()) {
      case 'academic':
        return "bg-blue-100 text-blue-800"
      case 'social':
        return "bg-green-100 text-green-800"
      case 'workshop':
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none"
            onClick={onClose}
          >
            {/* Animated backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1]
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
                ease: [0.22, 1, 0.36, 1]
              }}
              className="relative max-w-[1400px] max-h-[92vh] bg-white rounded-lg shadow-md w-[96%] sm:w-full sm:mx-4 overflow-hidden"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                transformOrigin: "center",
                willChange: "transform, opacity",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Sticky header with title and Reserve Event button */}
              <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 break-words">
                    {title}
                  </h2>
                  <div className="flex items-center">
                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        handleReserve();
                      }}
                      className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Reserve Event
                    </Button>
                  </div>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(80vh - 85px)" }}>
                {/* Table view for large screens */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-separate border-spacing-0">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="h-16 text-left pl-6 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[25%]">
                          Event Name
                        </th>
                        <th className="h-16 text-left pl-2 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[12%]">
                          Category
                        </th>
                        <th className="h-16 text-left pl-2 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[12%]">
                          Date
                        </th>
                        <th className="h-16 text-left pl-2 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[12%]">
                          Time
                        </th>
                        <th className="h-16 text-left pl-2 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[20%]">
                          Location
                        </th>
                        <th className="h-16 text-left pl-2 pr-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[10%]">
                          Capacity
                        </th>
                        <th className="h-16 text-right pl-2 pr-6 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-[9%]">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.length > 0 ? events.map((event, index) => (
                        <tr 
                          key={event.id} 
                          className={`hover:bg-gray-50 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                          onClick={() => handleEventClick(event)}
                        >
                          <td className="h-20 pl-6 pr-2 border-b border-gray-100">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center bg-blue-100">
                                <CalendarClock className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="ml-4 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{event.title}</div>
                                <div className="text-sm text-gray-500 truncate mt-0.5">{event.organizer}</div>
                              </div>
                            </div>
                          </td>
                          <td className="h-20 pl-2 pr-2 border-b border-gray-100 align-middle">
                            <Badge variant="secondary" className={`${getCategoryColor(event.category)} text-sm py-1 px-3`}>
                              {event.category || "General"}
                            </Badge>
                          </td>
                          <td className="h-20 pl-2 pr-2 border-b border-gray-100 text-sm text-gray-500 align-middle">{event.date}</td>
                          <td className="h-20 pl-2 pr-2 border-b border-gray-100 text-sm text-gray-500 align-middle">{event.time}</td>
                          <td className="h-20 pl-2 pr-2 border-b border-gray-100 align-middle">
                            <span className="text-sm text-gray-900 truncate block max-w-full">
                              {event.location}
                            </span>
                          </td>
                          <td className="h-20 pl-2 pr-2 border-b border-gray-100 text-sm text-gray-900 align-middle">{event.attendeeCount || event.capacity}</td>
                          <td className="h-20 pl-2 pr-6 border-b border-gray-100 text-sm font-medium text-right align-middle">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEventClick(event);
                              }}
                              className="inline-flex items-center justify-center h-9 w-9"
                            >
                              <InfoIcon className="h-5 w-5 text-blue-600" />
                            </Button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={7} className="h-40 text-center text-gray-500 border-b border-gray-100">
                            <div className="flex flex-col items-center justify-center h-full">
                              <CalendarClock className="h-10 w-10 text-gray-300 mb-3" />
                              <p className="text-base">No events scheduled for this date</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Card view for smaller screens - improved for mobile */}
                <div className="lg:hidden space-y-4 p-3 sm:p-4">
                  {events.length > 0 ? events.map((event) => (
                    <motion.div 
                      key={event.id} 
                      className="p-3 sm:p-4 rounded-md border border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: {
                          duration: 0.3
                        }
                      }}
                      whileHover={{ 
                        scale: 1.01,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-medium text-base sm:text-lg text-gray-800">{event.title}</h3>
                          <div className="flex items-center">
                            <Badge variant="secondary" className={getCategoryColor(event.category)}>
                              {event.category || "General"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="flex items-center text-gray-600 text-sm">
                            <CalendarClock className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{event.date}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{event.time}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <User className="h-4 w-4 mr-1.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate">{event.attendeeCount || event.capacity}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mt-2 sm:mt-3 text-xs sm:text-sm line-clamp-2">
                          {event.description}
                        </p>
                        
                        <div className="mt-3 flex justify-between items-center">
                          <div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReserve();
                                toast.success(`Reserving for: ${event.title}`);
                              }}
                            >
                              <CalendarPlus className="h-4 w-4 mr-1.5" />
                              Reserve
                            </Button>
                          </div>
                          <div className="text-blue-600 text-xs sm:text-sm hover:text-blue-800 hover:underline">
                            View details →
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-10">
                      <CalendarClock className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                      <p className="mt-1 text-sm text-gray-500">No events scheduled for this date.</p>
                    </div>
                  )}
                </div>
                
                {/* If there are no events to render or we have children passed, render children */}
                {(!events || events.length === 0 || children) && children}
              </div>

              {/* Sticky footer with Close button */}
              <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 pt-4 sm:pt-6 border-t border-gray-100 flex justify-end">
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  aria-label="Close"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ReserveEventModal - will be shown when reserveModalOpen is true */}
      <ReserveEventModal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        onSubmit={handleSubmitReservation}
      />
    </>
  )
})
