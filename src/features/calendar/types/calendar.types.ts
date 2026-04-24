/**
 * Calendar Feature Types
 * Types specific to calendar display and event listing
 */

import type { Reservation, ReservationAPIPayload, ReservationApproval } from "../../reservations/types/reservation.types"

// ============================================================================
// Event Status & Details
// ============================================================================

export type EventStatus = "pending" | "approved" | "decline"

/**
 * Event details displayed in calendar
 * This is the main data structure for events shown in the calendar view
 */
export interface EventDetails {
  id: number
  title_name: string
  date: string
  time_start: string
  time_end: string
  asset: {
    id: number
    asset_name: string
    capacity: number
    aminities?: string[]
    asset_type?: string
  }
  category: string
  info_type: string
  description: string
  people_tag: string[]
  range: number
  registration_status: "PENDING" | "APPROVED" | "DECLINED"
  registration_deadline: string
  reserve_by_user: string  // Keep for backward compatibility
  reserved_by_user?: {      // Add new structured field
    id: number
    first_name: string
    last_name: string
  }
  approved_by_user?: string
  approved_by_user_details?: {
    id: number
    first_name: string
    last_name: string
  }
  declined_by_user?: string
  declined_by_user_details?: {
    id: number
    first_name: string
    last_name: string
  }
  finished_on?: string
  isFinished?: boolean
  is_moved?: boolean
  involves_students?: boolean
  requires_vpaa?: boolean
  requires_vpsas?: boolean
  requires_vpaf?: boolean
  requires_vprde?: boolean
  current_stage?: string
  declined_at_stage?: string | null
  campus_director_action?: 'approve' | 'endorse' | null
  approvals?: ReservationApproval[]
}

/**
 * Legacy event details format (Dean-specific view)
 * @deprecated Consider migrating to EventDetails
 */
export interface DeanPageEventDetails {
  id: number
  title: string
  date: string
  time: string
  organizer: string
  location: string
  capacity: string
  facilities?: string[]
  registrationStatus: string
  attendeeCount: number
  registrationDeadline: string
  description: string
  requirements?: string
  category?: string
  infoType?: string
  peopleTag?: string[]
}

// ============================================================================
// Calendar Component Types
// ============================================================================

/**
 * Represents a single day in the calendar grid
 */
export interface CalendarDayType {
  date: number
  currentMonth: boolean
  key: string
  hasEvent: boolean
  eventCount?: number
  isToday?: boolean
}

/**
 * Props for the main Calendar component
 */
export interface CalendarProps<T> {
  events: T[]
  onDaySelect: (day: CalendarDayType) => void
  getEventsForDate: (year: number, month: number, day: number) => { hasEvent: boolean; count: number }
  initialDate?: Date
  isLoading?: boolean
  setLoading?: (loading: boolean) => void
  currentMonth?: number
  currentYear?: number
  onMonthYearChange?: (month: number, year: number) => void
}

// ============================================================================
// Events List Modal Types
// ============================================================================

/**
 * Props for the Events List Modal component
 */
export interface EventsListModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  onReserve?: (formData: ReservationAPIPayload) => void
  title: string
  events?: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  isLoading?: boolean
  eventDate?: string | undefined
  allReservations?: Reservation[]
  onNewReservation?: (reservation: Reservation) => void
}

/**
 * Props for the Event Cards List component
 */
export interface EventCardsListProps {
  events: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  getStartedAgo: (eventDate: string, time_start: string, time_end: string) => string | null
  getStatus: (event: EventDetails) => EventStatus
  getStatusColor: (status: EventStatus) => string
}
