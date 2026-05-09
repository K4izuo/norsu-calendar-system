import type { EventDetails, ReservationApproval } from "@/interface/user-props";

const MOVE_APPROVER_STAGE_BY_ROLE: Record<number, string> = {
  5: "campus_director",
  12: "university_president",
};

const FINAL_APPROVAL_ACTIONS = new Set(["APPROVE", "APPROVED"]);

const toNumber = (value: number | string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const findLatestFinalMoveApproval = (
  approvals: ReservationApproval[] | undefined,
): ReservationApproval | undefined => {
  if (!approvals?.length) return undefined;

  return approvals.reduce<ReservationApproval | undefined>((latest, approval) => {
    if (!Object.values(MOVE_APPROVER_STAGE_BY_ROLE).includes(approval.stage)) {
      return latest;
    }

    if (!FINAL_APPROVAL_ACTIONS.has(approval.action.toUpperCase())) {
      return latest;
    }

    if (!latest) return approval;

    return new Date(approval.created_at).getTime() > new Date(latest.created_at).getTime()
      ? approval
      : latest;
  }, undefined);
};

export function canMoveApprovedReservation(
  event: EventDetails | undefined,
  userRoleNumber: number | undefined,
  currentUserId: number | string | undefined,
): boolean {
  if (!event || event.registration_status !== "APPROVED") return false;

  const expectedStage = userRoleNumber ? MOVE_APPROVER_STAGE_BY_ROLE[userRoleNumber] : undefined;
  const normalizedCurrentUserId = toNumber(currentUserId);

  if (!expectedStage || normalizedCurrentUserId === undefined) return false;

  const finalApproval = findLatestFinalMoveApproval(event.approvals);
  if (finalApproval) {
    return finalApproval.stage === expectedStage && toNumber(finalApproval.user_id) === normalizedCurrentUserId;
  }

  return event.approved_by_user_details?.id === normalizedCurrentUserId;
}
