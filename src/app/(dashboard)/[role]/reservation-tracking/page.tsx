"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Building2, ChevronRight, Landmark } from "lucide-react";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  useReservations,
  useAssets,
} from "@/features/calendar/services/reservation-service";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type {
  ApprovalMapSegment,
  ApprovalSegmentStatus,
} from "@/features/calendar/components/campus-map";
import type { ReservationWithRelations } from "@/features/reservations/types/reservation.types";
import { getRouteParam } from "@/core/lib/route-params";

// MapLibre uses the browser window, so load the map client-side only.
const CampusMap = dynamic(
  () => import("@/features/calendar/components/campus-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-lg" />,
  },
);

const STAGE_LABELS: Record<string, string> = {
  "student-director": "Student Director",
  student_director: "Student Director",
  vpaa: "VPAA",
  vpsas: "VPSAS",
  vpaf: "VPAF",
  vprde: "VPRDE",
  "campus-director": "Campus Director",
  campus_director: "Campus Director",
  "university-president": "University President",
  university_president: "University President",
  dean: "Dean",
  staff: "Staff",
  head: "Head of Office",
};

type ActionType = "APPROVED" | "DECLINED" | "APPROVE" | "ENDORSE";

const ACTION_CONFIG: Record<ActionType, { dotClass: string; bgClass: string; label: string }> = {
  APPROVED: { dotClass: "bg-green-500", bgClass: "bg-green-50", label: "Approved" },
  ENDORSE: { dotClass: "bg-amber-500", bgClass: "bg-amber-50", label: "Endorsed" },
  APPROVE: { dotClass: "bg-blue-500", bgClass: "bg-blue-50", label: "Forwarded" },
  DECLINED: { dotClass: "bg-red-500", bgClass: "bg-red-50", label: "Declined" },
};

type FlatApprovalEvent = {
  key: string;
  reservationId: number;
  reservationTitle: string;
  assetId: number;
  stage: string;
  action: ActionType;
  actor: string;
  reason?: string | null;
  timestamp: string;
};

function getFormattedDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const datePart = date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
  const timePart = date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${datePart} at ${timePart}`;
}

function TimelineItem({
  event,
  venueName,
  isFirst,
  isLast,
}: {
  event: FlatApprovalEvent;
  venueName: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const config = ACTION_CONFIG[event.action] ?? ACTION_CONFIG.APPROVED;
  const stageLabel = STAGE_LABELS[event.stage.toLowerCase().trim()] ?? event.stage;
  const title = `${stageLabel} ${config.label}`;
  const description = event.actor
    ? `${event.reservationTitle} — by ${event.actor}`
    : event.reservationTitle;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center shrink-0">
        {/* segment above the circle — matches the right column's top padding */}
        <div className={`w-px h-3.5 ${isFirst ? "invisible" : "bg-gray-200"}`} />
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
          <div className={`w-2.5 h-2.5 rounded-full ${config.dotClass}`} />
        </div>
        {/* segment below the circle — fills to item bottom, or fixed to venue midpoint on last item */}
        <div className={`w-px bg-gray-200 ${isLast ? "h-8" : "flex-1"}`} />
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? "pt-3.5" : "py-3.5"}`}>
        <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
        {event.reason && (
          <p className="text-xs text-gray-400 mt-0.5 italic truncate">
            &ldquo;{event.reason}&rdquo;
          </p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">
          {venueName ? `${venueName} on ` : ""}{getFormattedDateTime(event.timestamp)}
        </p>
      </div>
    </div>
  );
}

function normalizeStage(stage: string): string {
  return stage.toLowerCase().replace(/-/g, "_");
}

function buildApprovalSegments(
  reservation: ReservationWithRelations,
): ApprovalMapSegment[] {
  const approvals = reservation.approvals ?? [];
  const currentStage = normalizeStage(reservation.current_stage ?? "");

  // Build the expected stage chain based on the reservation's signatory flags.
  const stages: string[] = ["dean"];
  if (reservation.involves_students) stages.push("student_director");
  if (reservation.requires_vpaa) stages.push("vpaa");
  if (reservation.requires_vpsas) stages.push("vpsas");
  if (reservation.requires_vpaf) stages.push("vpaf");
  if (reservation.requires_vprde) stages.push("vprde");
  stages.push("campus_director");
  // Only show the line to University President if the Campus Director chose to endorse.
  if (reservation.campus_director_action === "endorse") {
    stages.push("university_president");
  }

  const getNodeStatus = (
    stage: string,
  ): "completed" | "active" | "pending" | "declined" => {
    if (stage === "dean") return "completed"; // dean always submitted
    const approval = approvals.find(
      (a) => normalizeStage(a.stage) === stage,
    );
    if (approval) {
      return approval.action === "DECLINED" ? "declined" : "completed";
    }
    if (stage === currentStage) return "active";
    return "pending";
  };

  const segments: ApprovalMapSegment[] = [];
  let foundDeclined = false;

  for (let i = 0; i < stages.length - 1; i++) {
    if (foundDeclined) {
      segments.push({
        fromStage: stages[i],
        toStage: stages[i + 1],
        status: "pending",
      });
      continue;
    }

    const fromStatus = getNodeStatus(stages[i]);
    const toStatus = getNodeStatus(stages[i + 1]);

    let status: ApprovalSegmentStatus;
    if (toStatus === "declined") {
      status = "declined";
      foundDeclined = true;
    } else if (fromStatus === "completed" && toStatus === "active") {
      status = "active";
    } else if (fromStatus === "completed" && toStatus === "completed") {
      status = "completed";
    } else {
      status = "pending";
    }

    segments.push({ fromStage: stages[i], toStage: stages[i + 1], status });
  }

  return segments;
}

export default function ReservationTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = getRouteParam(params, "role");

  const focusedId = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const { reservations, loading, isFetching, error } = useReservations();
  usePageReady(loading, isFetching);

  const focusedReservation = useMemo(
    () => reservations.find((r) => r.id === focusedId) as ReservationWithRelations | undefined,
    [reservations, focusedId],
  );

  const focusedTitle = focusedReservation?.title_name ?? `#${focusedId}`;

  const assetIds = useMemo(
    () => [...new Set(reservations.map((r) => r.asset_id).filter(Boolean))],
    [reservations],
  );
  const { assets } = useAssets(assetIds);

  // Compute the approval path segments for the focused reservation so the
  // campus map can draw the animated track line between offices.
  const approvalSegments = useMemo<ApprovalMapSegment[]>(() => {
    if (!focusedReservation) return [];
    return buildApprovalSegments(focusedReservation);
  }, [focusedReservation]);

  // Flatten all approval records into a sorted timeline
  const allEvents = useMemo<FlatApprovalEvent[]>(() => {
    const events: FlatApprovalEvent[] = [];
    for (const res of reservations) {
      if (!res.approvals?.length) continue;
      for (const approval of res.approvals) {
        const actor = approval.user
          ? `${approval.user.first_name} ${approval.user.last_name}`.trim()
          : "";
        events.push({
          key: `${res.id}-${approval.id}`,
          reservationId: res.id,
          reservationTitle: res.title_name,
          assetId: res.asset_id,
          stage: approval.stage,
          action: approval.action as ActionType,
          actor,
          reason: approval.reason,
          timestamp: approval.created_at,
        });
      }
    }
    return events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [reservations]);

  const filteredEvents = useMemo(() => {
    return focusedId
      ? allEvents.filter((e) => e.reservationId === focusedId)
      : allEvents;
  }, [allEvents, focusedId]);

  return (
    <div className="flex flex-col">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Reservation Tracking" },
        ]}
      />

      {focusedId && (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <button
            onClick={() => router.push(`/${role}/reservation-tracking`)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All reservations
          </button>
          <span className="text-blue-300">|</span>
          <p className="text-sm text-blue-700">
            Showing tracking for <span className="font-semibold">{focusedTitle}</span>
          </p>
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Campus Office Locations */}
      <div className="mb-5 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex flex-col gap-2 px-5 pt-4 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="size-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Campus Office Locations</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            {focusedId && approvalSegments.length > 0 && (
              <span className="flex items-center gap-2 mr-1">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-green-500 rounded" />
                  <span>Approved</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-amber-500 rounded" />
                  <span>Active</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-gray-300 rounded border-dashed border" />
                  <span>Pending</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-4 h-0.5 bg-red-500 rounded" />
                  <span>Declined</span>
                </span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Building2 className="size-3.5 text-blue-600" />
              Office
            </span>
            <span className="flex items-center gap-1">
              <Landmark className="size-3.5 text-blue-600" />
              Executive Office
            </span>
          </div>
        </div>

        {/* Map container — explicit height required by MapLibre */}
        <div className="mx-4 mb-4 rounded-lg overflow-hidden" style={{ height: "380px" }}>
          <CampusMap approvalSegments={approvalSegments} />
        </div>
      </div>

      {/* Reservation Timeline */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-input">
          <span className="text-sm font-semibold text-gray-800">Reservation Timeline</span>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
            See all
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="px-5 pb-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 py-3.5">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              No approval events yet.
            </div>
          ) : (
            filteredEvents.slice(0, 8).map((event, index, arr) => (
              <TimelineItem
                key={event.key}
                event={event}
                venueName={assets.get(event.assetId)?.asset_name ?? ""}
                isFirst={index === 0}
                isLast={index === arr.length - 1}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
