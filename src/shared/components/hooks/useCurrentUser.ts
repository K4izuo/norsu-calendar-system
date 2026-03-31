import { useQuery } from '@tanstack/react-query';
import { getUserRole, getUserId } from '@/core/auth/auth';
import { apiClient } from '@/core/api/api-client';

interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: number;
  campus_id?: string;
  office_id?: string;
  created_at?: string;
}

const fetchUserProfile = async (userId: number): Promise<UserProfile | null> => {
  const response = await apiClient.get<UserProfile>(`users/${userId}`);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data;
};

export function useCurrentUser() {
  const userId = getUserId();
  const userRoleStr = getUserRole();
  const userRole = userRoleStr ? parseInt(userRoleStr, 10) : 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['currentUser', userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Merge the fetched user data with the role from auth (if needed, or just rely on API)
  // The original hook merged role from getUserRole(), so we preserve that behavior if API doesn't return role or to be safe
  const user: UserProfile | null = data ? { ...data, role: userRole } : null;

  return { 
    user, 
    loading: isLoading, 
    error: error instanceof Error ? error.message : null 
  };
}