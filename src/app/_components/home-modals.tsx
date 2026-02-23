"use client";

import type { Dispatch, SetStateAction } from "react";
import { EventsListModal } from "@/features/calendar/components/events-list-modal";
import { EventInfoModal } from "@/features/calendar/components/event-info-modal";
import type { EventDetails, CalendarDayType } from "@/interface/user-props";

interface HomeModalsProps {
  modalOpen: boolean;
  onModalClose: () => void;
  eventInfoModalOpen: boolean;
  onEventInfoModalClose: () => void;
  selectedDay: CalendarDayType | null;
  currentMonth: number;
  currentYear: number;
  monthNames: string[];
  selectedDayEvents: EventDetails[];
  onEventClick: (event: EventDetails) => void;
  eventsListLoading: boolean;
  showRecent: boolean;
  setShowRecent: Dispatch<SetStateAction<boolean>>;
  selectedEvent: EventDetails | undefined;
  eventInfoLoading: boolean;
}

export default function HomeModals(props: HomeModalsProps) {
  const {
    modalOpen,
    onModalClose,
    eventInfoModalOpen,
    onEventInfoModalClose,
    selectedDay,
    currentMonth,
    currentYear,
    monthNames,
    selectedDayEvents,
    onEventClick,
    eventsListLoading,
    showRecent,
    setShowRecent,
    selectedEvent,
    eventInfoLoading,
  } = props;

  return (
    <>
      <EventsListModal
        role="public"
        isOpen={modalOpen}
        onClose={onModalClose}
        title={
          selectedDay
            ? selectedDay.currentMonth
              ? `Events on ${monthNames[currentMonth]} ${selectedDay.date}, ${currentYear}`
              : `${selectedDay.date} ${monthNames[currentMonth]}, ${currentYear} (Outside current month)`
            : ""
        }
        events={selectedDayEvents}
        onEventClick={onEventClick}
        isLoading={eventsListLoading}
        showRecent={showRecent}
        setShowRecent={setShowRecent}
        eventDate={
          selectedDay?.currentMonth
            ? `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay.date).padStart(2, "0")}`
            : ""
        }
      />

      <EventInfoModal
        role="public"
        isOpen={eventInfoModalOpen}
        onClose={onEventInfoModalClose}
        event={selectedEvent}
        loading={eventInfoLoading}
      />
    </>
  );
}
