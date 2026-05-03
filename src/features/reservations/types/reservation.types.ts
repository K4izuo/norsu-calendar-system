/**
 * Reservations Feature Types
 * Types specific to event reservations and bookings
 */

// ============================================================================
// Reservation Data Models
// ============================================================================

export interface ReservationApproval {
  id: number
  stage: string
  user_id: number
  action: 'APPROVED' | 'DECLINED' | 'APPROVE' | 'ENDORSE'
  reason?: string | null
  created_at: string
  user?: { first_name: string; last_name: string }
}

export interface RequestorInfo {
  type: 'student' | 'faculty' | 'office'
  student_sub_type?: 'student_org' | 'csg' | 'lso' | 'sgdc'
  student_org_name?: string
  csg_name?: string
  tagged?: { id: number; name: string }[]
}

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
  tagged_people_ids?: number[]
  info_type: string
  category: string
  other_category?: string
  date: string
  status: string
  created_at: string
  updated_at: string
  reserve_by_user: number
  is_moved?: boolean
  original_date?: string
  move_reason?: string
  outsource?: string
  guests?: { name: string; details: string }[]
  involves_students?: boolean
  requires_vpaa?: boolean
  requires_vpsas?: boolean
  requires_vpaf?: boolean
  requires_vprde?: boolean
  current_stage?: string
  declined_at_stage?: string | null
  campus_director_action?: 'approve' | 'endorse' | null
  requestor?: RequestorInfo
  requestor_type?: RequestorInfo["type"]
  student_sub_type?: RequestorInfo["student_sub_type"]
  student_org_name?: string
  csg_name?: string
  requestor_tagged?: { id: number; name: string }[] | string
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
  approvals?: ReservationApproval[]
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
  other_category?: string
  date: string
  outsource?: string
  guests?: { name: string; details: string }[]
  involves_students?: boolean
  requires_vpaa?: boolean
  requires_vpsas?: boolean
  requires_vpaf?: boolean
  requires_vprde?: boolean
  requestor?: RequestorInfo
  requestor_type?: RequestorInfo["type"]
  student_sub_type?: RequestorInfo["student_sub_type"]
  student_org_name?: string
  csg_name?: string
  requestor_tagged?: { id: number; name: string }[]
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
  other_category?: string
  date: string
  equipment?: { name: string; quantity: number }[]
  outsource?: string
  guests?: { name: string; details: string }[]
  involves_students?: boolean
  requires_vpaa?: boolean
  requires_vpsas?: boolean
  requires_vpaf?: boolean
  requires_vprde?: boolean
  requestor?: RequestorInfo
}
