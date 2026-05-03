import React from "react";
import { CircleCheckBig, Clock, XCircle } from "lucide-react";
import { EventDetails, ReservationApproval } from "@/interface/user-props";

export const getStatus = (event: EventDetails): "PENDING" | "APPROVED" | "DECLINED" => {
  if (!event.registration_status) return "PENDING";
  const status = event.registration_status.toUpperCase();
  if (status === "OPEN") return "APPROVED";
  if (status === "CLOSED") return "DECLINED";
  if (status === "PENDING" || status === "APPROVED" || status === "DECLINED") {
    return status as "PENDING" | "APPROVED" | "DECLINED";
  }
  return "PENDING";
};

export const getStatusColor = (status: "PENDING" | "APPROVED" | "DECLINED") => {
  if (status === "APPROVED") return "bg-green-100 text-green-800 border border-green-400";
  if (status === "PENDING") return "bg-yellow-100 text-yellow-800 border border-yellow-400";
  if (status === "DECLINED") return "bg-red-100 text-red-800 border border-red-400";
  return "bg-gray-100 text-gray-800 border border-gray-400";
};

export const getStatusIcon = (status: "PENDING" | "APPROVED" | "DECLINED") => {
  if (status === "APPROVED") return <CircleCheckBig className="h-3.5 w-3.5" />;
  if (status === "PENDING") return <Clock className="h-3.5 w-3.5" />;
  if (status === "DECLINED") return <XCircle className="h-3.5 w-3.5" />;
  return null;
};

export const getStartedAgo = (eventDate: string, eventTime: string): string | null => {
  if (!eventDate || !eventTime) return null;
  try {
    const eventStart = new Date(eventDate + " " + eventTime);
    if (isNaN(eventStart.getTime())) return null;
    const now = new Date();
    if (eventStart > now) {
      return eventStart.toDateString() === now.toDateString() ? `Starts at ${eventTime}` : "Upcoming";
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

export const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return dateStr;
  }
};

export function getApprovalBadge(approval?: ReservationApproval) {
  if (!approval) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
  }
  const action = approval.action;
  if (action === "APPROVED" || action === "APPROVE" || action === "ENDORSE") {
    const label = action === "ENDORSE" ? "Endorsed" : "Approved";
    const approverName = approval.user
      ? `${approval.user.first_name} ${approval.user.last_name}`
      : null;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{label}</span>
        {approverName && <span className="text-xs text-gray-500">by {approverName}</span>}
        <span className="text-xs text-gray-400">{new Date(approval.created_at).toLocaleDateString()}</span>
      </div>
    );
  }
  if (action === "DECLINED") {
    const approverName = approval.user
      ? `${approval.user.first_name} ${approval.user.last_name}`
      : null;
    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Declined</span>
          {approverName && <span className="text-xs text-gray-500">by {approverName}</span>}
        </div>
        {approval.reason && <span className="text-xs text-gray-500 pl-1">Reason: {approval.reason}</span>}
      </div>
    );
  }
  return null;
}
