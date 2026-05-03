/**
 * Authentication Type Definitions
 * Centralized type definitions for all authentication-related data structures
 */

// ============================================================================
// User & Role Types
// ============================================================================

/**
 * User role enumeration
 * 1=Dean, 2=Staff, 3=Admin, 4=StudentDirector, 5=CampusDirector,
 * 6=VPAA, 7=VPSAS, 8=VPAF, 9=VPRDE, 10=HeadOfOffice,
 * 11=Multimedia, 12=UniversityPresident
 */
export type UserRole = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Base user information returned from API
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  campus_id?: string;
  office_id?: string;
  assignment_id?: string;
  office?: {
    id: number;
    name: string;
    oversight_vp_id: number | null;
  };
}

// ============================================================================
// Authentication Request/Response Types
// ============================================================================

/**
 * Login form data structure
 */
export interface LoginFormData {
  username: string;
  password: string;
}

/**
 * Login API response
 */
export interface LoginResponse {
  token: string;
  user: User;
  role?: UserRole;
  expires_at?: string;
}

/**
 * Registration form data - base interface
 */
export interface BaseRegisterFormData {
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

/**
 * Dean registration form data
 */
export interface DeanRegisterFormData extends BaseRegisterFormData {
  assignment_id: string;
  campus_id: string;
  office_id: string;
  role: string;
}

/**
 * Staff registration form data
 */
export interface StaffRegisterFormData extends BaseRegisterFormData {
  assignment_id: string;
  campus_id: string;
  office_id: string;
  role: string;
}

/**
 * Admin registration form data
 */
export interface AdminRegisterFormData extends BaseRegisterFormData {
  role: string;
}

/**
 * Generic register response
 */
export interface RegisterResponse {
  message: string;
  user: User;
  token?: string;
  role?: UserRole;
  expires_at?: string;
}

// ============================================================================
// Validation & Error Types
// ============================================================================

/**
 * API validation errors structure (422 status)
 */
export interface ValidationErrors {
  message?: string;
  errors?: {
    username?: string[];
    password?: string[];
    email?: string[];
    first_name?: string[];
    last_name?: string[];
    [key: string]: string[] | undefined;
  };
}

/**
 * Generic API error response
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// ============================================================================
// Authentication State Types
// ============================================================================

/**
 * Stored authentication state
 */
export interface AuthState {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  expiresAt: string | null;
  isAuthenticated: boolean;
}

/**
 * Auth context value (for React Context)
 */
export interface AuthContextValue extends AuthState {
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

// ============================================================================
// Token Types
// ============================================================================

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  token: string;
  expires_at: string;
}

/**
 * Token expiry check result
 */
export interface TokenExpiryStatus {
  isExpired: boolean;
  expiresAt: string | null;
  timeRemaining: number | null; // milliseconds
}

// ============================================================================
// Account Management Types
// ============================================================================

/**
 * Account update form data
 */
export interface AccountUpdateFormData {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  campus_id?: string;
  office_id?: string;
  assignment_id?: string;
}

/**
 * Password change form data
 */
export interface PasswordChangeFormData {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Role path mapping (for routing)
 */
export type RolePath =
  | 'admin' | 'dean' | 'staff'
  | 'student-director' | 'campus-director'
  | 'vpaa' | 'vpsas' | 'vpaf' | 'vprde' | 'head'
  | 'multimedia' | 'university-president';

/**
 * Role path map
 */
export const ROLE_PATH_MAP: Record<UserRole, RolePath> = {
  1:  'dean',
  2:  'staff',
  3:  'admin',
  4:  'student-director',
  5:  'campus-director',
  6:  'vpaa',
  7:  'vpsas',
  8:  'vpaf',
  9:  'vprde',
  10: 'head',
  11: 'multimedia',
  12: 'university-president',
} as const;

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  1:  'Dean',
  2:  'Staff',
  3:  'Admin',
  4:  'Student Director',
  5:  'Campus Director',
  6:  'VPAA',
  7:  'VPSAS',
  8:  'VPAF',
  9:  'VPRDE',
  10: 'Head of Office',
  11: 'Multimedia',
  12: 'University President',
} as const;
