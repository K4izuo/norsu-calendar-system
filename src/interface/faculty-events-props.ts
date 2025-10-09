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
  facultyId: string
  campus_id: string
  college_id: string
  degree_course_id: string
}