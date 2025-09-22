"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, MapPin, Users, Info, X, CalendarDays } from "lucide-react"

interface EventDetails {
  id: string
  title: string
  date: string
  time: string
  organizer: string
  location: string
  capacity: string
  facilities?: string[]
  registrationStatus: string
  attendeeCount: string
  registrationDeadline: string
  description: string
  requirements?: string
  category?: string
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  event?: EventDetails
  loading?: boolean // Add loading prop
}

export const EventInfoModal = React.memo(function EventInfoModal({ isOpen, onClose, event, loading = false }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

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

  return (
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
            className="relative max-w-[900px] max-h-[92vh] bg-white rounded-lg shadow-xl w-[94%] sm:w-full sm:mx-4 overflow-hidden"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transformOrigin: "center",
              willChange: "transform, opacity",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Sticky header with title and X button */}
            <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Event Information
                </h2>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Loading animation */}
            {loading || !event ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center justify-center h-[60vh] w-full"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{
                    scale: [0.8, 1.1, 0.95, 1],
                    opacity: [0.7, 1, 0.9, 1],
                    rotate: [0, 8, -8, 0],
                    boxShadow: [
                      "0 0 0px #3b82f6",
                      "0 0 24px #3b82f6",
                      "0 0 12px #3b82f6",
                      "0 0 0px #3b82f6"
                    ]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.6,
                    ease: "easeInOut"
                  }}
                  className="flex items-center justify-center rounded-full bg-blue-50 shadow-lg"
                  style={{ width: 90, height: 90 }}
                >
                  <CalendarDays className="h-16 w-16 text-blue-600 drop-shadow-lg" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0.3, scale: 1 }}
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.25, 1]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    ease: "easeInOut"
                  }}
                  className="absolute"
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    border: "4px solid #3b82f6",
                    filter: "blur(2px)"
                  }}
                />
              </motion.div>
            ) : (
              <div className="overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-4 sm:pt-6" style={{ maxHeight: "calc(80vh - 85px)" }}>
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Users className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-md font-medium text-gray-700">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Event Title</p>
                        <p className="font-medium">{event.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">{event.category || 'General'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{event.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Organizer</p>
                        <p className="font-medium">{event.organizer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Venue Information */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <MapPin className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-md font-medium text-gray-700">Venue Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{event.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium">{event.capacity}</p>
                      </div>
                      {event.facilities && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Facilities</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.facilities.map((facility, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Calendar className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-md font-medium text-gray-700">Registration Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.registrationStatus === 'Open' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.registrationStatus}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Current Attendees</p>
                        <p className="font-medium">{event.attendeeCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Registration Deadline</p>
                        <p className="font-medium">{event.registrationDeadline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                          <p className="font-medium">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Info className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-md font-medium text-gray-700">Additional Details</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="mt-1">{event.description}</p>
                      </div>
                      {event.requirements && (
                        <div>
                          <p className="text-sm text-gray-500">Requirements</p>
                          <p className="mt-1">{event.requirements}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
})