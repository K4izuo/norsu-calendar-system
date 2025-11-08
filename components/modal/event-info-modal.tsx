"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CalendarClock,
  Clock,
  MapPin,
  Users,
  Info,
  X,
} from "lucide-react";
import { Button } from "../ui/button";

// Role type definition
type Role = "student" | "faculty" | "staff" | "admin" | "public" | undefined;

// Role-based color mapping for loading state
const getRoleLoadingColors = (role: Role) => {
  const colorMap = {
    student: {
      spinner: "border-green-500",
      icon: "text-green-500",
    },
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

  return colorMap[role || "public"] || colorMap.student; // Default to student colors
};

// Make the interface flexible to accept both number and string
interface EventDetails {
  id: number;
  title: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  capacity: string;
  facilities?: string[];
  registrationStatus: string;
  attendeeCount: number;
  registrationDeadline: string;
  description: string;
  requirements?: string;
  category?: string;
  peopleTag?: string[];
  infoType?: string;
  approvedBy?: string;
  rejectedBy?: string;
  asset?: {
    id: string;
    name: string;
    capacity: string;
    facilities?: string[];
  }; // <-- add asset field
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventDetails;
  loading?: boolean;
  role?: Role; // Add role prop
}

// Convert to pure functions (not hooks)
const getStatus = (event: EventDetails): "pending" | "approved" | "rejected" => {
  if (!event.registrationStatus) return "pending";
  const status = event.registrationStatus.toLowerCase();
  if (status === "open") return "approved";
  if (status === "closed") return "rejected";
  return status === "pending" || status === "approved" || status === "rejected"
    ? (status as "pending" | "approved" | "rejected")
    : "pending";
};

const getStatusColor = (status: "pending" | "approved" | "rejected") => {
  if (status === "approved") return "bg-green-100 text-green-800";
  if (status === "pending") return "bg-yellow-100 text-yellow-800";
  if (status === "rejected") return "bg-red-100 text-red-800";
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
  const startedAgoText = event ? getStartedAgo(event.date, event.time) : null;

  // Asset information
  const asset = event?.asset;
  const assetName = asset?.name || event?.location || "Not specified";
  const assetCapacity = asset?.capacity || event?.capacity || "N/A";
  const assetFacilities = asset?.facilities || event?.facilities;

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
            className="relative max-w-[900px] max-h-[92vh] bg-white rounded-lg shadow-xl w-[94%] sm:w-full sm:mx-4 overflow-hidden"
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
                    <span className={`text-sm font-medium ${
                      startedAgoText === "Upcoming" 
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
                  className="p-2 bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                style={{ maxHeight: "calc(80vh - 85px)" }}
              >
                <div className="space-y-6">
                  {/* Basic Information Section */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Users className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-md font-medium text-gray-700">
                        Basic Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Event Title</p>
                        <p className="font-medium">{event.title}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium">
                          {event.category || "General"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">People Tag</p>
                        <p className="font-medium">{event.peopleTag || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Information Type
                        </p>
                        <p className="font-medium">{event.infoType || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Asset Information (was Venue Information) */}
                  <div className="bg-gray-50 shadow-sm rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <MapPin className="text-gray-500 mr-2 h-5 w-5" />
                      <h3 className="text-md font-medium text-gray-700">
                        Asset Information
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Asset Name</p>
                        <p className="font-medium">{assetName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Capacity</p>
                        <p className="font-medium">{assetCapacity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{event.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Organizer</p>
                        <p className="font-medium">{event.organizer}</p>
                      </div>
                      {assetFacilities && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500">Facilities</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {assetFacilities.map((facility, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
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
                      <h3 className="text-md font-medium text-gray-700">
                        Registration Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                            getStatus(event)
                          )}`}
                        >
                          {getStatus(event).charAt(0).toUpperCase() +
                            getStatus(event).slice(1)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {getStatus(event) === "pending" &&
                            ` by: ${event.organizer || "—"}`}
                          {getStatus(event) === "approved" &&
                            ` by: ${event.approvedBy || "—"}`}
                          {getStatus(event) === "rejected" &&
                            ` by: ${event.rejectedBy || "—"}`}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Current Attendees
                        </p>
                        <p className="font-medium">{event.attendeeCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Registration Deadline
                        </p>
                        <p className="font-medium">
                          {event.registrationDeadline}
                        </p>
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
                      <h3 className="text-md font-medium text-gray-700">
                        Additional Details
                      </h3>
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
  );
});
