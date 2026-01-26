import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AssetRegistrationPayload } from "@/interface/user-props";
import { useAuth } from "@/contexts/auth-context"; // Import auth context

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
    return [];
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
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ['assets', user?.id],
    queryFn: fetchAssets,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    // Critical: Only fetch when auth is loaded AND user is authenticated
    enabled: !isAuthLoading && isAuthenticated,
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    assets: data || [],
    loading: isAuthLoading || isFetching,
    error: error?.message || null,
    refetch,
  };
};

// Hook to create asset
export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: (newAsset) => {
      // Optimistic update
      queryClient.setQueryData<Asset[]>(['assets', user?.id], (old) => {
        return old ? [...old, newAsset] : [newAsset];
      });

      // Invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['assets', user?.id] });

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