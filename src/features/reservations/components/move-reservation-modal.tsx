"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, X, AlertTriangle, Calendar, Clock3 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { EventDetails, ReservationWithRelations } from "@/interface/user-props";
import { formatTime } from "@/core/lib/utils";
import {
  normalizeReservation,
  useMoveReservation,
} from "@/features/calendar/services/reservation-service";
import { apiClient } from "@/core/api/api-client";
import toast from "react-hot-toast";
import { checkReservationConflicts } from "@/features/reservations/utils/reservation-conflict-check";

interface MoveReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: EventDetails;
  prefillDate?: string;
  onMoved?: () => void;
}

export const MoveReservationModal: React.FC<MoveReservationModalProps> = ({
  isOpen,
  onClose,
  event,
  prefillDate,
  onMoved,
}) => {
  const fieldInputClassName =
    "move-picker-input h-12 cursor-pointer border rounded-lg border-gray-300 pr-12 text-base transition-all duration-150 focus:border-blue-500 focus:ring-blue-500/20";
  const today = new Date().toISOString().split("T")[0];
  const newDateRef = useRef<HTMLInputElement>(null);
  const newTimeStartRef = useRef<HTMLInputElement>(null);
  const newTimeEndRef = useRef<HTMLInputElement>(null);
  const [newDate, setNewDate] = useState("");
  const [newTimeStart, setNewTimeStart] = useState("");
  const [newTimeEnd, setNewTimeEnd] = useState("");
  const [moveReason, setMoveReason] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [hasConflict, setHasConflict] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  const { mutate: moveReservation } = useMoveReservation();
  const [isMoving, setIsMoving] = useState(false);

  // Populate defaults when modal opens
  useEffect(() => {
    if (isOpen && event) {
      setNewDate(prefillDate ?? event.date);
      setNewTimeStart(event.time_start.slice(0, 5));
      setNewTimeEnd(event.time_end.slice(0, 5));
      setMoveReason("");
      setCountdown(5);
      setHasConflict(false);
      setConflictMessage("");
      setIsMoving(false);
    }
  }, [isOpen, event, prefillDate]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Conflict check with debounce
  useEffect(() => {
    if (!event || !newDate || !newTimeStart || !newTimeEnd || !isOpen) return;
    const unchanged =
      newDate === event.date &&
      newTimeStart === event.time_start &&
      newTimeEnd === event.time_end;
    if (unchanged) {
      setHasConflict(false);
      setConflictMessage("");
      return;
    }

    const debounce = setTimeout(async () => {
      setIsCheckingConflict(true);
      try {
        const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");
        const all = (response.data ?? []).map(normalizeReservation);
        const conflicts = checkReservationConflicts({
          assetId: event.asset.id,
          date: newDate,
          timeStart: newTimeStart,
          timeEnd: newTimeEnd,
          reservations: all,
          excludeId: event.id,
        });
        if (conflicts.length > 0) {
          setHasConflict(true);
          setConflictMessage(
            `Conflicts with "${conflicts[0].title_name}" (${formatTime(conflicts[0].time_start)} – ${formatTime(conflicts[0].time_end)})`
          );
        } else {
          setHasConflict(false);
          setConflictMessage("");
        }
      } catch {
        setHasConflict(false);
      } finally {
        setIsCheckingConflict(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [newDate, newTimeStart, newTimeEnd, event, isOpen]);

  const canConfirm =
    countdown === 0 &&
    !hasConflict &&
    !isCheckingConflict &&
    moveReason.trim().length > 0 &&
    newDate.length > 0 &&
    newTimeStart.length > 0 &&
    newTimeEnd.length > 0 &&
    newTimeEnd > newTimeStart &&
    newDate >= today &&
    event?.registration_status === "APPROVED";

  const handleConfirm = () => {
    if (!event || !canConfirm) return;
    setIsMoving(true);
    moveReservation(
      {
        reservationId: event.id,
        payload: {
          new_date: newDate,
          new_time_start: newTimeStart,
          new_time_end: newTimeEnd,
          move_reason: moveReason.trim(),
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `"${event.title_name}" moved to ${new Date(newDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} successfully!`
          );
          setIsMoving(false);
          onMoved?.();
          onClose();
        },
        onError: () => {
          setIsMoving(false);
        },
      }
    );
  };

  const handlePickerOpen = (ref: React.RefObject<HTMLInputElement | null>) => {
    const input = ref.current;
    if (!input) return;

    input.focus();
    const pickerInput = input as HTMLInputElement & {
      showPicker?: () => void;
    };
    pickerInput.showPicker?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
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

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "tween", duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              transformOrigin: "center",
              willChange: "transform, opacity",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 pb-4 sm:pb-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <MoveRight strokeWidth={2.5} className="w-8 h-8 text-gray-800 shrink-0" />
                  <h2 className="text-2xl sm:text-2xl font-semibold text-gray-800 leading-tight">Move Reservation</h2>
                </div>
                <Button
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  size="sm"
                  className="p-2 shadow-none bg-white cursor-pointer rounded-full hover:bg-gray-100 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4">
              {/* Current event info */}
              {event && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200 space-y-1">
                  <p className="font-medium text-gray-800 truncate">{event.title_name}</p>
                  <p className="text-gray-500">
                    <span className="font-medium text-gray-600">Current:</span>{" "}
                    {new Date(event.date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {formatTime(event.time_start)} – {formatTime(event.time_end)}
                  </p>
                  <p className="text-gray-500">
                    <span className="font-medium text-gray-600">Venue:</span>{" "}
                    {event.asset.asset_name}
                  </p>
                </div>
              )}

              {/* Status warning */}
              {event && event.registration_status !== "APPROVED" && (
                <div className="flex items-start gap-2 rounded-md px-3 py-2 text-sm bg-red-50 text-red-700 border border-red-200">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>Only <strong>approved</strong> reservations can be moved. This reservation is currently <strong>{event.registration_status.toLowerCase()}</strong>.</p>
                </div>
              )}

              {/* New date */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="move_new_date"
                  className="inline-flex pointer-events-none"
                >
                  <span className="pointer-events-auto">
                    New Date <span className="text-red-500">*</span>
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    ref={newDateRef}
                    id="move_new_date"
                    type="date"
                    value={newDate}
                    min={today}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={fieldInputClassName}
                  />
                  <button
                    type="button"
                    onClick={() => handlePickerOpen(newDateRef)}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-gray-900"
                    aria-label="Open date picker"
                  >
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* New times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="move_time_start"
                    className="inline-flex pointer-events-none"
                  >
                    <span className="pointer-events-auto">
                      Start Time <span className="text-red-500">*</span>
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      ref={newTimeStartRef}
                      id="move_time_start"
                      type="time"
                      value={newTimeStart}
                      onChange={(e) => setNewTimeStart(e.target.value)}
                      className={fieldInputClassName}
                    />
                    <button
                      type="button"
                      onClick={() => handlePickerOpen(newTimeStartRef)}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-gray-900"
                      aria-label="Open start time picker"
                    >
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="move_time_end"
                    className="inline-flex pointer-events-none"
                  >
                    <span className="pointer-events-auto">
                      End Time <span className="text-red-500">*</span>
                    </span>
                  </Label>
                  <div className="relative">
                    <Input
                      ref={newTimeEndRef}
                      id="move_time_end"
                      type="time"
                      value={newTimeEnd}
                      onChange={(e) => setNewTimeEnd(e.target.value)}
                      className={fieldInputClassName}
                    />
                    <button
                      type="button"
                      onClick={() => handlePickerOpen(newTimeEndRef)}
                      className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-gray-900"
                      aria-label="Open end time picker"
                    >
                      <Clock3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Conflict warning */}
              {(hasConflict || isCheckingConflict) && (
                <div
                  className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${hasConflict
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{isCheckingConflict ? "Checking for conflicts..." : conflictMessage}</p>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="move_reason" className="text-sm inline-flex font-medium">
                  Reason for Moving <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="move_reason"
                  placeholder="e.g. Storm / Typhoon Signal No. 2 / Venue conflict..."
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={onClose}
                disabled={isMoving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm || isMoving}
                className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMoving ? (
                  <>
                    <span className="animate-spin mr-2">
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
                    Moving...
                  </>
                ) : countdown > 0 ? (
                  `Move (${countdown})`
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
