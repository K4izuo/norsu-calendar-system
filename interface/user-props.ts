import { LucideIcon } from "lucide-react"
// import { AssetFormValue } from "@/types/asset"

type EventStatus = "pending" | "approved" | "rejected"

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
    facilities?: string[]
    asset_type?: string
  }
  category: string
  info_type: string
  description: string
  people_tag: string[]
  range: number
  // organizer: string
  registration_status: "PENDING" | "APPROVED" | "REJECTED"
  registration_deadline: string
  reserve_by?: string
  approved_by?: string
  rejected_by?: string
  finished_on?: string
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
}

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

export interface EventCardsListProps {
  events: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  getStartedAgo: (eventDate: string, time_start: string, time_end: string) => string | null
  getStatus: (event: EventDetails) => EventStatus
  getStatusColor: (status: EventStatus) => string
}

export interface FacultyPageEventDetails {
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
  college_id: string
  degree_course_id: string
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

export interface CalendarDayType {
  date: number
  currentMonth: boolean
  key: string
  hasEvent: boolean
  eventCount?: number
  isToday?: boolean
}

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
//   approvalStatus?: "pending" | "approved" | "rejected"
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