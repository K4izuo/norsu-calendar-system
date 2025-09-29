export interface EventDetails {
  id: string
  title: string
  date: string
  time: string
  organizer: string
  location: string
  capacity: string
  facilities?: string[]
  registrationStatus: string
  attendeeCount: string
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
  title?: string
  events?: EventDetails[]
  onEventClick?: (event: EventDetails) => void
  isLoading?: boolean
  eventDate?: string | undefined
}

export interface FacultyPageEventDetails {
  id: string;
  title: string;
  date: string;
  time: string;
  organizer: string;
  location: string;
  capacity: string;
  facilities?: string[];
  registrationStatus: string;
  attendeeCount: string;
  registrationDeadline: string;
  description: string;
  requirements?: string;
  category?: string;
}

export interface ReservationFormData {
  title: string
  venue: string | null
  timeStart: string
  timeEnd: string
  description: string
  range: number
  people: string // comma-separated names
  infoType: string
  category: string
  date?: string // <-- Add optional date field
}