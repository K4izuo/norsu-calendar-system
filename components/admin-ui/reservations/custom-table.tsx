"use client";

"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const events = [
  {
    id: 1,
    eventName: "Tech Summit 2024",
    date: "05.10.2024",
    timeStart: "09:00 AM",
    timeEnd: "05:00 PM",
    assetName: "Conference Hall A",
    range: "200-500",
    peopleTags: "2",
    status: "PENDING",
  },
  {
    id: 2,
    eventName: "Product Launch",
    date: "12.03.2024",
    timeStart: "02:00 PM",
    timeEnd: "04:30 PM",
    assetName: "Auditorium B",
    range: "50-150",
    peopleTags: "1",
    status: "PENDING",
  },
  {
    id: 3,
    eventName: "Team Building Workshop",
    date: "21.01.2024",
    timeStart: "10:00 AM",
    timeEnd: "03:00 PM",
    assetName: "Training Room C",
    range: "30-80",
    peopleTags: "3",
    status: "PENDING",
  },
  {
    id: 4,
    eventName: "Networking Breakfast",
    date: "28.02.2024",
    timeStart: "07:30 AM",
    timeEnd: "09:00 AM",
    assetName: "Lounge D",
    range: "20-40",
    peopleTags: "1",
    status: "PENDING",
  },
]

export function ReservationsTable() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = events.filter((event) => event.eventName.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
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
                Range
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center cursor-pointer">
                        <svg className="w-4 h-4 text-gray-400 hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <path stroke="currentColor" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                        </svg>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-white text-gray-700 border border-gray-200 shadow-md px-3 py-2 rounded-md text-sm max-w-xs">
                      Specify how many days you want to reserve this event for. For example, enter &quot;3&quot; to reserve for 3 days.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
              <TableRow key={event.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <TableCell className="px-6 py-4 text-sm font-medium text-foreground">{event.eventName}</TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">{event.date}</TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">{event.timeStart}</TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">{event.timeEnd}</TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">{event.assetName}</TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">{event.range}</TableCell>
                <TableCell className="px-6 py-4 text-center text-sm text-foreground">{event.peopleTags}</TableCell>
                <TableCell className="px-6 py-4 text-sm text-foreground">{event.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
