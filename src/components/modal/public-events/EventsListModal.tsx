"use client"

import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus } from "lucide-react" // Import icons
import { Button } from "@/components/ui/button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  onReserve?: () => void // Optional callback for the reserve button
  title?: string // Add this line
}

export function EventsListModal({ isOpen, onClose, children, onReserve, title }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [isOpen])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  const handleReserve = () => {
    if (onReserve) {
      onReserve()
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
          onClick={onClose}
        >
          {/* Static backdrop - no animation */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Modal content with spring physics */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ 
              type: "spring",
              // Spring physics calibrated for smooth, fast motion
              stiffness: 400,    // Higher stiffness for faster motion
              damping: 30,       // Good damping to prevent bouncing
              mass: 0.5,         // Lower mass for quicker response
              restDelta: 0.001,  // Small threshold for stopping animation
              // Different settings for opacity for smoother feel
              opacity: { duration: 0.15 }
            }}
            className="relative max-w-[1300px] max-h-[90vh] bg-white rounded-lg shadow-xl w-full mx-4 overflow-hidden"
            style={{ 
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transformOrigin: "center",
              willChange: "transform, opacity",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with title and Reserve Event button (fixed position) */}
            <div className="sticky top-0 bg-white z-10 p-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {title}
                </h2>
                
                <Button
                  onClick={(e) => {
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
  )
}
