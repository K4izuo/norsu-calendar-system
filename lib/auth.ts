// lib/auth.ts
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];
};

export const setAuthToken = (token: string) => {
  document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};

export const removeAuthToken = () => {
  document.cookie = 'auth-token=; path=/; max-age=0';
  document.cookie = 'user-role=; path=/; max-age=0';
};

export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('user-role='))
    ?.split('=')[1];
};

export const setUserRole = (role: string | number) => {
  document.cookie = `user-role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
};