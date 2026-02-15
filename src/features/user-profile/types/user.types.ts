/**
 * User Profile Feature Types
 * Types for user profiles, menus, and user-related UI components
 */

// ============================================================================
// User Profile Data
// ============================================================================

/**
 * User profile display data
 * Used in profile dropdowns and user cards
 */
export interface UserProfileProps {
  name: string
  role: string
  avatar: string
}

/**
 * Extended user data with full details
 * Used for comprehensive user information display
 */
export interface UserData {
  id: number
  username: string
  email?: string
  first_name: string
  middle_name?: string
  last_name: string
  role: number
  avatar?: string
  created_at?: string
  updated_at?: string
}

/**
 * User basic info (name and role only)
 * Used in layout headers and navigation
 */
export interface UserBasicInfo {
  name: string
  role: number
}

// ============================================================================
// Menu and Navigation Types
// ============================================================================

/**
 * Menu item for user profile dropdown
 */
export interface MenuItem {
  label: string
  value?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

// ============================================================================
// Modal Props
// ============================================================================

/**
 * Props for user profile modal
 */
export interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  loading?: boolean
  children?: React.ReactNode
}

// ============================================================================
// User Session Types
// ============================================================================

/**
 * Current logged-in user session data
 */
export interface CurrentUser {
  id: number
  username: string
  email: string
  first_name: string
  middle_name?: string
  last_name: string
  role: number
  token?: string
}

/**
 * User authentication state
 */
export interface UserAuthState {
  isAuthenticated: boolean
  user: CurrentUser | null
  isLoading: boolean
}
