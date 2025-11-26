"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  NotebookPen,
  CalendarClock,
  Clock,
  MapPin,
  CalendarPlus2,
  Info,
  X,
  User,
} from "lucide-react";
import { Button } from "../ui/button";
import { EventDetails } from "@/interface/user-props"

// Role type definition
type Role = "faculty" | "staff" | "admin" | "public" | undefined;

// Role-based color mapping for loading state
const getRoleLoadingColors = (role: Role) => {
  const colorMap = {
    faculty: {
      spinner: "border-blue-500",
      icon: "text-blue-500",
    },
    staff: {
      spinner: "border-purple-500",
      icon: "text-purple-500",
    },
    admin: {
      spinner: "border-gray-800",
      icon: "text-gray-800",
    },
    public: {
      spinner: "border-teal-500",
      icon: "text-teal-500",
    },
  };

  return colorMap[role || "public"]; // Default to public colors
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventDetails;
  loading?: boolean;
  role?: Role; // Add role prop
}

// Convert to pure functions (not hooks)
const getStatus = (event: EventDetails): "PENDING" | "APPROVED" | "REJECTED" => {
  if (!event.registration_status) return "PENDING";
  const status = event.registration_status.toLowerCase();
  if (status === "open") return "APPROVED";
  if (status === "closed") return "REJECTED";
  return status === "PENDING" || status === "APPROVED" || status === "REJECTED"
    ? (status as "PENDING" | "APPROVED" | "REJECTED")
    : "PENDING";
};

const getStatusColor = (status: "PENDING" | "APPROVED" | "REJECTED") => {
  if (status === "APPROVED") return "bg-green-100 text-green-800";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (status === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

// Added getStartedAgo function
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

// The component is already memoized with React.memo
export const EventInfoModal = React.memo(function EventInfoModal({
  isOpen,
  onClose,
  event,
  loading = false,
  role, // Add role prop
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Get role-specific loading colors
  const roleLoadingColors = getRoleLoadingColors(role);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Get the started ago text if event exists
  const startedAgoText = event ? getStartedAgo(event.date, event.time_start) : null;

  // Asset information
  const asset = event?.asset;
  const assetName = asset?.asset_name || "Not specified";
  const assetCapacity = asset?.capacity || "N/A";
  const assetFacilities = asset?.facilities;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none"
        >
          {/* Animated backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40"
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
            className="relative max-w-[864px] max-h-[98vh] bg-white rounded-lg shadow-xl w-[94%] sm:w-full sm:mx-4 overflow-hidden"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transformOrigin: "center",
              willChange: "transform, opacity",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky header with title and X button */}
            <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                    Event Information
                  </h2>
                  {startedAgoText && (
                    <span className={`text-sm font-medium ${startedAgoText === "Upcoming"
                      ? "text-blue-600 bg-blue-50"
                      : "text-amber-600 bg-amber-50"
                      } px-2 py-0.5 rounded-full inline-flex items-center`}>
                      <Clock className="w-3 h-3 mr-1" />
                      {startedAgoText}
                    </span>
                  )}
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 shadow-none bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Loading animation */}
            {loading || !event ? (
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
                    transition={{
                      duration: 1.5,
                      ease: "linear",
                      repeat: Infinity,
                    }}
                  />
                  {/* Icon stays still with role-specific color */}
                  <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleLoadingColors.icon}`} />
                </div>
              </motion.div>
            ) : (
              <div
                className="overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-4 sm:pt-6"
                style={{ maxHeight: "calc(88vh - 85px)" }}
              >
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CalendarPlus2 className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Basic Information
                      </h3>
                    </div>
                    <div className="border-b border-gray-300 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-gray-500">Event Title</p>
                        <p className="font-medium text-base">{event.title_name}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">
                          Information Type
                        </p>
                        <p className="font-medium text-base">{event.info_type || "—"}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">People Tag</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {event.people_tag && event.people_tag.length > 0 ? (
                            event.people_tag.map((person) => (
                              <span
                                key={person}
                                className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent"
                              >
                                <User className="w-3 h-3 mr-1.5 text-gray-800" />
                                {person}
                              </span>
                            ))
                          ) : (
                            <p className="font-medium">None</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Category</p>
                        <p className="font-medium text-base">
                          {event.category || "General"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Asset Information (was Venue Information) */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <MapPin className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Asset Information
                      </h3>
                    </div>
                    <div className="border-b border-gray-300 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-gray-500">Asset Name</p>
                        <p className="font-medium text-base">{assetName}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Capacity</p>
                        <p className="font-medium text-base`">{assetCapacity}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Date</p>
                        <p className="font-medium text-base">{event.date}</p>
                      </div>
                      {/* <div>
                        <p className="text-sm text-gray-500">Organizer</p>
                        <p className="font-medium">{event.organizer}</p>
                      </div> */}
                      {assetFacilities && (
                        <div>
                          <p className="text-base text-gray-500">Facilities</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {assetFacilities.map((facility, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-200 text-gray-700"
                              >
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* <div>
                        <p className="text-base text-gray-500">Facilities</p>
                        <p className="font-medium text-base">{event.date}</p>
                      </div> */}
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <NotebookPen className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Reservation Details
                      </h3>
                    </div>
                    <div className="border-b border-gray-300 mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-base text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(
                            getStatus(event)
                          )}`}
                        >
                          {getStatus(event).charAt(0).toUpperCase() +
                            getStatus(event).slice(1)}
                        </span>
                        <span className="text-base text-gray-600">
                          {getStatus(event) === "PENDING" &&
                            ` by: ${event.reserve_by || "—"}`}
                          {getStatus(event) === "APPROVED" &&
                            ` by: ${event.approved_by || "—"}`}
                          {getStatus(event) === "REJECTED" &&
                            ` by: ${event.rejected_by || "—"}`}
                        </span>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Reservation Range</p>
                        <p className="font-medium text-base">{`${event.range} ${event.range === 1 ? 'day' : 'days'}`}</p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">
                          Registration Deadline
                        </p>
                        <p className="font-medium text-base">
                          {event.registration_deadline}
                        </p>
                      </div>
                      <div>
                        <p className="text-base text-gray-500">Time</p>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                          <p className="font-medium text-base">{`${event.time_start} - ${event.time_end}`}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Info className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-lg font-medium text-gray-700">
                        Additional Details
                      </h3>
                    </div>
                    <div className="border-b border-gray-300 mb-4" />
                    <div className="space-y-3">
                      <div>
                        <p className="text-base text-gray-500">Description</p>
                        <p className="mt-1 text-base">{event.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});
