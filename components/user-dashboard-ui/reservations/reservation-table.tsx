"use client";

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, CalendarClock } from "lucide-react"
import { EventInfoModal } from "@/components/modal/event-info-modal"
import { EventDetails } from "@/interface/user-props"
import { motion } from "framer-motion";
import { UserRole } from "@/utils/role-colors"

const getRoleLoadingColors = (role: UserRole) => {
  const colorMap = {
    dean: {
      spinner: "border-blue-500",
      icon: "text-blue-500",
    },
    staff: {
      spinner: "border-purple-500",
      icon: "text-purple-500",
    },
    admin: {
      spinner: "border-gray-800",
      icon: "text-gray-800",
    },
    public: {
      spinner: "border-teal-500",
      icon: "text-teal-500",
    },
  };

  return colorMap[role || "public"];
};

// Define props interface - NOW ACCEPTS EventDetails[]
interface ReservationsTableProps {
  events: EventDetails[]; // Changed from reservations: Reservation[]
  isLoading?: boolean;
  role: UserRole;
}

export function ReservationsTable({ events, isLoading = false, role }: ReservationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const [eventInfoModalOpen, setEventInfoModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | undefined>(undefined)
  const [eventInfoLoading, setEventInfoLoading] = useState(false)

  const roleLoadingColors = getRoleLoadingColors(role);

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
          {isLoading ? (
            <motion.div
              className="flex items-center justify-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-16 w-16 flex items-center justify-center">
                <motion.div
                  className={`absolute inset-0 h-16 w-16 rounded-full border-t-4 border-b-4 ${roleLoadingColors.spinner}`}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    ease: "linear",
                    repeat: Infinity,
                  }}
                />
                <CalendarClock className={`absolute inset-0 m-auto h-7 w-7 ${roleLoadingColors.icon}`} />
              </div>
            </motion.div>
          ) : (
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
          )}
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