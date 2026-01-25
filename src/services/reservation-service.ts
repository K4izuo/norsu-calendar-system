import { apiClient } from "@/lib/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserId } from "@/lib/auth";
import { ReservationWithRelations } from "@/interface/user-props";
import { useState, useEffect } from "react";

export type Asset = {
  id: number;
  asset_name: string;
  capacity: number;
};

// Fetch all reservations with relations
const fetchReservations = async (): Promise<ReservationWithRelations[]> => {
  const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    return []; // Return empty array instead of throwing error
  }

  return response.data;
};

// Fetch a single asset by ID
const fetchAsset = async (id: number): Promise<Asset | null> => {
  const response = await apiClient.get<Asset[]>(`/reservations/${id}`);

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data || response.data.length === 0) {
    return null;
  }

  return response.data[0];
};

// Hook to fetch all reservations
export const useReservations = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setIsAuthChecking(false);
  }, []);

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['reservations', userId], // Include userId in the cache key
    queryFn: fetchReservations,
    staleTime: 0, // Always refetch to show loading state
    refetchOnWindowFocus: false, // Don't refetch on window focus
    enabled: !!userId, // Only fetch if user is logged in
  });

  return {
    reservations: data || [],
    loading: isAuthChecking || isFetching, // Loading while checking auth or fetching
    error: error?.message || null,
    refetch,
  };
};

// Hook to fetch multiple assets efficiently
export const useAssets = (assetIds: number[]) => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setIsAuthChecking(false);
  }, []);

  // Fetch all assets in parallel
  const queries = useQuery({
    queryKey: ['reservation-assets', userId, assetIds.sort().join(',')],
    queryFn: async () => {
      const uniqueIds = [...new Set(assetIds)];
      
      // Try to get from cache first
      const assets = new Map<number, Asset>();
      const missingIds: number[] = [];

      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(['asset', id]);
        if (cached) {
          assets.set(id, cached);
        } else {
          missingIds.push(id);
        }
      }

      // Fetch only missing assets
      if (missingIds.length > 0) {
        const assetPromises = missingIds.map(id => fetchAsset(id));
        const fetchedAssets = await Promise.all(assetPromises);

        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            // Cache individual assets
            queryClient.setQueryData(['asset', assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: assetIds.length > 0 && !!userId,
  });

  return {
    assets: queries.data || new Map<number, Asset>(),
    loading: isAuthChecking || queries.isFetching,
    error: queries.error?.message || null,
  };
};

// Hook to fetch a single asset
export const useAsset = (id: number) => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const id = getUserId();
    setUserId(id);
    setIsAuthChecking(false);
  }, []);

  const { data, isFetching, error } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAsset(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id && !!userId,
  });

  return {
    asset: data || null,
    loading: isAuthChecking || isFetching,
    error: error?.message || null,
  };
};
