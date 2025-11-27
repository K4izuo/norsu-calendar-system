import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users } from "lucide-react"

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
    reserveBy: "10.10.2024",
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
    reserveBy: "05.03.2024",
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
    reserveBy: "15.01.2024",
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
    reserveBy: "20.02.2024",
  },
]

export function ReservationsTable() {
  return (
    <div className="rounded-lg bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent h-6">
            <TableHead>Event name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time start</TableHead>
            <TableHead>Time end</TableHead>
            <TableHead>Asset name</TableHead>
            <TableHead>Range</TableHead>
            <TableHead>People tag</TableHead>
            <TableHead>Reserve by</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">
                <div className="flex items-center">
                  <div>
                    <div className="font-medium text-sm">{event.eventName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm">{event.date}</TableCell>
              <TableCell className="text-sm">{event.timeStart}</TableCell>
              <TableCell className="text-sm">{event.timeEnd}</TableCell>
              <TableCell className="text-sm">{event.assetName}</TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-500">
                  {event.range}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{event.peopleTags}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm">{event.reserveBy}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
