"use client";

import { useState } from "react"
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

  // Filter reservations based on search query
  const filteredEvents = events.filter((event) =>
    event.title_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

        <div className="rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Event name
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">Date</TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Time start
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Time end
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Asset name
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  People tag
                </TableHead>
                <TableHead className="h-12 px-6 py-3 text-sm font-medium text-muted-foreground text-left">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow
                  key={event.id}
                  onClick={() => handleRowClick(event)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="px-6 py-4 text-sm font-medium text-foreground">{event.title_name}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">{event.date}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">{event.time_start}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">{event.time_end}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">{event.asset.asset_name}</TableCell>
                  <TableCell className="px-6 py-4 text-center text-sm text-foreground">
                    {event.people_tag.length}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-foreground">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${event.registration_status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      event.registration_status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {event.registration_status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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