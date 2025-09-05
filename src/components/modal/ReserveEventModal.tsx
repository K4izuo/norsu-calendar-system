"use client"

import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarPlus, Clock, X, User, Building, CalendarClock, FileText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

// Sample venues for the select component
const venues = [
  { id: "v1", name: "Main Building, Room 101", capacity: "120 seats" },
  { id: "v2", name: "Science Building, Room 203", capacity: "80 seats" },
  { id: "v3", name: "Library Conference Room", capacity: "40 seats" },
  { id: "v4", name: "Auditorium", capacity: "500 seats" },
  { id: "v5", name: "Computer Lab", capacity: "60 seats" },
]

interface ReservationFormData {
  title: string
  venue: string | null
  timeStart: string
  timeEnd: string
  description: string
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: ReservationFormData) => void
}

export function ReserveEventModal({ isOpen, onClose, onSubmit }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState<string>("form")
  
  // Form state
  const [formData, setFormData] = useState<ReservationFormData>({
    title: "",
    venue: null,
    timeStart: "",
    timeEnd: "",
    description: "",
  })
  
  // Get venue details
  const selectedVenue = venues.find(venue => venue.id === formData.venue)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVenueChange = (value: string) => {
    setFormData(prev => ({ ...prev, venue: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSubmit && isFormValid()) {
      onSubmit(formData)
    } else {
      // If form isn't valid, don't submit but show summary
      setActiveTab("summary")
    }
  }

  const isFormValid = () => {
    return (
      formData.title.trim() !== "" && 
      formData.venue !== null && 
      formData.timeStart !== "" && 
      formData.timeEnd !== ""
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overscroll-none"
          onClick={onClose}
        >
          {/* Animated backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.28,
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
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="relative max-w-[900px] max-h-[89vh] bg-white rounded-lg shadow-xl w-full mx-4 overflow-hidden flex flex-col"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transformOrigin: "center",
              willChange: "transform, opacity",
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header with title and close button */}
            <div className="sticky top-0 bg-white z-10 p-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-semibold text-gray-800">
                  Reserve Event
                </h2>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Tabs and content - with adjusted height */}
            <div className="overflow-y-auto custom-scrollbar p-6 pt-4 flex-1" style={{ maxHeight: "calc(90vh - 155px)" }}>
              <Tabs value={activeTab} className="w-full">
                {/* Non-clickable tabs that look like TabsList/TabsTrigger */}
                <div className="grid w-full grid-cols-2 mb-6 bg-muted rounded-lg p-1">
                  <div 
                    className={`flex items-center justify-center py-2.5 px-4 rounded-md text-base font-medium transition-colors ${
                      activeTab === "form" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Event Details
                  </div>
                  <div 
                    className={`flex items-center justify-center py-2.5 px-4 rounded-md text-base font-medium transition-colors ${
                      activeTab === "summary" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Summary
                  </div>
                </div>
                
                {/* Form Tab - removed buttons from content */}
                <TabsContent value="form" className="space-y-6">
                  <form className="space-y-6">
                    <div className="space-y-5">
                      <div>
                        <Label htmlFor="title" className="text-base font-medium">Event Title</Label>
                        <Input 
                          id="title"
                          name="title"
                          placeholder="Enter event title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="mt-1.5 text-base"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="venue" className="text-base font-medium">Venue</Label>
                        <Select 
                          value={formData.venue || ""} 
                          onValueChange={handleVenueChange}
                        >
                          <SelectTrigger id="venue" className="mt-1.5 text-base">
                            <SelectValue placeholder="Select a venue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel className="text-base">Available Venues</SelectLabel>
                              {venues.map(venue => (
                                <SelectItem key={venue.id} value={venue.id} className="text-base">
                                  {venue.name} ({venue.capacity})
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="timeStart" className="text-base font-medium">Start Time</Label>
                          <Input 
                            id="timeStart"
                            name="timeStart"
                            type="time"
                            value={formData.timeStart}
                            onChange={handleInputChange}
                            className="mt-1.5 text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="timeEnd" className="text-base font-medium">End Time</Label>
                          <Input 
                            id="timeEnd"
                            name="timeEnd"
                            type="time"
                            value={formData.timeEnd}
                            onChange={handleInputChange}
                            className="mt-1.5 text-base"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="description" className="text-base font-medium">Description</Label>
                        <Textarea 
                          id="description"
                          name="description"
                          placeholder="Enter event description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="mt-1.5 min-h-[120px] text-base"
                        />
                      </div>
                    </div>
                  </form>
                </TabsContent>
                
                {/* Summary Tab - removed buttons from content */}
                <TabsContent value="summary" className="space-y-6 pb-4">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <User className="text-gray-500 mr-2 h-6 w-6" />
                      <h3 className="text-lg font-medium text-gray-700">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-gray-500">Event Title</p>
                        <p className="font-medium text-base">{formData.title || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Description</p>
                        <p className="font-medium text-base line-clamp-2">{formData.description || "Not provided"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Venue Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Building className="text-gray-500 mr-2 h-6 w-6" />
                      <h3 className="text-lg font-medium text-gray-700">Venue Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-gray-500">Location</p>
                        <p className="font-medium text-base">{selectedVenue?.name || "Not selected"}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Capacity</p>
                        <p className="font-medium text-base">{selectedVenue?.capacity || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Time Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CalendarClock className="text-gray-500 mr-2 h-6 w-6" />
                      <h3 className="text-lg font-medium text-gray-700">Time Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-gray-500">Start Time</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                          <p className="font-medium text-base">{formData.timeStart || "Not specified"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">End Time</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                          <p className="font-medium text-base">{formData.timeEnd || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {formData.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <FileText className="text-gray-500 mr-2 h-6 w-6" />
                        <h3 className="text-lg font-medium text-gray-700">Additional Details</h3>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Full Description</p>
                        <p className="mt-1 text-base">{formData.description}</p>
                      </div>
                    </div>
                  )}

                  {/* Ready for submission indicator */}
                  <div className={`mt-6 p-3 rounded-md flex items-center justify-center ${
                    isFormValid() 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-yellow-50 text-yellow-800'
                  }`}>
                    {isFormValid() ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        <span className="text-base">Ready for submission</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="text-base">Please complete all required fields</span>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sticky footer with buttons */}
            <div className="sticky bottom-0 bg-white z-10 p-5 border-t border-gray-100 flex justify-end">
              {activeTab === "form" ? (
                <Button 
                  type="button"
                  onClick={() => setActiveTab("summary")}
                  variant="default"
                  className="text-base py-2.5"
                >
                  Review Summary
                </Button>
              ) : (
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    onClick={() => setActiveTab("form")}
                    variant="outline"
                    className="text-base py-2.5"
                  >
                    Edit Details
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleSubmit}
                    variant="default"
                    disabled={!isFormValid()}
                    className="text-base py-2.5"
                  >
                    Submit Reservation
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}