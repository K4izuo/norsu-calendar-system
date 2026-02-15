/**
 * Accounts Feature Types
 * Types for user account management and authentication
 */

// ============================================================================
// Account Form Data
// ============================================================================

/**
 * Form data for account creation/management
 * Used in account registration and profile update forms
 */
export interface AccountFormData {
  username: string
  password: string
  confirmPassword: string
}

// ============================================================================
// User Account Data
// ============================================================================

/**
 * User account entity
 * Represents a user account in the system
 */
export interface UserAccount {
  id: number
  username: string
  email?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  role: number
  created_at?: string
  updated_at?: string
}

/**
 * Account update payload
 * Data sent when updating user account details
 */
export interface AccountUpdatePayload {
  username?: string
  email?: string
  first_name?: string
  middle_name?: string
  last_name?: string
  password?: string
}

/**
 * Password change data
 * Used for password update operations
 */
export interface PasswordChangeData {
  current_password: string
  new_password: string
  confirm_password: string
}
