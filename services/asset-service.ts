import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AssetRegistrationPayload } from "@/interface/user-props";

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
};

// Fetch all assets
const fetchAssets = async (): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('/assets/all');

  if (response.error) {
    throw new Error(response.error);
  }

  if (!response.data || response.data.length === 0) {
    throw new Error("No assets found");
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
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
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

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      // Invalidate and refetch assets list
      queryClient.invalidateQueries({ queryKey: ['assets'] });

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