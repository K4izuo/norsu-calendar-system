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
  Edit,
  CircleCheckBig,
  XCircle,
  NotebookText
} from "lucide-react";
import { Button } from "../ui/button";
import { EventDetails } from "@/interface/user-props";
import { ReserveEventModal } from "./reserve-event-modal";
import { getRoleColors, UserRole } from "@/utils/role-colors"
import {
  handleApproveReservation,
  handleDeclineReservation,
  handleEditReservation,
} from "@/hooks/useHandleReservations";
import { ConfirmationModal } from "./confirmation-modal";
import { apiClient } from "@/lib/api-client";

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

const getStatus = (event: EventDetails): "PENDING" | "APPROVED" | "REJECTED" => {
  if (!event.registration_status) return "PENDING";
  const status = event.registration_status.toUpperCase();

  if (status === "OPEN") return "APPROVED";
  if (status === "CLOSED") return "REJECTED";
  if (status === "PENDING" || status === "APPROVED" || status === "REJECTED") {
    return status as "PENDING" | "APPROVED" | "REJECTED";
  }

  return "PENDING"; // Default fallback
};

const getStatusColor = (status: "PENDING" | "APPROVED" | "REJECTED") => {
  if (status === "APPROVED") return "bg-green-100 text-green-800";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800";
  if (status === "REJECTED") return "bg-red-100 text-red-800";
  return "bg-gray-100 text-gray-800";
};

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [conflictingReservations, setConflictingReservations] = useState<EventDetails[]>([]);
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

  const startedAgoText = event ? getStartedAgo(event.date, event.time_start) : null;

  const asset = event?.asset;
  const assetName = asset?.asset_name || "Not specified";
  const assetCapacity = asset?.capacity || "N/A";
  const assetFacilities = asset?.facilities;

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
  };

  const handleApprove = async () => {
    if (!event) return;

    // Fetch all pending reservations to find conflicts
    try {
      const response = await apiClient.get<any[]>("/reservations/all");

      if (response.data && Array.isArray(response.data)) {
        // Filter for conflicts: same asset, same date, pending status, overlapping time
        const conflicts = response.data
          .filter(r =>
            r.id !== event.id &&
            r.asset_id === event.asset?.id &&
            r.date === event.date &&
            r.status === 'PENDING' &&
            (
              // Check time overlap
              (r.time_start >= event.time_start && r.time_start < event.time_end) ||
              (r.time_end > event.time_start && r.time_end <= event.time_end) ||
              (r.time_start <= event.time_start && r.time_end >= event.time_end)
            )
          )
          .map(r => ({
            id: r.id,
            title_name: r.title_name,
            date: r.date,
            time_start: r.time_start,
            time_end: r.time_end,
            asset: {
              id: r.asset_id,
              asset_name: event.asset?.asset_name || `Asset #${r.asset_id}`,
              capacity: 0,
            },
            category: r.category,
            info_type: r.info_type,
            description: r.description,
            people_tag: [],
            range: 1,
            registration_status: "PENDING" as const,
            registration_deadline: r.date,
            reserve_by_user: r.reserved_by_user
              ? `${r.reserved_by_user.first_name} ${r.reserved_by_user.last_name}`
              : `User #${r.reserve_by_user_id || r.id}`,
          }));

        setConflictingReservations(conflicts);
      }
    } catch (error) {
      console.error('Error fetching conflicts:', error);
      setConflictingReservations([]);
    }

    setShowApproveConfirm(true);
  };

  const handleDecline = () => {
    setShowDeclineConfirm(true);
  };

  const handleApproveConfirm = async () => {
    if (!event) return;

    setIsApproving(true);
    setShowApproveConfirm(false);

    await handleApproveReservation({
      event,
      onSuccess: onApprove,
      onClose,
    });

    setIsApproving(false);
  };

  const handleDeclineConfirm = async (reason?: string) => {
    if (!event) return;

    setIsDeclining(true);
    setShowDeclineConfirm(false);

    await handleDeclineReservation({
      event,
      onSuccess: onDecline,
      onClose,
      reason,
    });

    setIsDeclining(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none"
          >
            <motion.div
              className={`absolute inset-0 bg-black/40 ${showBackdropBlur ? 'sm:backdrop-blur-sm' : ''}`}
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
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative max-w-[864px] max-h-[92vh] bg-white rounded-lg shadow-xl w-[94%] sm:w-full sm:mx-4 overflow-hidden"
              style={{
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
                transformOrigin: "center",
                willChange: "transform, opacity",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <NotebookText strokeWidth={2.5} className="w-8 h-8 text-gray-800" />
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

              {loading || !event ? (
                <motion.div
                  className="flex items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative h-16 w-16 flex items-center justify-center">
                    <motion.div
                      className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 ${roleLoadingColors.spinner}`}
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1.5,
                        ease: "linear",
                        repeat: Infinity,
                      }}
                    />
                    <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleLoadingColors.icon}`} />
                  </div>
                </motion.div>
              ) : (
                <div
                  className="overflow-y-auto custom-scrollbar p-4 sm:p-6 pt-4 sm:pt-6"
                  style={{
                    maxHeight: "calc(92vh - 85px)",
                    paddingBottom: !loading && event && getStatus(event) === "PENDING" ? "112px" : ""
                  }}
                >
                  <div className="space-y-6">
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
                          <p className="font-medium text-base">{assetCapacity}</p>
                        </div>
                        <div>
                          <p className="text-base text-gray-500">Date</p>
                          <p className="font-medium text-base">{event.date}</p>
                        </div>
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
                      </div>
                    </div>

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
                          <p className="text-base text-gray-500">Reserved By</p>
                          <span className="inline-flex mt-1 items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent">
                            <User className="w-3 h-3 mr-1.5 text-gray-800" />
                            <p className="font-medium text-base">{event.reserve_by_user || "Unknown User"}</p>
                          </span>
                        </div>
                        <div>
                          <p className="text-base text-gray-500">Status</p>
                          <div className="flex mt-1 items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-md font-medium ${getStatusColor(
                                getStatus(event)
                              )}`}
                            >
                              {getStatus(event).charAt(0).toUpperCase() +
                                getStatus(event).slice(1)}
                            </span>
                            {getStatus(event) === "APPROVED" && (
                              <span className="text-base text-gray-600">
                                by: {event.approved_by_user_details
                                  ? `${event.approved_by_user_details.first_name} ${event.approved_by_user_details.last_name}`
                                  : "—"}
                              </span>
                            )}
                            {getStatus(event) === "REJECTED" && (
                              <span className="text-base text-gray-600">
                                by: {event.declined_by_user_details
                                  ? `${event.declined_by_user_details.first_name} ${event.declined_by_user_details.last_name}`
                                  : "—"}
                              </span>
                            )}

                          </div>
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

              {!loading && event && getStatus(event) === "PENDING" && (
                <div
                  className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3"
                >
                  <Button
                    onClick={handleEdit}
                    className="inline-flex cursor-pointer items-center justify-center flex-1 max-w-xs px-6 py-5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    <Edit className="w-4 h-4" />
                    EDIT
                  </Button>

                  <Button
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="inline-flex cursor-pointer items-center justify-center flex-1 max-w-xs px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="inline-flex cursor-pointer items-center justify-center flex-1 max-w-xs px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
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

      <ReserveEventModal
        isOpen={showEditModal}
        onClose={handleEditModalClose}
        editMode={true}
        eventData={event}
      />

      <ConfirmationModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApproveConfirm}
        event={event}
        type="APPROVE"
        conflictingReservations={conflictingReservations}
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