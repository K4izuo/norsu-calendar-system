import type {
  EventDetails,
  ReservationApproval,
  ReservationWithRelations,
} from "@/interface/user-props";

export type ReservationReviewStatus = "PENDING" | "APPROVED" | "DECLINED";

const REVIEW_STAGE_BY_ROLE: Record<number, string> = {
  4: "student_director",
  5: "campus_director",
  6: "vpaa",
  7: "vpsas",
  8: "vpaf",
  9: "vprde",
  12: "university_president",
};

const APPROVAL_ACTIONS = new Set(["APPROVED", "APPROVE", "ENDORSE"]);

const normalizeStatus = (status?: string): ReservationReviewStatus => {
  const normalized = status?.toUpperCase();
  if (normalized === "APPROVED" || normalized === "DECLINED") return normalized;
  return "PENDING";
};

export const isReviewRole = (roleNumber?: number) =>
  typeof roleNumber === "number" && roleNumber in REVIEW_STAGE_BY_ROLE;

export const getReviewStageForRole = (roleNumber?: number) =>
  typeof roleNumber === "number" ? REVIEW_STAGE_BY_ROLE[roleNumber] : undefined;

export const getLatestStageApproval = (
  approvals: ReservationApproval[] | undefined,
  stage: string,
) => {
  return approvals
    ?.filter((approval) => approval.stage === stage)
    .reduce<ReservationApproval | undefined>((latest, approval) => {
      if (!latest) return approval;

      const latestTime = Date.parse(latest.created_at);
      const approvalTime = Date.parse(approval.created_at);

      if (Number.isNaN(approvalTime)) return latest;
      if (Number.isNaN(latestTime) || approvalTime >= latestTime) return approval;

      return latest;
    }, undefined);
};

const getStatusFromApproval = (approval?: ReservationApproval): ReservationReviewStatus | undefined => {
  if (!approval) return undefined;
  if (approval.action === "DECLINED") return "DECLINED";
  if (APPROVAL_ACTIONS.has(approval.action)) return "APPROVED";
  return undefined;
};

export const getReviewStatusForReservation = (
  reservation: Pick<
    ReservationWithRelations,
    "status" | "current_stage" | "declined_at_stage" | "campus_director_action" | "approvals"
  >,
  roleNumber?: number,
): ReservationReviewStatus => {
  const stage = getReviewStageForRole(roleNumber);
  const status = normalizeStatus(reservation.status);

  if (!stage) return status;
  if (status === "PENDING" && reservation.current_stage === stage) return "PENDING";
  if (status === "DECLINED" && reservation.declined_at_stage === stage) return "DECLINED";

  return getStatusFromApproval(getLatestStageApproval(reservation.approvals, stage)) ?? status;
};

export const getReviewStatusForEvent = (
  event: Pick<
    EventDetails,
    "registration_status" | "current_stage" | "declined_at_stage" | "campus_director_action" | "approvals"
  >,
  roleNumber?: number,
): ReservationReviewStatus => {
  const stage = getReviewStageForRole(roleNumber);
  const status = event.registration_status;

  if (!stage) return status;
  if (status === "PENDING" && event.current_stage === stage) return "PENDING";
  if (status === "DECLINED" && event.declined_at_stage === stage) return "DECLINED";

  return getStatusFromApproval(getLatestStageApproval(event.approvals, stage)) ?? status;
};

export const isReservationReviewRelevant = (
  reservation: Pick<
    ReservationWithRelations,
    "status" | "current_stage" | "declined_at_stage" | "campus_director_action" | "approvals"
  >,
  roleNumber?: number,
) => {
  const stage = getReviewStageForRole(roleNumber);
  if (!stage) return false;

  const status = normalizeStatus(reservation.status);
  if (status === "PENDING" && reservation.current_stage === stage) return true;
  if (status === "DECLINED" && reservation.declined_at_stage === stage) return true;
  if (status === "APPROVED" && stage === "campus_director") {
    return reservation.campus_director_action === "approve" || reservation.current_stage === stage;
  }
  if (status === "APPROVED" && stage === "university_president") {
    return reservation.campus_director_action === "endorse" || reservation.current_stage === stage;
  }

  return Boolean(getStatusFromApproval(getLatestStageApproval(reservation.approvals, stage)));
};
