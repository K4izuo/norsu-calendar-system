import { apiClient } from "@/lib/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { ReservationWithRelations } from "@/interface/user-props";

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

// Hook to fetch all reservations (AUTHENTICATED - for admin/user pages)
export const useReservations = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['reservations', user?.id],
    queryFn: fetchReservations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    enabled: true, // Always enabled, no auth required
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
    staleTime: 5 * 60 * 1000,
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
    enabled: assetIds.length > 0, // Always enabled, no auth required
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