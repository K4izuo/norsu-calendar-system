"use client";

import { ReservationsTable } from "@/components/admin-ui/reservations/custom-table"

export default function ReservationsPage() {
  return (
    <div>
      <h1>Reservations</h1>
      <div>
        <ReservationsTable/>
      </div>
    </div>
  )
}