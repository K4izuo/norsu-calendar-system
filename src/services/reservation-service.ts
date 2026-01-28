import { apiClient } from "@/lib/api-client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { ReservationWithRelations } from "@/interface/user-props";
import toast from "react-hot-toast";

export type Asset = {
  id: number;
  asset_name: string;
  capacity: number;
};

// Fetch all reservations with relations (PUBLIC endpoint)
const fetchReservations = async (): Promise<ReservationWithRelations[]> => {
  const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    return [];
  }

  return response.data;
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

// Hook to fetch all reservations (AUTHENTICATED - for admin/user pages)
export const useReservations = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['reservations', user?.id],
    queryFn: fetchReservations,
    // ✅ CRITICAL FIX: Set to 0 to force fresh fetch on every mount
    staleTime: 0, // Was 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !isAuthLoading && isAuthenticated,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    reservations: data || [],
    loading: isAuthLoading || isFetching,
    error: error?.message || null,
    refetch,
  };
};

// Hook to fetch all reservations (PUBLIC - for main landing page)
export const usePublicReservations = () => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['public-reservations'],
    queryFn: fetchReservations,
    staleTime: 0, // Force fresh fetch
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: true,
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

      // Check cache first
      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(['asset', id]);
        if (cached) {
          assets.set(id, cached);
        } else {
          missingIds.push(id);
        }
      }

      // Fetch missing assets
      if (missingIds.length > 0) {
        const assetPromises = missingIds.map(id => fetchReservation(id));
        const fetchedAssets = await Promise.all(assetPromises);

        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            queryClient.setQueryData(['asset', assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000, // Assets change less frequently
    enabled: assetIds.length > 0 && !isAuthLoading && isAuthenticated,
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

      // Check cache first
      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(['public-asset', id]);
        if (cached) {
          assets.set(id, cached);
        } else {
          missingIds.push(id);
        }
      }

      // Fetch missing assets using PUBLIC endpoint
      if (missingIds.length > 0) {
        const assetPromises = missingIds.map(id => fetchPublicAsset(id));
        const fetchedAssets = await Promise.all(assetPromises);

        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            queryClient.setQueryData(['public-asset', assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000,
    enabled: assetIds.length > 0,
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