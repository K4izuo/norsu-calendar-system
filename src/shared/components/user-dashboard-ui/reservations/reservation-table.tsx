"use client";

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Input } from "@/shared/components/ui/input"
import { Search, MoreVertical, CircleCheckBig, Clock, XCircle } from "lucide-react"
import { EventInfoModal } from "@/features/calendar/components/event-info-modal"
import { getPhilippineDateTime } from "@/features/calendar/utils/timezone-utils"
import type { EventDetails } from "@/interface/user-props"
import { formatTime } from "@/core/lib/utils"
import { getReviewStatusForEvent } from "@/features/reservations/utils/reservation-review"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

const INTERNAL_RESERVATION_ROLE_NUMBERS = new Set([3, 4, 5, 6, 7, 8, 9, 12]);
const STATUS_ORDER: Record<EventDetails["registration_status"], number> = {
  PENDING: 0,
  APPROVED: 1,
  DECLINED: 2,
};

const getPhilippineTodayString = () => {
  const { year, month, day } = getPhilippineDateTime();
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const getTimeSortValue = (time: string) => {
  const [hours = "0", minutes = "0", seconds = "0"] = time.split(":");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

interface ReservationsTableProps {
  events: EventDetails[];
  isLoading?: boolean;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  userRoleNumber?: number;
  showReviewStatus?: boolean;
  onResubmit?: (event: EventDetails) => void;
}

export function ReservationsTable({
  events,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  userRoleNumber,
  showReviewStatus = false,
  onResubmit,
}: ReservationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined)

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter and sort reservations based on search query, status filter, and event schedule
  const filteredEvents = useMemo(() => {
    const today = getPhilippineTodayString();

    // First, filter by search query and status
    const filtered = events.filter((event) => {
      const eventStatus = showReviewStatus
        ? getReviewStatusForEvent(event, userRoleNumber)
        : event.registration_status;
      const matchesSearch = event.title_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || eventStatus === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const statusA = STATUS_ORDER[showReviewStatus ? getReviewStatusForEvent(a, userRoleNumber) : a.registration_status];
      const statusB = STATUS_ORDER[showReviewStatus ? getReviewStatusForEvent(b, userRoleNumber) : b.registration_status];

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      const isUpcomingA = a.date >= today;
      const isUpcomingB = b.date >= today;

      if (isUpcomingA !== isUpcomingB) {
        return isUpcomingA ? -1 : 1;
      }

      const dateCompare = isUpcomingA
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);

      if (dateCompare !== 0) {
        return dateCompare;
      }

      return getTimeSortValue(a.time_start) - getTimeSortValue(b.time_start);
    });
  }, [events, searchQuery, showReviewStatus, statusFilter, userRoleNumber]);

  const handleRowClick = (event: EventDetails) => {
    setSelectedEvent(event)
    setEventInfoModalOpen(true)
  }

  if (isLoading && events.length === 0) {
    return null;
  }

  return (
    <>
      <div className="w-full rounded-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-32.5 shadow-xs h-11 cursor-pointer bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="all">All Status</SelectItem>
                <SelectItem className="cursor-pointer" value="pending">PENDING</SelectItem>
                <SelectItem className="cursor-pointer" value="approved">APPROVED</SelectItem>
                <SelectItem className="cursor-pointer" value="declined">DECLINED</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-border rounded-md text-sm"
              />
            </div>
            <button className="p-2 hover:bg-muted rounded-md transition-colors">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="w-full rounded-md">
          <div className="rounded-md text-card-foreground border shadow-xs overflow-hidden overflow-x-auto">
            {filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center py-20 bg-white">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No reservations found</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchQuery ? "Try a different search term" : "Create your first reservation to get started"}
                  </p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f1f2f4] hover:bg-gray-100">
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      Event name
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      Date
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      Time start
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      Time end
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      {showReviewStatus ? "My action" : "Status"}
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      Asset name
                    </TableHead>
                    {/* <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      People tag
                    </TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {filteredEvents.map((event) => {
                    const displayStatus = showReviewStatus
                      ? getReviewStatusForEvent(event, userRoleNumber)
                      : event.registration_status;

                    return (
                      <TableRow
                        key={event.id}
                        onClick={() => handleRowClick(event)}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                          {event.title_name
                            ? event.title_name.length > 50
                              ? `${event.title_name.slice(0, 50)}...`
                              : event.title_name
                            : "Untitled Event"}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-foreground">
                          {formatDate(event.date)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-foreground">
                          {formatTime(event.time_start)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-foreground">
                          {formatTime(event.time_end)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-foreground">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            displayStatus === 'APPROVED' ? 'bg-green-100 text-green-800 border border-green-400' :
                            displayStatus === 'PENDING'  ? 'bg-yellow-100 text-yellow-800 border border-yellow-400' :
                                                            'bg-red-100 text-red-800 border border-red-400'
                          }`}>
                            {displayStatus === 'APPROVED' && <CircleCheckBig className="h-3.5 w-3.5" />}
                            {displayStatus === 'PENDING'  && <Clock className="h-3.5 w-3.5" />}
                            {displayStatus === 'DECLINED' && <XCircle className="h-3.5 w-3.5" />}
                            {displayStatus}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-sm text-foreground">
                          {event.asset.asset_name
                            ? event.asset.asset_name.length > 30
                              ? `${event.asset.asset_name.slice(0, 30)}...`
                              : event.asset.asset_name
                            : "Not specified"}
                        </TableCell>
                        {/* <TableCell className="px-6 py-4 text-center text-sm text-foreground">
                          {event.people_tag.length}
                        </TableCell> */}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <EventInfoModal
        role={INTERNAL_RESERVATION_ROLE_NUMBERS.has(userRoleNumber ?? 0) ? "admin" : "public"}
        userRoleNumber={userRoleNumber}
        isOpen={eventInfoModalOpen}
        onClose={() => setEventInfoModalOpen(false)}
        event={selectedEvent}
        showBackdropBlur={true}
        onResubmit={onResubmit}
      />
    </>
  )
}
