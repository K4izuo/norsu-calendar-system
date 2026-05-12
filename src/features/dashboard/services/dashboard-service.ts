import { apiClient } from "@/core/api/api-client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/components/context/auth-context";

export const DASHBOARD_STATS_STALE_TIME = 60 * 1000;

export type DashboardStats = {
  is_admin: boolean;
  total_users: number | null;
  total_users_change: number | null;
  approved_events: number | null;
  approved_events_change: number | null;
  total_events: number;
  total_events_change: number;
  upcoming_events: number;
  upcoming_events_change: number;
  pending_requests: number;
  pending_requests_change: number;
  sparklines: {
    users: number[] | null;
    events: number[];
    approved: number[] | null;
    upcoming: number[];
    pending: number[];
  };
};

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>("/dashboard/stats");
  if (response.error) throw new Error(response.error);
  if (!response.data) throw new Error("Failed to fetch dashboard stats");
  return response.data;
};

export const useDashboardStats = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: fetchDashboardStats,
    staleTime: DASHBOARD_STATS_STALE_TIME,
    enabled: !isAuthLoading && isAuthenticated,
    placeholderData: (prev) => prev,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) return false;
      return failureCount < 2;
    },
  });
  return {
    stats: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
  };
};
