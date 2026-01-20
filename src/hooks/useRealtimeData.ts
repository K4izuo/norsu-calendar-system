import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface UseRealtimeDataOptions<T> {
  queryKey: string[];
  endpoint: string;
  pollInterval?: number; // How often to check for new data (milliseconds)
  enabled?: boolean;
  transform?: (data: any) => T;
}

export function useRealtimeData<T>({
  queryKey,
  endpoint,
  pollInterval = 30000, // Default: check every 30 seconds
  enabled = true,
  transform,
}: UseRealtimeDataOptions<T>) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdateRef = useRef<Date | null>(null);

  // Main query - fetches data with caching
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await apiClient.get<T>(endpoint);

      if (response.error) {
        throw new Error(response.error);
      }

      lastUpdateRef.current = new Date();
      return transform ? transform(response.data) : response.data;
    },
    enabled,
    staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Don't refetch if data is fresh
    refetchOnWindowFocus: false,
  });

  // Background polling for new data
  useEffect(() => {
    if (!enabled || !pollInterval) return;

    const interval = setInterval(async () => {
      // Only refresh if user has been on the page for a while
      // and data might be stale
      const now = new Date();
      const timeSinceLastUpdate = lastUpdateRef.current
        ? now.getTime() - lastUpdateRef.current.getTime()
        : Infinity;

      // Only refresh if data is older than 30 seconds
      if (timeSinceLastUpdate > 30000) {
        setIsRefreshing(true);

        try {
          await queryClient.invalidateQueries({ queryKey });
        } finally {
          // Small delay so user sees the refresh indicator
          setTimeout(() => setIsRefreshing(false), 500);
        }
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [enabled, pollInterval, queryClient, queryKey]);

  // Manual refresh function
  const refresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey });
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return {
    data: query.data || ([] as T),
    isLoading: query.isLoading, // Only true on initial load
    isRefreshing, // True when background refresh is happening
    error: query.error?.message || null,
    refresh,
    refetch: query.refetch,
  };
}

// ============================================
// Specific hooks for each data type
// ============================================

// Hook for reservations with real-time updates
export function useRealtimeReservations() {
  return useRealtimeData({
    queryKey: ['reservations-realtime'],
    endpoint: '/reservations/all',
    pollInterval: 30000, // Check every 30 seconds for new reservations
  });
}

// Hook for assets with real-time updates
export function useRealtimeAssets() {
  const userId = typeof window !== 'undefined'
    ? localStorage.getItem('user-id')
    : null;

  return useRealtimeData({
    queryKey: ['assets-realtime', userId],
    endpoint: '/assets/all',
    pollInterval: 60000, // Assets change less frequently, check every minute
    enabled: !!userId,
  });
}

// Hook for calendar events (approved reservations only)
export function useRealtimeCalendarEvents() {
  return useRealtimeData({
    queryKey: ['calendar-events-realtime'],
    endpoint: '/reservations/all',
    pollInterval: 30000,
    transform: (data: any[]) => {
      // Filter to only approved reservations for calendar
      return data?.filter((reservation: any) =>
        reservation.status.toUpperCase() === 'APPROVED'
      ) || [];
    },
  });
}