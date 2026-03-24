/**
 * Reservations Feature Types
 * Types specific to event reservations and bookings
 */

// ============================================================================
// Reservation Data Models
// ============================================================================

/**
 * Core reservation entity from database
 */
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

/**
 * Extended reservation with user relationship data
 * Used for API responses that include user details
 */
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

// ============================================================================
// API Payload Types
// ============================================================================

/**
 * Payload for creating a new reservation
 * Sent to the API when submitting a reservation form
 */
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

// ============================================================================
// Form Data Types
// ============================================================================

/**
 * Form data structure for reservation forms
 * Includes asset details for display purposes
 */
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
