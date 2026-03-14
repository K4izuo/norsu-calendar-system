"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoveRight, X, AlertTriangle, CalendarDays } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { EventDetails, ReservationWithRelations } from "@/interface/user-props";
import { formatTime } from "@/core/lib/utils";
import { useMoveReservation } from "@/features/calendar/services/reservation-service";
import { apiClient } from "@/core/api/api-client";
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
  const today = new Date().toISOString().split("T")[0];
  const [newDate, setNewDate] = useState("");
  const [newTimeStart, setNewTimeStart] = useState("");
  const [newTimeEnd, setNewTimeEnd] = useState("");
  const [reason, setReason] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [hasConflict, setHasConflict] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [conflictMessage, setConflictMessage] = useState("");

  const { mutate: moveReservation, isPending } = useMoveReservation();

  // Populate defaults when modal opens
  useEffect(() => {
    if (isOpen && event) {
      setNewDate(prefillDate ?? event.date);
      setNewTimeStart(event.time_start);
      setNewTimeEnd(event.time_end);
      setReason("");
      setCountdown(5);
      setHasConflict(false);
      setConflictMessage("");
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
        const all = response.data ?? [];
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
    reason.trim().length > 0 &&
    newDate.length > 0 &&
    newTimeStart.length > 0 &&
    newTimeEnd.length > 0 &&
    newTimeEnd > newTimeStart &&
    newDate >= today;

  const handleConfirm = () => {
    if (!event || !canConfirm) return;
    moveReservation(
      {
        reservationId: event.id,
        payload: {
          new_date: newDate,
          new_time_start: newTimeStart,
          new_time_end: newTimeEnd,
          reason: reason.trim(),
        },
      },
      {
        onSuccess: () => {
          onMoved?.();
          onClose();
        },
      }
    );
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
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ type: "tween", duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-md">
                  <MoveRight className="text-amber-600 w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-800">Move Reservation</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Current event info */}
            {event && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm border border-gray-200 space-y-1">
                <p className="font-medium text-gray-800 truncate">{event.title_name}</p>
                <p className="text-gray-500">
                  <span className="font-medium text-gray-600">Current:</span>{" "}
                  {event.date} · {formatTime(event.time_start)} – {formatTime(event.time_end)}
                </p>
                <p className="text-gray-500">
                  <span className="font-medium text-gray-600">Venue:</span>{" "}
                  {event.asset.asset_name}
                </p>
              </div>
            )}

            {/* New date */}
            <div className="space-y-1.5">
              <Label htmlFor="move_new_date" className="text-sm font-medium text-gray-700">
                New Date <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  id="move_new_date"
                  type="date"
                  value={newDate}
                  min={today}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* New times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="move_time_start" className="text-sm font-medium text-gray-700">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <input
                  id="move_time_start"
                  type="time"
                  value={newTimeStart}
                  onChange={(e) => setNewTimeStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="move_time_end" className="text-sm font-medium text-gray-700">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <input
                  id="move_time_end"
                  type="time"
                  value={newTimeEnd}
                  onChange={(e) => setNewTimeEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
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
              <Label htmlFor="move_reason" className="text-sm font-medium text-gray-700">
                Reason for Moving <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="move_reason"
                placeholder="e.g. Storm / Typhoon Signal No. 2 / Venue conflict..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>

            {/* Footer */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 cursor-pointer"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={!canConfirm || isPending}
                className="flex-1 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending
                  ? "Moving..."
                  : countdown > 0
                    ? `Move (${countdown})`
                    : "Confirm Move"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};