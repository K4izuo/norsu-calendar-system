/**
 * Authentication Type Definitions
 * Centralized type definitions for all authentication-related data structures
 */

// ============================================================================
// User & Role Types
// ============================================================================

/**
 * User role enumeration
 * 1 = Student, 2 = Dean, 3 = Staff, 4 = Admin (default)
 */
export type UserRole = 1 | 2 | 3 | 4;

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
export type RolePath = 'admin' | 'dean' | 'staff' | 'user';

/**
 * Role path map
 */
export const ROLE_PATH_MAP: Record<UserRole, RolePath> = {
  1: 'admin',
  2: 'dean',
  3: 'staff',
  4: 'user',
} as const;

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  1: 'Student',
  2: 'Dean',
  3: 'Staff',
  4: 'Admin',
} as const;
