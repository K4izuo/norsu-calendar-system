import React from "react";
import { MoveRight } from "lucide-react";
import { EventDetails } from "@/interface/user-props";
import { UserRole } from "@/shared/components/utils/role-colors";
import { formatDate } from "./helpers";
import { EventSummaryCard } from "./event-summary-card";
import { ReservationDetailsCard } from "./reservation-details-card";
import { RequestorCard } from "./requestor-card";
import { EquipmentCard } from "./equipment-card";
import { SignatoriesCard } from "./signatories-card";
import { AdditionalDetailsCard } from "./additional-details-card";
import { MultimediaCommentSection } from "./multimedia-comment-section";

interface EventDetailsBodyProps {
  event: EventDetails;
  role?: UserRole;
  status: "PENDING" | "APPROVED" | "DECLINED";
  fromMovedEvents?: boolean;
  onMoveReservation: () => void;
  onPrintReceipt: () => void;
  onShowQR: () => void;
  isPrinting?: boolean;
  userRoleNumber?: number;
}

export function EventDetailsBody({
  event,
  role,
  status,
  fromMovedEvents,
  onMoveReservation,
  onPrintReceipt,
  onShowQR,
  isPrinting,
  userRoleNumber,
}: EventDetailsBodyProps) {
  const showSignatoriesCard = !!(
    status !== "APPROVED" && (
      event.involves_students ||
      event.requires_vpaa ||
      event.requires_vpsas ||
      event.requires_vpaf ||
      event.requires_vprde
    )
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 sm:p-6 space-y-6">
        {fromMovedEvents && event.is_moved && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <MoveRight className="h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800">This event has been moved</p>
              <p className="text-xs text-amber-700">
                Originally scheduled for {formatDate(event.original_date)}, now on {formatDate(event.date)}
              </p>
              {event.move_reason && (
                <p className="text-xs text-amber-700 mt-0.5">Reason: {event.move_reason}</p>
              )}
            </div>
          </div>
        )}

        <EventSummaryCard
          event={event}
          role={role}
          status={status}
          onMoveReservation={onMoveReservation}
          onPrintReceipt={onPrintReceipt}
          onShowQR={onShowQR}
          isPrinting={isPrinting}
        />

        {event.requestor && (
          <RequestorCard
            requestor={event.requestor}
            proofOfRequest={event.proof_of_request}
            proofOfApproval={event.proof_of_approval}
          />
        )}

        <ReservationDetailsCard event={event} status={status} />

        <EquipmentCard equipment={event.equipment} />

        {userRoleNumber === 11 && (
          <MultimediaCommentSection event={event} />
        )}

        {userRoleNumber !== 11 && event.multimedia_comment && (
          <div className="bg-white text-card-foreground border border-border rounded-lg p-6">
            <h3 className="text-base font-medium text-gray-700 mb-2">Equipment Remarks</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.multimedia_comment}</p>
          </div>
        )}

        {showSignatoriesCard && <SignatoriesCard event={event} />}

        <AdditionalDetailsCard event={event} />
      </div>
    </div>
  );
}
