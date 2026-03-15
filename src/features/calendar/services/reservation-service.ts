import { apiClient } from "@/core/api/api-client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/shared/components/context/auth-context";
import { ReservationWithRelations, MoveReservationPayload } from "@/interface/user-props";
import toast from "react-hot-toast";

export type Asset = {
  id: number;
  asset_name: string;
  capacity: number;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

export const normalizeReservation = (
  reservation: ReservationWithRelations,
): ReservationWithRelations => ({
  ...reservation,
  id: toNumber(reservation.id),
  asset_id: toNumber(reservation.asset_id),
  range: toNumber(reservation.range),
});

// Fetch all reservations with relations (PUBLIC endpoint)
export const fetchReservations = async (): Promise<ReservationWithRelations[]> => {
  const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    return [];
  }

  return response.data.map(normalizeReservation);
};

// Fetch a single reservation by ID (PROTECTED endpoint)
const fetchReservation = async (id: number): Promise<Asset | null> => {
  const response = await apiClient.get<Asset[]>(`/reservations/${id}`);

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data || response.data.length === 0) {
    return null;
  }

  return response.data[0];
};

// Fetch a single asset by ID from public endpoint
const fetchPublicAsset = async (id: number): Promise<Asset | null> => {
  const response = await apiClient.get<Asset[]>(`/reservations/assets/${id}`);

  if (response.error) {
    console.warn(`Failed to fetch asset ${id}:`, response.error);
    return null;
  }

  if (!response.data || response.data.length === 0) {
    return null;
  }

  return response.data[0];
};

// ✅ Approve reservation mutation
const approveReservation = async ({ reservationId, userId }: { reservationId: number; userId: string | number }): Promise<void> => {
  const response = await apiClient.put(`/reservations/${reservationId}`, {
    status: 'APPROVED',
    approved_by_user: userId,
  });

  if (response.error) {
    throw new Error(response.error);
  }
};

// ✅ Decline reservation mutation  
const declineReservation = async ({ reservationId, userId, reason }: { reservationId: number; userId: string | number; reason?: string }): Promise<void> => {
  const response = await apiClient.put(`/reservations/${reservationId}`, {
    status: 'DECLINED',
    declined_by_user: userId,
    reason: reason || '',
  });

  if (response.error) {
    throw new Error(response.error);
  }
};

// Move reservation API call
const moveReservation = async ({
  reservationId,
  payload,
}: {
  reservationId: number;
  payload: MoveReservationPayload;
}): Promise<void> => {
  const response = await apiClient.put(`/reservations/${reservationId}/move`, payload);
  if (response.error) throw new Error(response.error);
};

// Hook to fetch all reservations (AUTHENTICATED - for admin/user pages)
export const useReservations = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error, refetch, dataUpdatedAt, isSuccess } = useQuery({
    queryKey: ['reservations', user?.id],
    queryFn: fetchReservations,
    staleTime: 2 * 60 * 1000, // 2 minutes (was 0 - too aggressive)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !isAuthLoading && isAuthenticated,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // ✅ PRODUCTION FIX: Only trust data if query succeeded AND has data
  // Don't rely on dataUpdatedAt alone - it can be from stale cache
  const hasValidData = isSuccess && !!data && dataUpdatedAt > 0;

  return {
    reservations: data || [],
    loading: isAuthLoading || isFetching,
    hasData: hasValidData, // ✅ FIXED: Only true if fresh fetch succeeded
    isQueryEnabled: !isAuthLoading && isAuthenticated, // ✅ NEW: Query execution state
    error: error?.message || null,
    refetch,
  };
};

// Hook to fetch all reservations (PUBLIC - for main landing page)
export const usePublicReservations = () => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['public-reservations'],
    queryFn: fetchReservations,
    staleTime: 2 * 60 * 1000, // 2 minutes (was 0)
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: true,
    placeholderData: (previousData) => previousData,
    retry: 2,
  });

  return {
    reservations: data || [],
    loading: isFetching,
    error: error?.message || null,
    refetch,
  };
};

// Hook to fetch multiple assets efficiently (AUTHENTICATED)
export const useAssets = (assetIds: number[]) => {
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const queries = useQuery({
    queryKey: ['reservation-assets', user?.id, assetIds.sort().join(',')],
    queryFn: async () => {
      const uniqueIds = [...new Set(assetIds)];
      const assets = new Map<number, Asset>();
      const missingIds: number[] = [];

      // ⚡ PERFORMANCE: Check cache first to avoid redundant fetches
      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(['asset', id]);
        if (cached) {
          assets.set(id, cached);
        } else {
          missingIds.push(id);
        }
      }

      // ⚡ PERFORMANCE: Batch fetch missing assets in parallel
      if (missingIds.length > 0) {
        const assetPromises = missingIds.map(id => fetchReservation(id));
        const fetchedAssets = await Promise.all(assetPromises);

        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            // Cache individual assets for future use
            queryClient.setQueryData(['asset', assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000, // ⚡ Assets change less frequently - cache longer
    enabled: assetIds.length > 0 && !isAuthLoading && isAuthenticated,
    placeholderData: (previousData) => previousData,
  });

  return {
    assets: queries.data || new Map<number, Asset>(),
    loading: isAuthLoading || queries.isFetching,
    error: queries.error?.message || null,
  };
};

// Hook to fetch multiple assets efficiently (PUBLIC - for main landing page)
export const usePublicAssets = (assetIds: number[]) => {
  const queryClient = useQueryClient();

  const queries = useQuery({
    queryKey: ['public-reservation-assets', assetIds.sort().join(',')],
    queryFn: async () => {
      const uniqueIds = [...new Set(assetIds)];
      const assets = new Map<number, Asset>();
      const missingIds: number[] = [];

      // ⚡ PERFORMANCE: Check cache first to avoid redundant fetches
      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(['public-asset', id]);
        if (cached) {
          assets.set(id, cached);
        } else {
          missingIds.push(id);
        }
      }

      // ⚡ PERFORMANCE: Batch fetch missing assets in parallel using PUBLIC endpoint
      if (missingIds.length > 0) {
        const assetPromises = missingIds.map(id => fetchPublicAsset(id));
        const fetchedAssets = await Promise.all(assetPromises);

        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            // Cache individual assets for future use
            queryClient.setQueryData(['public-asset', assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000, // ⚡ Public assets cached longer
    enabled: assetIds.length > 0,
    placeholderData: (previousData) => previousData,
    retry: 1,
    retryDelay: 1000,
  });

  return {
    assets: queries.data || new Map<number, Asset>(),
    loading: queries.isFetching,
    error: queries.error?.message || null,
  };
};

// Hook to fetch a single asset (AUTHENTICATED)
export const useAsset = (id: number) => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchReservation(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id && !isAuthLoading && isAuthenticated,
  });

  return {
    asset: data || null,
    loading: isAuthLoading || isFetching,
    error: error?.message || null,
  };
};

// ✅ Hook to approve a reservation
export const useApproveReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (reservationId: number) => {
      if (!user?.id) {
        throw new Error('User not authenticated. Please login again.');
      }
      return approveReservation({ reservationId, userId: user.id });
    },
    onSuccess: () => {
      // ✅ CRITICAL FIX: Invalidate ALL reservation queries immediately
      queryClient.invalidateQueries({
        queryKey: ['reservations'],
        refetchType: 'all', // Refetch ALL matching queries
      });

      queryClient.invalidateQueries({
        queryKey: ['public-reservations'],
        refetchType: 'all',
      });

      toast.success("Reservation approved successfully!");
    },
    onError: (err) => {
      console.error('Approve error:', err);
      toast.error("Failed to approve reservation");
    },
  });
};

// ✅ Hook to decline a reservation
export const useDeclineReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: number; reason?: string }) => {
      if (!user?.id) {
        throw new Error('User not authenticated. Please login again.');
      }
      return declineReservation({ reservationId, userId: user.id, reason });
    },
    onSuccess: () => {
      // ✅ CRITICAL FIX: Invalidate ALL reservation queries immediately
      queryClient.invalidateQueries({
        queryKey: ['reservations'],
        refetchType: 'all',
      });

      queryClient.invalidateQueries({
        queryKey: ['public-reservations'],
        refetchType: 'all',
      });

      toast.success("Reservation declined successfully!");
    },
    onError: (err) => {
      console.error('Decline error:', err);
      toast.error("Failed to decline reservation");
    },
  });
};

// Hook to move a reservation
export const useMoveReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      reservationId,
      payload,
    }: {
      reservationId: number;
      payload: Omit<MoveReservationPayload, "moved_by">;
    }) => {
      if (!user?.id) throw new Error("User not authenticated. Please login again.");
      return moveReservation({
        reservationId,
        payload: { ...payload, moved_by: Number(user.id) },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"], refetchType: "all" });
      queryClient.invalidateQueries({ queryKey: ["public-reservations"], refetchType: "all" });
      toast.success("Reservation moved successfully!");
    },
    onError: () => {
      toast.error("Failed to move reservation");
    },
  });
};
