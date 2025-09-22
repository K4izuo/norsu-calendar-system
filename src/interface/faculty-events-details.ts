/**
 * Represents an event with all its details
 */
export interface EventDetails {
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