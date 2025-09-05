"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ReserveEventModal } from "@/components/modal/ReserveEventModal"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  onReserve?: (formData?: any) => void
  title?: string
}

export function EventsListModal({ isOpen, onClose, children, onReserve, title }: ModalProps) {
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

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
            onClick={onClose}
          >
            {/* Animated backdrop with faster but still smooth fade */}
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

            {/* Modal content with faster but still smooth animation */}
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
              className="relative max-w-[1300px] max-h-[90vh] bg-white rounded-lg shadow-xl w-full mx-4 overflow-hidden"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                transformOrigin: "center",
                willChange: "transform, opacity",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Sticky header with title and Reserve Event button */}
              <div className="sticky top-0 bg-white z-10 p-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    {title}
                  </h2>
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      handleReserve();
                    }}
                    className="inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    <CalendarPlus className="w-4 h-4 mr-2" />
                    Reserve Event
                  </Button>
                </div>
              </div>

              {/* Scrollable content area */}
              <div className="overflow-y-auto custom-scrollbar p-6 pt-6" style={{ maxHeight: "calc(80vh - 85px)" }}>
                {children}
              </div>

              {/* Sticky footer with Close button */}
              <div className="sticky bottom-0 bg-white z-10 p-6 pt-6 border-t border-gray-100 flex justify-end">
                <Button
                  onClick={e => {
                    e.stopPropagation()
                    onClose()
                  }}
                  className="inline-flex cursor-pointer items-center px-4 py-2 text-sm font-medium rounded-md bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
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
}
