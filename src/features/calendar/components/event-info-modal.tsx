"use client";

import React, { useEffect, useRef, useState } from "react";
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
  // Edit,
  CircleCheckBig,
  XCircle,
  NotebookText,
} from "lucide-react";
import { Button } from "../../../shared/components/ui/button";
import { EventDetails } from "@/interface/user-props";
// import { ReserveEventModal } from "./reserve-event-modal";
import { getRoleColors, UserRole } from "@/shared/components/utils/role-colors";
// ✅ CRITICAL FIX: Import the mutation hooks instead of manual handlers
import {
  useApproveReservation,
  useDeclineReservation,
} from "@/features/calendar/services/reservation-service";
import { ConfirmationModal } from "../../reservations/components/confirmation-modal";
import { formatTime } from "@/core/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventDetails;
  loading?: boolean;
  role?: UserRole;
  onApprove?: () => void;
  onDecline?: () => void;
  showBackdropBlur?: boolean;
}

const getStatus = (
  event: EventDetails,
): "PENDING" | "APPROVED" | "DECLINED" => {
  if (!event.registration_status) return "PENDING";
  const status = event.registration_status.toUpperCase();

  if (status === "OPEN") return "APPROVED";
  if (status === "CLOSED") return "DECLINED";
  if (status === "PENDING" || status === "APPROVED" || status === "DECLINED") {
    return status as "PENDING" | "APPROVED" | "DECLINED";
  }

  return "PENDING"; // Default fallback
};

const getStatusColor = (status: "PENDING" | "APPROVED" | "DECLINED") => {
  if (status === "APPROVED") return "bg-green-100 text-green-800";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (status === "DECLINED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

const getStartedAgo = (eventDate: string, eventTime: string): string | null => {
  if (!eventDate || !eventTime) return null;
  try {
    // Parse the formatted date back to compare with current time
    const eventStart = new Date(eventDate + " " + eventTime);
    if (isNaN(eventStart.getTime())) return null;

    const now = new Date();

    if (eventStart > now) {
      const isToday = eventStart.toDateString() === now.toDateString();

      if (isToday) {
        return `Starts at ${eventTime}`;
      } else {
        return "Upcoming";
      }
    }

    const diffMs = now.getTime() - eventStart.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Started just now";
    if (diffMins < 60)
      return `Started ${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `Started ${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `Started ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } catch {
    return null;
  }
};

// Helper to format date "YYYY-MM-DD" to "Month DD, YYYY"
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export const EventInfoModal = React.memo(function EventInfoModal({
  isOpen,
  onClose,
  event,
  loading = false,
  role,
  onApprove,
  onDecline,
  showBackdropBlur = false,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  // const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  // ✅ CRITICAL FIX: Use the mutation hooks
  const { mutate: approveReservation, isPending: isApproving } =
    useApproveReservation();
  const { mutate: declineReservation, isPending: isDeclining } =
    useDeclineReservation();

  const roleLoadingColors = getRoleColors(role);

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

  const startedAgoText = event
    ? getStartedAgo(event.date, event.time_start)
    : null;

  const asset = event?.asset;
  const assetName = asset?.asset_name || "Not specified";
  const assetCapacity = asset?.capacity || "N/A";
  const assetAminities = asset?.aminities;

  // const handleEdit = () => {
  //   setShowEditModal(true);
  // };

  // const handleEditModalClose = () => {
  //   setShowEditModal(false);
  // };

  const handleApprove = () => {
    if (!event) return;
    setShowApproveConfirm(true);
  };

  const handleDecline = () => {
    setShowDeclineConfirm(true);
  };

  // ✅ CRITICAL FIX: Use mutation hook instead of manual API call
  const handleApproveConfirm = () => {
    if (!event) return;

    setShowApproveConfirm(false);

    // Call the mutation - this will automatically invalidate cache
    approveReservation(event.id, {
      onSuccess: () => {
        // Call parent callbacks if provided
        if (onApprove) onApprove();
        onClose();
      },
    });
  };

  // ✅ CRITICAL FIX: Use mutation hook instead of manual API call
  const handleDeclineConfirm = (reason?: string) => {
    if (!event) return;

    setShowDeclineConfirm(false);

    // Call the mutation - this will automatically invalidate cache
    declineReservation(
      { reservationId: event.id, reason },
      {
        onSuccess: () => {
          // Call parent callbacks if provided
          if (onDecline) onDecline();
          onClose();
        },
      },
    );
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none">
            <motion.div
              className={`absolute inset-0 bg-black/50 ${showBackdropBlur ? "sm:backdrop-blur-sm" : ""}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
            />

            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{
                type: "tween",
                duration: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
                <div className="flex items-center gap-2">
                  <CalendarClock
                    className="text-gray-800 h-6 w-6"
                    strokeWidth={2.5}
                  />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Event Details
                  </h2>
                </div>
                <Button
                  onClick={onClose}
                  className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100 focus:outline-none"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </Button>
              </div>

              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    {/* Hardware accelerated CSS spinner for smooth performance */}
                    <div
                      className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 animate-spin-loading ${roleLoadingColors.spinner}`}
                      style={{
                        willChange: "transform",
                        transform: "translateZ(0)",
                      }}
                    />
                    <CalendarClock
                      className={`absolute inset-0 m-auto h-7 w-7 ${roleLoadingColors.icon}`}
                    />
                  </div>
                </div>
              )}

              {/* event details */}
              {!loading && event && (
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="bg-white text-card-foreground border shadow rounded-lg p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <NotebookText className="text-gray-500 shrink-0 h-5 w-5" />
                            <h3 className="text-lg capitalize font-medium">
                              {event.title_name || "Event Title"}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                            <MapPin className="h-4 w-4" />
                            {assetName}
                            {startedAgoText && ` - ${startedAgoText}`}
                          </p>
                        </div>
                        {/* <div className="shrink-0">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              getStatus(event)
                            )}`}
                          >
                            {getStatus(event).charAt(0).toUpperCase() +
                              getStatus(event).slice(1)}
                          </span>
                        </div> */}
                      </div>
                      {/* event details grid */}
                      <div className="border-b border-gray-300 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-base text-gray-500">Date</p>
                          <div className="flex items-center">
                            <CalendarPlus2 className="h-4 w-4 mr-1.5 text-gray-500" />
                            <p className="font-medium text-base">
                              {formatDate(event.date)}
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-base text-gray-500">
                            Information Type
                          </p>
                          <p className="font-medium capitalize text-base">
                            {event.info_type}
                          </p>
                        </div>
                        <div>
                          <p className="text-base text-gray-500">
                            Venue Capacity
                          </p>
                          <p className="font-medium text-base">
                            {assetCapacity} people
                          </p>
                        </div>
                        <div>
                          <p className="text-base text-gray-500">Category</p>
                          <p className="font-medium capitalize text-base">
                            {event.category}
                          </p>
                        </div>
                        {assetAminities && assetAminities.length > 0 && (
                          <div className="col-span-1 md:col-span-2 lg:col-span-4">
                            <p className="text-base text-gray-500 mb-2">
                              Venue Facilities
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {assetAminities.map((facility, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent"
                                >
                                  {facility}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* reservation details */}
                    <div className="bg-white text-card-foreground border shadow rounded-lg p-6">
                      <div className="flex items-center mb-3">
                        <NotebookPen className="text-gray-500 mr-2 h-5 w-5" />
                        <h3 className="text-lg font-medium text-gray-700">
                          Reservation Details
                        </h3>
                      </div>
                      <div className="border-b border-gray-300 mb-4" />
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-6">
                        <div className="md:col-span-1">
                          <p className="text-base text-gray-500">Reserved By</p>
                          <span className="inline-flex mt-1 items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent">
                            <User className="w-3 h-3 mr-1.5 text-gray-800" />
                            <p className="font-medium text-base">
                              {event.reserve_by_user || "Unknown User"}
                            </p>
                          </span>
                        </div>
                        <div className="md:col-span-1">
                          <p className="text-base text-gray-500">Time</p>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                            <p className="font-medium text-base">{`${formatTime(event.time_start)} - ${formatTime(event.time_end)}`}</p>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-base text-gray-500">Status</p>
                          <div className="flex mt-1 items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(
                                getStatus(event),
                              )}`}
                            >
                              {getStatus(event).charAt(0).toUpperCase() +
                                getStatus(event).slice(1)}
                            </span>
                            {getStatus(event) === "APPROVED" && (
                              <span className="text-base text-gray-600">
                                by:{" "}
                                {event.approved_by_user_details
                                  ? `${event.approved_by_user_details.first_name} ${event.approved_by_user_details.last_name}`
                                  : "—"}
                              </span>
                            )}
                            {getStatus(event) === "DECLINED" && (
                              <span className="text-base text-gray-600">
                                by:{" "}
                                {event.declined_by_user_details
                                  ? `${event.declined_by_user_details.first_name} ${event.declined_by_user_details.last_name}`
                                  : "—"}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="md:col-span-1">
                          <p className="text-base text-gray-500">
                            Registration Deadline
                          </p>
                          <p className="font-medium text-base">
                            {formatDate(event.registration_deadline)}
                          </p>
                        </div>
                        <div className="md:col-span-1">
                          <p className="text-base text-gray-500">
                            Reservation Day(s)
                          </p>
                          <p className="font-medium text-base">{`${event.range} ${event.range === 1 ? "day" : "days"}`}</p>
                        </div>
                      </div>
                    </div>

                    {/* additional details */}
                    <div className="bg-white text-card-foreground border shadow rounded-lg p-6">
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

              {!loading &&
                event &&
                getStatus(event) === "PENDING" &&
                role &&
                role !== "public" && (
                  <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                    {/* <Button
                    onClick={handleEdit}
                    className="inline-flex cursor-pointer items-center justify-center flex-1 max-w-xs px-6 py-5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    <Edit className="w-4 h-4" />
                    EDIT
                  </Button> */}

                    <Button
                      onClick={handleApprove}
                      disabled={isApproving}
                      className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isApproving ? (
                        <>
                          <span className="animate-spin">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </span>
                          APPROVING...
                        </>
                      ) : (
                        <>
                          <CircleCheckBig className="w-4 h-4" />
                          APPROVE
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleDecline}
                      disabled={isDeclining}
                      className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeclining ? (
                        <>
                          <span className="animate-spin">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                          </span>
                          DECLINING...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          DECLINE
                        </>
                      )}
                    </Button>
                  </div>
                )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* <ReserveEventModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        editMode={true}
        eventData={event}
      /> */}

      <ConfirmationModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApproveConfirm}
        event={event}
        type="APPROVE"
      />

      <ConfirmationModal
        isOpen={showDeclineConfirm}
        onClose={() => setShowDeclineConfirm(false)}
        onConfirm={handleDeclineConfirm}
        event={event}
        type="DECLINE"
      />
    </>
  );
});
