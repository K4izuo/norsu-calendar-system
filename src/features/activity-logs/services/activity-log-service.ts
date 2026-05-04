import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/core/api/api-client';
import { useAuth } from '@/shared/components/context/auth-context';
import type { ActivityLog } from '../types/activity-log.types';

export const ACTIVITY_LOGS_STALE_TIME = 60 * 1000;

const fetchActivityLogs = async (): Promise<ActivityLog[]> => {
  const response = await apiClient.get<ActivityLog[]>('/activity-logs');
  if (response.error) throw new Error(response.error);
  return response.data ?? [];
};

export const useActivityLogs = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ['activity-logs', user?.id],
    queryFn: fetchActivityLogs,
    staleTime: ACTIVITY_LOGS_STALE_TIME,
    enabled: !isAuthLoading && isAuthenticated,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (prev) => prev,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });

  return {
    logs: data ?? [],
    loading: isLoading,
    isFetching,
    error,
    refetch,
  };
};
