import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AssetRegistrationPayload } from "@/interface/user-props";
import { getUserId } from "@/lib/auth";

export type Asset = {
  id: number;
  asset_name: string;
  asset_type: string;
  location: string;
  capacity: number;
  availability_status: string;
  condition: string;
  acquisition_date: string;
  campus_id: number;
  office_id: number;
  created_by: number;
};

// Fetch all assets
const fetchAssets = async (): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets/all');

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data || response.data.length === 0) {
    return []; // Return empty array instead of throwing error
  }

  return response.data;
};

// Create asset
const createAsset = async (data: AssetRegistrationPayload): Promise<Asset> => {
  const response = await apiClient.post<Asset, AssetRegistrationPayload>('assets/store', data);

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data) {
    throw new Error("Failed to create asset");
  }

  return response.data;
};

// Hook to fetch all assets
export const useAssets = () => {
  const userId = getUserId(); // Get current logged-in user ID

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assets', userId], // Include userId in the cache key
    queryFn: fetchAssets,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    enabled: !!userId, // Only fetch if user is logged in
  });

  return {
    assets: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
};

// Hook to create asset
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const userId = getUserId();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      // Invalidate queries for the current user
      queryClient.invalidateQueries({ queryKey: ['assets', userId] });

      toast.success('Asset registered successfully!', {
        position: 'top-right',
        duration: 4000,
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to register asset: ${error.message}`, {
        position: 'top-right',
        duration: 4000,
      });
    },
  });
};