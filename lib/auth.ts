const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`));
    
  return cookie ? cookie.split('=')[1] : null;
};

const setCookie = (name: string, value: string, days: number = 7): void => {
  const maxAge = 60 * 60 * 24 * days;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; path=/; max-age=0`;
};

export const getAuthToken = () => getCookie('auth-token');
export const getUserRole = () => getCookie('user-role');

export const setAuthToken = (token: string) => setCookie('auth-token', token);
export const setUserRole = (role: string | number) => setCookie('user-role', String(role));

export const removeAuthToken = () => {
  deleteCookie('auth-token');
  deleteCookie('user-role');
};