import React from "react";
import { ReservationApproval } from "@/interface/user-props";
import { getApprovalBadge } from "./helpers";

export function SignatoryRow({ label, approval }: { label: string; approval?: ReservationApproval }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1">
      <span className="text-sm text-gray-600 min-w-32">{label}</span>
      <div className="flex-1">{getApprovalBadge(approval)}</div>
    </div>
  );
}
