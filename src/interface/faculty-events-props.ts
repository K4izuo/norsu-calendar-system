type EventStatus = "pending" | "approved" | "rejected"

export interface EventDetails {
  id: number // Changed from string to number
  title: string
  date: string
  time: string
  organizer: string
  location: string
  capacity: string
  facilities?: string[]
  registrationStatus: string
  attendeeCount: number // Changed from string to number
  registrationDeadline: string
  description: string
  requirements?: string
  category?: string
  infoType?: string
  peopleTag?: string[]
  reservedBy?: string
  approvedBy?: string
  rejectedBy?: string
  finishedOn?: string
}

export interface EventsListModalProps {
  isOpen: boolean
  onClose: () => void
  children?: React.ReactNode
  onReserve?: (formData: ReservationFormData) => void
  title: string
  events?: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  isLoading?: boolean
  eventDate?: string | undefined
}

export interface EventCardsListProps {
  events: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  getStartedAgo: (eventDate: string, eventTime: string) => string | null
  getStatus: (event: EventDetails) => EventStatus
  getStatusColor: (status: EventStatus) => string
}

export interface FacultyPageEventDetails {
  id: number; // Changed from string to number
  title: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  capacity: string;
  facilities?: string[];
  registrationStatus: string;
  attendeeCount: number; // Changed from string to number
  registrationDeadline: string;
  description: string;
  requirements?: string;
  category?: string;
  infoType?: string;
  peopleTag?: string[];
}

export interface ReservationFormData {
  title: string
  asset: {
    id: string
    name: string
    capacity: string
    facilities?: string[]
  } | null // <-- allow full asset object or null
  timeStart: string
  timeEnd: string
  description: string
  range: number
  people: string // comma-separated names
  infoType: string
  category: string
  date?: string // <-- Add optional date field
}

export interface StudentRegisterFormData {
  first_name: string
  middle_name: string
  last_name: string
  email: string
  studentID: string
  campus_id: string
  college_id: string
  degree_course_id: string
}

export interface FacultyRegisterFormData {
  first_name: string
  middle_name: string
  last_name: string
  email: string
  facultyID: string
  campus_id: string
  college_id: string
  degree_course_id: string
}

export interface CalendarDayType {
  date: number;
  currentMonth: boolean;
  key: string;
  hasEvent: boolean;
  eventCount?: number;
  isToday?: boolean;
}

export interface CalendarProps<T> {
  events: T[];
  onDaySelect: (day: CalendarDayType) => void;
  getEventsForDate: (year: number, month: number, day: number) => { hasEvent: boolean; count: number };
  initialDate?: Date;
  isLoading?: boolean;
  setLoading?: (loading: boolean) => void;
  // New optional props for controlled component behavior
  currentMonth?: number;
  currentYear?: number;
  onMonthYearChange?: (month: number, year: number) => void;
}

export type AdminEventDetails = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  attendeeCount: number;
  category?: string;
  infoType?: string;
  description: string;
  peopleTag?: string[];
  registrationStatus: string;
  organizer: string;
  capacity: string;
  registrationDeadline: string;
  approvalStatus?: "pending" | "approved" | "rejected";
  createdBy?: string;
  // Add any admin-specific fields here
};