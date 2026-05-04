import { apiClient } from "@/core/api/api-client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/components/context/auth-context";
import type { UserAccount } from "../types/account.types";

const fetchUsers = async (): Promise<UserAccount[]> => {
  const response = await apiClient.get<UserAccount[]>('users/all');

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data || response.data.length === 0) {
    return [];
  }

  return response.data;
};

export const useUsers = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isLoading, isFetching, isStale, error, refetch } = useQuery({
    queryKey: ['users', user?.id],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !isAuthLoading && isAuthenticated,
    placeholderData: (prev) => prev,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    users: data || [],
    loading: isAuthLoading || isLoading || isFetching,
    isFetching,
    isStale,
    error: error?.message || null,
    refetch,
  };
};
