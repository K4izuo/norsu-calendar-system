import { LucideIcon } from "lucide-react"
// import { AssetFormValue } from "@/types/asset"

type EventStatus = "pending" | "approved" | "decline"

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
  isFinished?: boolean;
  is_moved?: boolean;
  original_date?: string;
  move_reason?: string;
}

// Add this new interface for API payload
export interface ReservationAPIPayload {
  title_name: string
  asset_id: number
  time_start: string
  time_end: string
  description: string
  range: number
  people_tag: string
  tagged_people_ids?: number[]
  info_type: string
  category: string
  date: string
}

export interface Reservation {
  id: number
  title_name: string
  asset_id: number
  time_start: string
  time_end: string
  description: string
  range: number
  people_tag: string
  info_type: string
  category: string
  date: string
  status: string
  created_at: string
  updated_at: string
  reserve_by_user: number
  is_moved?: boolean
  original_date?: string
  move_reason?: string
}

// Extended interface for API responses that include relationships
export interface ReservationWithRelations extends Reservation {
  reserved_by_user?: {
    id: number
    first_name: string
    last_name: string
  }
  approved_by_user?: {
    id: number
    first_name: string
    last_name: string
  }
  declined_by_user?: {
    id: number
    first_name: string
    last_name: string
  }
}

export interface EventsListModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  onReserve?: (formData: ReservationAPIPayload) => void
  title: string
  events?: EventDetails[]
  onEventClick?: (event: EventDetails, fromMovedEvents?: boolean) => void
  isLoading?: boolean
  eventDate?: string | undefined
  allReservations?: Reservation[]
  onNewReservation?: (reservation: Reservation) => void
}

export interface EventCardsListProps {
  events: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  getStartedAgo: (eventDate: string, time_start: string, time_end: string) => string | null
  getStatus: (event: EventDetails) => EventStatus
  getStatusColor: (status: EventStatus) => string
}

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

export interface ReservationFormData {
  title_name: string
  asset: {
    id: number
    asset_name: string
    capacity: number
    facilities?: string[]
    asset_type?: string
  }
  time_start: string
  time_end: string
  description: string
  range: number
  people_tag: string
  info_type: string
  category: string
  date: string
}

export interface DeanRegisterFormData {
  first_name: string
  middle_name: string
  last_name: string
  email: string
  assignment_id: string
  campus_id: string
  office_id: string
  role: string
}

export type StaffRegisterFormData = {
  first_name: string
  middle_name: string
  last_name: string
  email: string
  assignment_id: string
  campus_id: string
  office_id: string
  role: string
}

export interface CalendarDayType<T = unknown> {
  date: number
  currentMonth: boolean
  key: string
  hasEvent: boolean
  eventCount?: number
  isToday?: boolean
  dayEvents?: T[]
  dateString?: string  // ← ADD THIS
}

// Add this NEW interface right after CalendarDayType
export interface MoveReservationPayload {
  new_date: string
  new_time_start: string
  new_time_end: string
  move_reason: string
  moved_by: number
}

export interface CalendarProps<T> {
  events: T[]
  onDaySelect: (day: CalendarDayType<T>) => void
  getEventsForDate: (year: number, month: number, day: number) => { hasEvent: boolean; count: number; eventsList?: T[] }
  initialDate?: Date
  isLoading?: boolean
  setLoading?: (loading: boolean) => void
  currentMonth?: number
  currentYear?: number
  onMonthYearChange?: (month: number, year: number) => void
}

// export type AdminEventDetails = {
//   id: number
//   title_name: string
//   date: string
//   time: string
//   location: string
//   category?: string
//   infoType?: string
//   description: string
//   peopleTag?: string[]
//   registrationStatus: string
//   organizer: string
//   capacity: string
//   registrationDeadline: string
//   approvalStatus?: "pending" | "approved" | "declined"
//   createdBy?: string
// }

export type AdminFormFieldProps = {
  id: string
  name: string
  type?: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  icon: LucideIcon
  required?: boolean
  disabled?: boolean
  hasError?: boolean
  errorMessage?: string
  autoComplete?: string
  rightElement?: React.ReactNode
}

export interface AssetRegistrationData {
  id?: number
  asset_name: string
  asset_type: string
  capacity: number
  location: string
  acquisition_date: string
  condition: string
  availability_status: string
  campus_id?: string
  office_id?: string
}

export interface AssetRegistrationPayload {
  asset_name: string
  asset_type: string
  capacity: number
  location: string
  acquisition_date: string
  condition: string
  availability_status: string
  campus_id?: string
  office_id?: string
}

export interface MoveReservationPayload {
  new_date: string
  new_time_start: string
  new_time_end: string
  move_reason: string
  moved_by: number
}