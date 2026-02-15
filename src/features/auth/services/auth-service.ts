/**
 * Authentication Service
 * Centralized service for all authentication-related API calls
 */

import { apiClient } from '@/core/api/api-client';
import type {
  LoginFormData,
  LoginResponse,
  RegisterResponse,
  DeanRegisterFormData,
  StaffRegisterFormData,
  AdminRegisterFormData,
  TokenRefreshResponse,
  User,
  AccountUpdateFormData,
  PasswordChangeFormData,
} from '../types/auth.types';

/**
 * Authentication Service
 * Provides methods for login, registration, logout, token management, and account updates
 */
export const authService = {
  /**
   * Login user with credentials
   * @param credentials - Username and password
   * @returns Promise with login response including token, user, and role
   */
  login: async (credentials: LoginFormData) => {
    return apiClient.post<LoginResponse, LoginFormData>(
      '/users/login',
      credentials
    );
  },

  /**
   * Register a new dean user
   * @param data - Dean registration form data
   * @returns Promise with registration response
   */
  registerDean: async (data: DeanRegisterFormData) => {
    return apiClient.post<RegisterResponse, DeanRegisterFormData>(
      '/users/store',
      data
    );
  },

  /**
   * Register a new staff user
   * @param data - Staff registration form data
   * @returns Promise with registration response
   */
  registerStaff: async (data: StaffRegisterFormData) => {
    return apiClient.post<RegisterResponse, StaffRegisterFormData>(
      '/users/store',
      data
    );
  },

  /**
   * Register a new admin user
   * @param data - Admin registration form data
   * @returns Promise with registration response
   */
  registerAdmin: async (data: AdminRegisterFormData) => {
    return apiClient.post<RegisterResponse, AdminRegisterFormData>(
      '/users/store',
      data
    );
  },

  /**
   * Generic user registration (auto-detects role from data)
   * @param data - User registration form data
   * @returns Promise with registration response
   */
  register: async (
    data: DeanRegisterFormData | StaffRegisterFormData | AdminRegisterFormData
  ) => {
    return apiClient.post<RegisterResponse, typeof data>(
      '/users/store',
      data
    );
  },

  /**
   * Logout current user
   * @returns Promise with logout response
   */
  logout: async () => {
    return apiClient.logout('/logout');
  },

  /**
   * Get current authenticated user information
   * @returns Promise with user data
   */
  getCurrentUser: async () => {
    return apiClient.get<User>('/me');
  },

  /**
   * Refresh authentication token
   * @returns Promise with new token and expiry
   */
  refreshToken: async () => {
    return apiClient.post<TokenRefreshResponse, undefined>(
      '/refresh-token',
      undefined
    );
  },

  /**
   * Update token expiration time
   * @param expiresAt - New expiration timestamp
   * @returns Promise with update response
   */
  updateTokenExpiration: async (expiresAt: string) => {
    return apiClient.post<{ expires_at: string }, { expires_at: string }>(
      '/update-token-expiration',
      { expires_at: expiresAt }
    );
  },

  /**
   * Update user account information
   * @param userId - ID of user to update
   * @param data - Updated account data
   * @returns Promise with updated user data
   */
  updateAccount: async (userId: number, data: AccountUpdateFormData) => {
    return apiClient.put<User, AccountUpdateFormData>(
      `/users/${userId}`,
      data
    );
  },

  /**
   * Change user password
   * @param userId - ID of user
   * @param data - Password change data
   * @returns Promise with success response
   */
  changePassword: async (userId: number, data: PasswordChangeFormData) => {
    return apiClient.post<{ message: string }, PasswordChangeFormData>(
      `/users/${userId}/change-password`,
      data
    );
  },

  /**
   * Verify email address
   * @param token - Email verification token
   * @returns Promise with verification response
   */
  verifyEmail: async (token: string) => {
    return apiClient.post<{ message: string }, { token: string }>(
      '/verify-email',
      { token }
    );
  },

  /**
   * Resend email verification
   * @param email - User email address
   * @returns Promise with resend response
   */
  resendVerification: async (email: string) => {
    return apiClient.post<{ message: string }, { email: string }>(
      '/resend-verification',
      { email }
    );
  },

  /**
   * Request password reset
   * @param email - User email address
   * @returns Promise with reset request response
   */
  requestPasswordReset: async (email: string) => {
    return apiClient.post<{ message: string }, { email: string }>(
      '/password/reset-request',
      { email }
    );
  },

  /**
   * Reset password with token
   * @param token - Password reset token
   * @param newPassword - New password
   * @param passwordConfirmation - Password confirmation
   * @returns Promise with reset response
   */
  resetPassword: async (
    token: string,
    newPassword: string,
    passwordConfirmation: string
  ) => {
    return apiClient.post<
      { message: string },
      { token: string; password: string; password_confirmation: string }
    >('/password/reset', {
      token,
      password: newPassword,
      password_confirmation: passwordConfirmation,
    });
  },
};

/**
 * Export individual methods for convenience
 */
export const {
  login,
  registerDean,
  registerStaff,
  registerAdmin,
  register,
  logout,
  getCurrentUser,
  refreshToken,
  updateTokenExpiration,
  updateAccount,
  changePassword,
  verifyEmail,
  resendVerification,
  requestPasswordReset,
  resetPassword,
} = authService;

/**
 * Default export
 */
export default authService;
