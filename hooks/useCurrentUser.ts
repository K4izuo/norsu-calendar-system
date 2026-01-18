import { useState, useEffect } from 'react';
import { getUserRole, getUserId } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: number;
  campus_id?: string;
  office_id?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = getUserId();
        const userRole = getUserRole();

        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch user profile from API - adjust endpoint to match your backend
        const response = await apiClient.get<UserProfile>(`users/${userId}`);

        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setUser({
            ...response.data,
            role: parseInt(userRole || '0', 10)
          });
        }
      } catch (err) {
        setError('Failed to fetch user profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, loading, error };
}