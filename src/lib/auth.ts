export const setAuthToken = (token: string, expiresAt?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth-token', token);
    
    // Set cookie with expiry
    const expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + 15 * 60 * 1000);
    document.cookie = `auth-token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
    
    // Store expiry timestamp
    document.cookie = `token-expiry=${expires.toISOString()}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
  }
};

export const setUserRole = (role: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user-role', role.toString());
    
    // Set cookie without expiry (will expire with token)
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    document.cookie = `user-role=${role}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    // Check localStorage first
    const token = localStorage.getItem('auth-token');
    
    // Verify token hasn't expired
    const cookies = document.cookie.split(';');
    const expiryCookie = cookies.find(c => c.trim().startsWith('token-expiry='));
    
    if (expiryCookie) {
      const expiryValue = expiryCookie.split('=')[1];
      const expiryDate = new Date(expiryValue);
      
      if (expiryDate <= new Date()) {
        // Token expired, clear everything
        removeAuthToken();
        return null;
      }
    }
    
    return token;
  }
  return null;
};

export const getUserRole = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('user-role');
  }
  return null;
};

export const getUserId = (): number | null => {
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('user-id');
    return userId ? parseInt(userId, 10) : null;
  }
  return null;
};

export const setUserId = (userId: number) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user-id', userId.toString());
    
    // Set cookie without expiry (will expire with token)
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    document.cookie = `user-id=${userId}; path=/; expires=${expires.toUTCString()}; SameSite=Strict`;
  }
};

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('user-id');
    
    // Clear cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'token-expiry=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};