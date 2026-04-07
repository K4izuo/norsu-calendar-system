"use client";

import { NorsuOfficialCalendar } from "@/features/calendar/components/norsu-official-calendar";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-muted/50 flex flex-col">
      <NorsuOfficialCalendar />
    </div>
  );
}
