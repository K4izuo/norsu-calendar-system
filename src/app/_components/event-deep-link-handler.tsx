"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { EventDetails } from "@/interface/user-props";

interface EventDeepLinkHandlerProps {
  allEvents: EventDetails[];
  onEventClick: (event: EventDetails) => void;
}

export function EventDeepLinkHandler({ allEvents, onEventClick }: EventDeepLinkHandlerProps) {
  const searchParams = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || allEvents.length === 0) return;

    const eventIdParam = searchParams.get("eventId");
    if (!eventIdParam) return;

    const eventId = parseInt(eventIdParam, 10);
    if (isNaN(eventId)) return;

    const match = allEvents.find(e => e.id === eventId);
    if (!match) return;

    handled.current = true;
    onEventClick(match);
  }, [allEvents, searchParams, onEventClick]);

  return null;
}
