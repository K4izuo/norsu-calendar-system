"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, X, CircleCheckBig, XCircle, ClipboardCheck, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  useApproveReservation,
  useDeclineReservation,
} from "@/features/calendar/services/reservation-service";
import { ConfirmationModal } from "@/features/reservations/components/confirmation-modal";
import { CampusDirectorApprovalModal } from "@/features/reservations/components/campus-director-approval-modal";
import { MoveReservationModal } from "@/features/reservations/components/move-reservation-modal";
import { QrCodeModal } from "@/features/calendar/components/qr-code-modal";
import { printEventReceipt } from "@/features/calendar/components/event-info-card/print-receipt";
import { ModalProps } from "@/features/calendar/components/event-info-card/types";
import { getStatus } from "@/features/calendar/components/event-info-card/helpers";
import { ModalLoadingSkeleton } from "@/features/calendar/components/event-info-card/modal-loading-skeleton";
import { EventDetailsBody } from "@/features/calendar/components/event-info-card/event-details-body";
import { useAuth } from "@/shared/components/context/auth-context";
import { canMoveApprovedReservation } from "@/features/calendar/utils/move-permissions";
import { getReviewStageForRole, getLatestStageApproval } from "@/features/reservations/utils/reservation-review";

const ADMIN_ROLE_NUMBER = 3;

export const EventInfoModal = React.memo(function EventInfoModal({
  isOpen,
  onClose,
  event,
  loading = false,
  role,
  userRoleNumber,
  onApprove,
  onDecline,
  onResubmit,
  showBackdropBlur = false,
  fromMovedEvents = false,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);
  const [showCdModal, setShowCdModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const { mutate: approveReservation, isPending: isApproving } = useApproveReservation();
  const { mutate: declineReservation, isPending: isDeclining } = useDeclineReservation();
  const { user } = useAuth();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const printedBy = user ? `${user.first_name} ${user.last_name}` : "Staff";

  const [isPrinting, setIsPrinting] = useState(false);

  const status = event ? getStatus(event) : "PENDING";
  const isAdminRole = userRoleNumber === ADMIN_ROLE_NUMBER || user?.role === ADMIN_ROLE_NUMBER;
  const currentStage = event?.current_stage;
  const reviewerStage = getReviewStageForRole(userRoleNumber);
  // The backend sets current_stage="vp_approval" for all VP roles (6-9).
  // Each VP is identified by the requires_* flag; confirm they haven't acted yet.
  const isVpApprovalActive = Boolean(
    currentStage === "vp_approval" &&
    reviewerStage &&
    event && (
      (userRoleNumber === 6 && event.requires_vpaa) ||
      (userRoleNumber === 7 && event.requires_vpsas) ||
      (userRoleNumber === 8 && event.requires_vpaf) ||
      (userRoleNumber === 9 && event.requires_vprde)
    ) &&
    !getLatestStageApproval(event.approvals, reviewerStage),
  );
  const isCurrentReviewerStage = Boolean(reviewerStage && (currentStage === reviewerStage || isVpApprovalActive));
  const canReviewReservation = Boolean(
    role && role !== "public" && !isAdminRole && userRoleNumber !== 11 && isCurrentReviewerStage,
  );
  const currentUserId = user?.id ? Number(user.id) : undefined;
  const canMoveReservation = useMemo(
    () => canMoveApprovedReservation(event, userRoleNumber, currentUserId),
    [currentUserId, event, userRoleNumber],
  );

  const handleOpenMoveModal = useCallback(() => {
    if (canMoveReservation) setShowMoveModal(true);
  }, [canMoveReservation]);

  const handlePrintReceipt = useCallback(async () => {
    if (!event || isPrinting) return;
    setIsPrinting(true);
    try {
      await printEventReceipt(event, printedBy, baseUrl);
    } catch {
      // silently ignore — user will see an empty tab if template is missing
    } finally {
      setIsPrinting(false);
    }
  }, [baseUrl, event, isPrinting, printedBy]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const isCampusDirectorRole = userRoleNumber === 5;
  const isCdStage = currentStage === "campus_director" && isCampusDirectorRole;
  const isSubmitterDeclined = status === "DECLINED" && [1, 10, 12].includes(userRoleNumber ?? 0);

  const handleApproveConfirm = (note?: string) => {
    if (!event || !canReviewReservation) {
      setShowApproveConfirm(false);
      return;
    }
    setShowApproveConfirm(false);
    approveReservation({ reservationId: event.id, note }, {
      onSuccess: () => { onApprove?.(); onClose(); },
    });
  };

  const handleDeclineConfirm = (reason?: string) => {
    if (!event || !canReviewReservation) {
      setShowDeclineConfirm(false);
      return;
    }
    setShowDeclineConfirm(false);
    declineReservation({ reservationId: event.id, reason }, {
      onSuccess: () => { onDecline?.(); onClose(); },
    });
  };

  const handleCdConfirm = (action: "APPROVE" | "ENDORSE") => {
    if (!event || !canReviewReservation) {
      setShowCdModal(false);
      return;
    }
    setShowCdModal(false);
    approveReservation({ reservationId: event.id, action }, {
      onSuccess: () => { onApprove?.(); onClose(); },
    });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 overscroll-none">
          <motion.div
            className={`absolute inset-0 bg-black/50 ${showBackdropBlur ? "sm:bg-black/50" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          />

          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "tween", duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-4xl max-h-[calc(100dvh-0.75rem)] sm:max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col transform-gpu"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 p-3 sm:p-6 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
              <div className="flex min-w-0 items-center gap-2">
                <CalendarClock className="text-gray-800 h-5 w-5 sm:h-6 sm:w-6 shrink-0" strokeWidth={2.5} />
                <h2 className="truncate text-lg sm:text-xl font-semibold text-gray-800">Event Details</h2>
              </div>
              <Button
                onClick={onClose}
                className="p-2 cursor-pointer shadow-none bg-white rounded-full hover:bg-gray-100 focus:outline-none shrink-0"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-600" />
              </Button>
            </div>

            {loading && <ModalLoadingSkeleton />}

            {!loading && event && (
              <EventDetailsBody
                event={event}
                role={role}
                status={status}
                fromMovedEvents={fromMovedEvents}
                canMoveReservation={canMoveReservation}
                onMoveReservation={handleOpenMoveModal}
                onPrintReceipt={handlePrintReceipt}
                onShowQR={() => setShowQrModal(true)}
                isPrinting={isPrinting}
                userRoleNumber={userRoleNumber}
              />
            )}

            {/* Footer — PENDING, Campus Director stage */}
            {!loading && event && status === "PENDING" && isCdStage && canReviewReservation && (
              <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                <Button
                  onClick={() => setShowCdModal(true)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 flex-1 px-6 py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg"
                >
                  <ClipboardCheck className="w-4 h-4" />
                  Approve / Endorse
                </Button>
                <Button
                  onClick={() => setShowDeclineConfirm(true)}
                  disabled={isDeclining}
                  className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  DECLINE
                </Button>
              </div>
            )}

            {/* Footer — PENDING, non-CD approver (excludes admin and multimedia) */}
            {!loading && event && status === "PENDING" && !isCdStage && canReviewReservation && (
                <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                  <Button
                    onClick={() => setShowApproveConfirm(true)}
                    disabled={isApproving}
                    className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApproving ? (
                      <><span className="animate-spin"><svg className="h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span>APPROVING...</>
                    ) : (
                      <><CircleCheckBig className="w-4 h-4" />APPROVE</>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowDeclineConfirm(true)}
                    disabled={isDeclining}
                    className="inline-flex w-full cursor-pointer items-center justify-center flex-1 px-6 py-5 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeclining ? (
                      <><span className="animate-spin"><svg className="h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span>DECLINING...</>
                    ) : (
                      <><XCircle className="w-4 h-4" />DECLINE</>
                    )}
                  </Button>
                </div>
              )}

            {/* Footer — DECLINED for submitter */}
            {!loading && event && isSubmitterDeclined && (
              <div className="sticky bottom-0 bg-white z-10 p-4 sm:p-6 border-t border-gray-200 flex justify-center gap-3 rounded-b-xl">
                <Button
                  onClick={() => onResubmit?.(event)}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 flex-1 px-6 py-5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  Edit &amp; Resubmit
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showApproveConfirm && (
        <ConfirmationModal
          isOpen={showApproveConfirm}
          onClose={() => setShowApproveConfirm(false)}
          onConfirm={handleApproveConfirm}
          event={event}
          type="APPROVE"
        />
      )}

      {showDeclineConfirm && (
        <ConfirmationModal
          isOpen={showDeclineConfirm}
          onClose={() => setShowDeclineConfirm(false)}
          onConfirm={handleDeclineConfirm}
          event={event}
          type="DECLINE"
        />
      )}

      {showCdModal && (
        <CampusDirectorApprovalModal
          isOpen={showCdModal}
          onClose={() => setShowCdModal(false)}
          onConfirm={handleCdConfirm}
          event={event}
        />
      )}

      {showMoveModal && (
        <MoveReservationModal
          isOpen={showMoveModal}
          onClose={() => setShowMoveModal(false)}
          event={event}
          onMoved={onClose}
        />
      )}

      {showQrModal && event && (
        <QrCodeModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          event={event}
          baseUrl={baseUrl}
        />
      )}

    </>
  );
});
