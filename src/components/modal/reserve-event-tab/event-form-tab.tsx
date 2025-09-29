import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import toast from "react-hot-toast"
import { ReservationFormData } from "@/interface/faculty-events-props"

interface Venue {
  id: string
  name: string
  capacity: string
}

interface Props {
  formData: ReservationFormData
  venues: Venue[]
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleVenueChange: (value: string) => void
  handleRangeChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  missingFields?: Record<string, boolean>
}

export function ReserveEventFormTab({
  formData,
  venues,
  handleInputChange,
  handleVenueChange,
  handleRangeChange,
  missingFields = {},
}: Props) {
  // Local state for current time in "HH:mm" format
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  // Update currentTime every second, but do NOT update formData unless empty
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Set timeStart and timeEnd to current time only if empty
  useEffect(() => {
    if (!formData.timeStart) {
      handleInputChange({
        target: { name: "timeStart", value: currentTime }
      } as React.ChangeEvent<HTMLInputElement>);
    }
    if (!formData.timeEnd) {
      handleInputChange({
        target: { name: "timeEnd", value: currentTime }
      } as React.ChangeEvent<HTMLInputElement>);
    }
    // Only run when currentTime changes and fields are empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime]);

  // Rename local function to avoid conflict
  const handleRangeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    handleRangeChange({
      ...e,
      target: { ...e.target, value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleRangeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value || value === "0") {
      toast.error("Range must be at least 1 day.");
      handleRangeChange({
        ...e,
        target: { ...e.target, value: "1" }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <form className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="title" className="text-base inline-block font-medium">Event Title</Label>
          <Input 
            id="title"
            name="title"
            placeholder="Enter event title"
            value={formData.title}
            onChange={handleInputChange}
            className={`mt-1 text-base h-12 w-full ${missingFields.title ? "border-red-500 focus:border-red-500" : ""}`}
            required
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex-1 min-w-0">
            <Label htmlFor="venue" className="text-base inline-block font-medium">Venue</Label>
            <Select 
              value={formData.venue || ""} 
              onValueChange={handleVenueChange}
            >
              <SelectTrigger id="venue" className={`mt-1 text-base w-full h-12 ${missingFields.venue ? "border-red-500 focus:border-red-500" : ""}`}>
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
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="range" className="text-base inline-flex font-medium">Range</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-pointer">
                      <svg className="w-4 h-4 text-gray-400 hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path stroke="currentColor" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-gray-700 border border-gray-200 shadow-md px-3 py-2 rounded-md text-sm max-w-xs">
                    Specify how many days you want to reserve this event for. For example, enter &quot;3&quot; to reserve for 3 days.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              type="text"
              id="range"
              name="range"
              value={formData.range}
              onChange={handleRangeInputChange}
              onBlur={handleRangeBlur}
              className={`mt-1 h-12 text-base w-full ${missingFields.range ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
          </div>
          <div>
            <Label htmlFor="timeStart" className="text-base inline-block font-medium">Start Time</Label>
            <Input 
              id="timeStart"
              name="timeStart"
              type="time"
              value={formData.timeStart || currentTime}
              onChange={handleInputChange}
              className={`mt-1 text-base h-12 w-full ${missingFields.timeStart ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
          </div>
          <div>
            <Label htmlFor="timeEnd" className="text-base inline-block font-medium">End Time</Label>
            <Input 
              id="timeEnd"
              name="timeEnd"
              type="time"
              value={formData.timeEnd || currentTime}
              onChange={handleInputChange}
              className={`mt-1 text-base h-12 w-full ${missingFields.timeEnd ? "border-red-500 focus:border-red-500" : ""}`}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="text-base inline-block font-medium">Description</Label>
          <Textarea 
            id="description"
            name="description"
            placeholder="Enter event description"
            value={formData.description}
            onChange={handleInputChange}
            className={`mt-1 min-h-[120px] text-base h-12 w-full ${missingFields.description ? "border-red-500 focus:border-red-500" : ""}`}
            required
          />
        </div>
      </div>
    </form>
  )
}