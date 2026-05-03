"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardCheck, X, AlertTriangle, User, Clock, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EventDetails, ReservationWithRelations } from "@/interface/user-props";
import { formatTime } from "@/core/lib/utils";
import { apiClient } from "@/core/api/api-client";
import { normalizeReservation } from "@/features/calendar/services/reservation-service";

interface CampusDirectorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: "APPROVE" | "ENDORSE") => void;
  event?: EventDetails;
}

export const CampusDirectorApprovalModal: React.FC<CampusDirectorApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [conflictingReservations, setConflictingReservations] = useState<EventDetails[]>([]);
  const [isLoadingConflicts, setIsLoadingConflicts] = useState(false);

  useEffect(() => {
    if (!isOpen || !event) return;

    let cancelled = false;
    setIsLoadingConflicts(true);

    const fetchConflicts = async () => {
      try {
        const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");
        if (cancelled) return;
        if (response.data && Array.isArray(response.data)) {
          const conflicts = response.data
            .map(normalizeReservation)
            .filter(r =>
              r.id !== event.id &&
              r.asset_id === event.asset?.id &&
              r.date === event.date &&
              r.status === "PENDING" &&
              (
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
              range: r.range,
              registration_status: "PENDING" as const,
              registration_deadline: r.date,
              reserve_by_user: r.reserved_by_user
                ? `${r.reserved_by_user.first_name} ${r.reserved_by_user.last_name}`
                : "Unknown User",
            } as EventDetails));

          setConflictingReservations(conflicts);
        }
      } catch {
        if (!cancelled) setConflictingReservations([]);
      } finally {
        if (!cancelled) setIsLoadingConflicts(false);
      }
    };

    fetchConflicts();
    return () => { cancelled = true; };
  }, [isOpen, event]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setConflictingReservations([]);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const hasConflicts = conflictingReservations.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-w-xl w-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="text-emerald-500 h-5 w-5" />
                <h2 className="text-lg font-semibold text-gray-800">Review Reservation</h2>
              </div>
              <Button
                onClick={onClose}
                className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100 focus:outline-none"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <p className="text-gray-700 text-center text-base">
                  Choose to directly approve this reservation or endorse it to the University President for final approval.
                </p>

                {event && (
                  <div className="bg-gray-100 shadow-sm rounded-lg p-4">
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">Event Title</p>
                      <p className="font-medium text-gray-800">{event.title_name}</p>
                    </div>
                    <div className="border-b border-gray-300 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Date</p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="font-medium text-gray-900">{event.date}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Time</p>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium text-gray-900">
                            {`${formatTime(event.time_start)} - ${formatTime(event.time_end)}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isLoadingConflicts && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-center gap-2 py-3">
                      <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                      <p className="text-sm text-gray-600">Checking for conflicting reservations...</p>
                    </div>
                  </div>
                )}

                {hasConflicts && !isLoadingConflicts && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h3 className="font-semibold text-amber-900">Conflicting Reservations</h3>
                    </div>
                    <p className="text-sm text-amber-800 mb-3">
                      The following {conflictingReservations.length} reservation{conflictingReservations.length > 1 ? "s" : ""} will be automatically declined if you Approve:
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {conflictingReservations.map(conflict => (
                        <div key={conflict.id} className="bg-white border border-amber-200 rounded-md p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900 truncate">{conflict.title_name}</p>
                              <div className="flex items-center gap-3 mt-2 text-gray-600">
                                <span className="flex text-sm items-center gap-1">
                                  <Clock className="w-3 h-3 mr-0.5 text-gray-800" />
                                  {conflict.time_start} - {conflict.time_end}
                                </span>
                                <span className="flex text-sm items-center gap-1">
                                  <User className="w-3 h-3 mr-0.5 text-gray-800" />
                                  {conflict.reserve_by_user || ""}
                                </span>
                              </div>
                            </div>
                            <span className="shrink-0 bg-amber-100 text-amber-800 text-sm font-medium px-2 py-1 rounded">
                              #{conflict.id}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white z-10 p-4 border-t border-gray-200 shadow-lg">
              <div className="flex gap-3 mb-2">
                <Button
                  onClick={onClose}
                  className="flex-1 h-10 cursor-pointer py-2.5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => onConfirm("ENDORSE")}
                  disabled={countdown > 0}
                  className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 cursor-pointer text-white py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {countdown > 0 ? `Endorse (${countdown})` : "Endorse"}
                </Button>
                <Button
                  onClick={() => onConfirm("APPROVE")}
                  disabled={countdown > 0}
                  className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 cursor-pointer text-white py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {countdown > 0 ? `Approve (${countdown})` : "Approve"}
                </Button>
              </div>
              <div className="flex gap-3 px-0.5">
                <div className="flex-1" />
                <p className="flex-1 text-center text-xs text-gray-400">Forwards to University President for final approval</p>
                <p className="flex-1 text-center text-xs text-gray-400">Directly approves — event goes live</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
