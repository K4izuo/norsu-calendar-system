"use client";

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical } from "lucide-react"
import { EventInfoModal } from "@/components/modal/event-info-modal"
import { EventDetails } from "@/interface/user-props"

interface ReservationsTableProps {
  events: EventDetails[];
  isLoading?: boolean;
}

export function ReservationsTable({ events }: ReservationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined)
  const [eventInfoLoading, setEventInfoLoading] = useState(false)

  // Filter and sort reservations based on search query and date
  const filteredEvents = useMemo(() => {
    // First, filter by search query
    const filtered = events.filter((event) =>
      event.title_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then, sort by status first (PENDING first), then by date descending
    return filtered.sort((a, b) => {
      // Priority order: PENDING > APPROVED > DECLINED
      const statusOrder = { PENDING: 0, APPROVED: 1, DECLINED: 2 };
      const statusA = statusOrder[a.registration_status];
      const statusB = statusOrder[b.registration_status];

      // If statuses are different, sort by status
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // If statuses are the same, sort by date in descending order (future → now → past)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [events, searchQuery]);

  const handleRowClick = (event: EventDetails) => {
    setEventInfoLoading(true)
    setEventInfoModalOpen(true)

    setTimeout(() => {
      setSelectedEvent(event)
      setEventInfoLoading(false)
    }, 300)
  }

  return (
    <>
      <div className="w-full px-6.5 py-6 bg-white rounded-md shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-foreground">Reservations</h1>
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
          <div className="rounded-md text-card-foreground border shadow overflow-hidden overflow-x-auto">
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
                      Status
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      Asset name
                    </TableHead>
                    <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                      People tag
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {filteredEvents.map((event) => (
                    <TableRow
                      key={event.id}
                      onClick={() => handleRowClick(event)}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="px-6 py-4 text-sm font-medium text-foreground">
                        {event.title_name}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-foreground">
                        {event.date}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-foreground">
                        {event.time_start}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-foreground">
                        {event.time_end}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-foreground">
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${event.registration_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            event.registration_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {event.registration_status}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-foreground">
                        {event.asset.asset_name}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center text-sm text-foreground">
                        {event.people_tag.length}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      <EventInfoModal
        role="admin"
        isOpen={eventInfoModalOpen}
        onClose={() => setEventInfoModalOpen(false)}
        event={selectedEvent}
        loading={eventInfoLoading}
        showBackdropBlur={true}
      />
    </>
  )
}