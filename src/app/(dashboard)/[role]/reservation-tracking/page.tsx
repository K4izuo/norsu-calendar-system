"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, Plus, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  useReservations,
  useAssets,
} from "@/features/calendar/services/reservation-service";
import { useAuth } from "@/shared/components/context/auth-context";
import { usePageReady } from "@/shared/components/context/page-loading-context";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ReserveEventModal } from "@/features/reservations/components/reserve-event-modal";
import { ReservationSuccessModal } from "@/features/reservations/components/reservation-success-modal";
import type { VenueData } from "@/features/calendar/components/campus-map";

// Leaflet uses the browser window — must be loaded client-side only
const CampusMap = dynamic(
  () => import("@/features/calendar/components/campus-map"),
  {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full rounded-lg" />,
  },
);

const PATH_ROLE_MAP: Record<string, number> = {
  dean: 1,
  staff: 2,
  admin: 3,
  "student-director": 4,
  "campus-director": 5,
  vpaa: 6,
  vpsas: 7,
  vpaf: 8,
  vprde: 9,
  head: 10,
  multimedia: 11,
  "university-president": 12,
};

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
  const userRoleNumber = PATH_ROLE_MAP[role] ?? 3;
  const { user } = useAuth();
  const userOffice = user?.office;

  const focusedId = searchParams.get("id") ? Number(searchParams.get("id")) : null;

  const [search, setSearch] = useState("");
  const [newReservationOpen, setNewReservationOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const { reservations, loading, isFetching, error } = useReservations();
  usePageReady(loading, isFetching);

  const assetIds = useMemo(
    () => [...new Set(reservations.map((r) => r.asset_id).filter(Boolean))],
    [reservations],
  );
  const { assets } = useAssets(assetIds);

  // Build per-venue reservation counts for the map markers
  const venueData = useMemo<VenueData[]>(() => {
    const map = new Map<number, VenueData>();

    for (const [id, asset] of assets) {
      map.set(id, { asset, activeCount: 0, pendingCount: 0 });
    }

    for (const res of reservations) {
      const venue = map.get(res.asset_id);
      if (!venue) continue;
      const status = res.status?.toLowerCase();
      if (status === "approved") venue.activeCount++;
      else if (status === "pending") venue.pendingCount++;
    }

    return Array.from(map.values());
  }, [assets, reservations]);

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
    let events = focusedId
      ? allEvents.filter((e) => e.reservationId === focusedId)
      : allEvents;
    if (search.trim()) {
      const q = search.toLowerCase();
      events = events.filter(
        (e) =>
          e.reservationTitle.toLowerCase().includes(q) ||
          (STAGE_LABELS[e.stage.toLowerCase()] ?? e.stage).toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q),
      );
    }
    return events;
  }, [allEvents, focusedId, search]);

  const handleReservationSuccess = useCallback(() => {
    setNewReservationOpen(false);
    setSuccessOpen(true);
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Reservation Tracking" },
        ]}
      />

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Event Reservation Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Live venue map, approval chain, and reservation flow
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4 pointer-events-none" />
            <Input
              className="pl-9 h-9 w-56 text-sm bg-white"
              placeholder="Search reservation or guest"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            Filters
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setNewReservationOpen(true)}
          >
            <Plus className="size-3.5" />
            New Reservation
          </Button>
        </div>
      </div>

      {focusedId && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
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
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Live Venue Tracking */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-gray-800">Live Venue Tracking</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
              Active
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
              Available
            </span>
          </div>
        </div>

        {/* Map container — explicit height required by Leaflet */}
        <div className="mx-4 mb-4 rounded-lg overflow-hidden" style={{ height: "320px" }}>
          <CampusMap venues={venueData} />
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
              {search
                ? "No matching approval events found."
                : "No approval events yet."}
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

      {/* Modals */}
      <ReserveEventModal
        isOpen={newReservationOpen}
        onClose={() => setNewReservationOpen(false)}
        onReservationSuccess={handleReservationSuccess}
        userRole={userRoleNumber}
        userOffice={userOffice}
      />

      <ReservationSuccessModal
        isOpen={successOpen}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}
