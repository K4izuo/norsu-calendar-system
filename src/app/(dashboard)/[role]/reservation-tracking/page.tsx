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
  APPROVED: { dotClass: "bg-green-500",  bgClass: "bg-green-50",  label: "Approved"  },
  ENDORSE:  { dotClass: "bg-amber-500",  bgClass: "bg-amber-50",  label: "Endorsed"  },
  APPROVE:  { dotClass: "bg-blue-500",   bgClass: "bg-blue-50",   label: "Forwarded" },
  DECLINED: { dotClass: "bg-red-500",    bgClass: "bg-red-50",    label: "Declined"  },
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

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr} hr ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function TimelineItem({
  event,
  venueName,
}: {
  event: FlatApprovalEvent;
  venueName: string;
}) {
  const config = ACTION_CONFIG[event.action] ?? ACTION_CONFIG.APPROVED;
  const stageLabel = STAGE_LABELS[event.stage.toLowerCase().trim()] ?? event.stage;
  const title = `${stageLabel} ${config.label}`;
  const description = event.actor
    ? `${event.reservationTitle} — by ${event.actor}`
    : event.reservationTitle;

  return (
    <div className="flex items-start gap-3 py-3.5">
      <div
        className={`mt-0.5 w-9 h-9 rounded-full ${config.bgClass} flex items-center justify-center shrink-0`}
      >
        <div className={`w-3 h-3 rounded-full ${config.dotClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
        {venueName && (
          <p className="text-xs text-gray-400 mt-0.5">at {venueName}</p>
        )}
        {event.reason && (
          <p className="text-xs text-gray-400 mt-0.5 italic truncate">
            &ldquo;{event.reason}&rdquo;
          </p>
        )}
        <p className="text-xs text-gray-400 mt-1">{getRelativeTime(event.timestamp)}</p>
      </div>
    </div>
  );
}

export default function ReservationTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = params.role as string;

  const focusedId = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const { reservations, loading, isFetching, error } = useReservations();
  usePageReady(loading, isFetching);

  const assetIds = useMemo(
    () => [...new Set(reservations.map((r) => r.asset_id).filter(Boolean))],
    [reservations],
  );
  const { assets } = useAssets(assetIds);

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
            Showing tracking for reservation <span className="font-semibold">#{focusedId}</span>
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
          <CampusMap />
        </div>
      </div>

      {/* Reservation Timeline */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">Reservation Timeline</span>
          <button className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
            See all
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="px-5 divide-y divide-gray-50">
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
            filteredEvents.slice(0, 8).map((event) => (
              <TimelineItem
                key={event.key}
                event={event}
                venueName={assets.get(event.assetId)?.asset_name ?? ""}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
