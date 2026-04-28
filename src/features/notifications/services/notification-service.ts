import { apiClient } from "@/core/api/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/components/context/auth-context";
import type { AppNotification } from "../types/notification.types";

export const useNotifications = (enabled = true) => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<AppNotification[]> => {
      const response = await apiClient.get<AppNotification[]>('notifications');
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    staleTime: 10 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: enabled ? 15 * 1000 : false,
    enabled: enabled && !isAuthLoading && isAuthenticated,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });

  return {
    notifications: data || [],
    loading: isAuthLoading || isFetching,
    error: error?.message || null,
    refetch,
  };
};

export const useUnreadCount = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data } = useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: async (): Promise<number> => {
      const response = await apiClient.get<{ count: number }>('notifications/unread-count');
      if (response.error) throw new Error(response.error);
      return response.data?.count ?? 0;
    },
    staleTime: 10 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000,
    enabled: !isAuthLoading && isAuthenticated,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) return false;
      return failureCount < 2;
    },
  });

  return { unreadCount: data ?? 0 };
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await apiClient.put<void, Record<string, never>>(`notifications/${id}/read`, {});
      if (response.error) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id], refetchType: 'all' });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await apiClient.put<void, Record<string, never>>('notifications/mark-all-read', {});
      if (response.error) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id], refetchType: 'all' });
    },
  });
};
