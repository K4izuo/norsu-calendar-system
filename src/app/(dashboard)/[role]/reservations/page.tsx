"use client";

import { useState, useMemo } from "react";
import { ReservationsTable } from "@/shared/components/user-dashboard-ui/reservations/reservation-table";
import { ReserveEventModal } from "@/features/reservations/components/reserve-event-modal";
import { EventDetails } from "@/interface/user-props";
import {
  useReservations,
  useAssets,
  useGetQueue,
} from "@/features/calendar/services/reservation-service";
import { PageBreadcrumb } from "@/shared/components/ui/page-breadcrumb";
import { PageStatCard } from "@/shared/components/ui/page-stat-card";
import { CalendarDays, Clock, CircleCheck, XCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useAuth } from "@/shared/components/context/auth-context";
import { usePageReady } from "@/shared/components/context/page-loading-context";

const PATH_ROLE_MAP: Record<string, number> = {
  dean:                   1,
  staff:                  2,
  admin:                  3,
  "student-director":     4,
  "campus-director":      5,
  vpaa:                   6,
  vpsas:                  7,
  vpaf:                   8,
  vprde:                  9,
  head:                   10,
  multimedia:             11,
  "university-president": 12,
};

export default function ReservationsPage() {
  const params = useParams();
  const role = params.role as string;
  const userRoleNumber = PATH_ROLE_MAP[role] ?? 3;
  const { user } = useAuth();
  const userOffice = user?.office;

  const [statusFilter, setStatusFilter] = useState("pending");
  const [resubmitEvent, setResubmitEvent] = useState<EventDetails | undefined>();

  // Admin and Multimedia see all reservations; every other role uses the queue
  const isAdmin = userRoleNumber === 3 || userRoleNumber === 11;

  const { reservations, error: resError, loading: resLoading, isFetching: resFetching } = useReservations();
  const { queue, error: queueError, loading: queueLoading, isFetching: queueFetching } = useGetQueue();

  const sourceList = isAdmin ? reservations : queue;
  const loading = isAdmin ? resLoading : queueLoading;
  const isFetching = isAdmin ? resFetching : queueFetching;
  const error = isAdmin ? resError : queueError;

  usePageReady(loading, isFetching);

  const total    = sourceList.length;
  const pending  = sourceList.filter(r => r.status.toUpperCase() === "PENDING").length;
  const approved = sourceList.filter(r => r.status.toUpperCase() === "APPROVED").length;
  const declined = sourceList.filter(r => r.status.toUpperCase() === "DECLINED").length;

  const assetIds = useMemo(() => [...new Set(sourceList.map(r => r.asset_id))], [sourceList]);
  const { assets } = useAssets(assetIds);

  const events: EventDetails[] = useMemo(() => {
    return sourceList.map(reservation => {
      const asset = assets.get(reservation.asset_id);
      return {
        id: reservation.id,
        title_name: reservation.title_name,
        date: reservation.date,
        time_start: reservation.time_start,
        time_end: reservation.time_end,
        asset: {
          id: reservation.asset_id,
          asset_name: asset?.asset_name || `Asset #${reservation.asset_id}`,
          capacity: asset?.capacity || 0,
        },
        category: reservation.category,
        other_category: reservation.other_category,
        info_type: reservation.info_type,
        description: reservation.description,
        people_tag: reservation.people_tag.split(", "),
        range: reservation.range,
        registration_status: reservation.status.toUpperCase() as "PENDING" | "APPROVED" | "DECLINED",
        registration_deadline: reservation.date,
        reserved_by_user: reservation.reserved_by_user,
        reserve_by_user: reservation.reserved_by_user
          ? `${(reservation.reserved_by_user as { first_name: string; last_name: string }).first_name} ${(reservation.reserved_by_user as { first_name: string; last_name: string }).last_name}`
          : "Unknown User",
        approved_by_user_details: reservation.approved_by_user,
        declined_by_user_details: reservation.declined_by_user,
        equipment: reservation.equipment,
        outsource: reservation.outsource,
        guests: reservation.guests,
        involves_students: reservation.involves_students,
        requires_vpaa: reservation.requires_vpaa,
        requires_vpsas: reservation.requires_vpsas,
        requires_vpaf: reservation.requires_vpaf,
        requires_vprde: reservation.requires_vprde,
        requestor: reservation.requestor,
        requestor_type: reservation.requestor_type,
        student_sub_type: reservation.student_sub_type,
        student_org_name: reservation.student_org_name,
        csg_name: reservation.csg_name,
        requestor_tagged: reservation.requestor_tagged,
        current_stage: reservation.current_stage,
        declined_at_stage: reservation.declined_at_stage,
        campus_director_action: reservation.campus_director_action,
        approvals: reservation.approvals,
        multimedia_comment: reservation.multimedia_comment,
      };
    });
  }, [sourceList, assets]);

  const isInitialLoading = loading && sourceList.length === 0;

  return (
    <div className="flex flex-col items-start self-stretch h-full">
      <PageBreadcrumb
        items={[
          { label: "Dashboard", href: `/${role}/dashboard` },
          { label: "Reservations" },
        ]}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 w-full">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col items-start gap-6 flex-1 self-stretch min-h-0">
        {!isInitialLoading && (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PageStatCard title="Total Reservations" value={total}    subLabel="All submitted reservations" icon={CalendarDays} color="gray"  />
            <PageStatCard title="Pending"             value={pending}  subLabel="Awaiting approval"          icon={Clock}        color="amber" />
            <PageStatCard title="Approved"            value={approved} subLabel="Confirmed reservations"     icon={CircleCheck}  color="green" />
            <PageStatCard title="Declined"            value={declined} subLabel="Rejected reservations"      icon={XCircle}      color="red"   />
          </div>
        )}

        <div className="flex-1 min-h-0 w-full">
          <ReservationsTable
            events={events}
            isLoading={loading}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            userRoleNumber={userRoleNumber}
            onResubmit={(event) => setResubmitEvent(event)}
          />
        </div>
      </div>

      {/* Resubmit modal — opens pre-filled for Dean/HO on declined reservations */}
      {resubmitEvent && (
        <ReserveEventModal
          isOpen={!!resubmitEvent}
          onClose={() => setResubmitEvent(undefined)}
          resubmitMode={true}
          eventData={resubmitEvent}
          userRole={userRoleNumber}
          userOffice={userOffice}
        />
      )}
    </div>
  );
}
