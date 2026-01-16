import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AssetRegistrationPayload } from "@/interface/user-props";

export type Campus = { id: number; campus_name: string };
export type Office = { id: number; office_name: string };
export type Course = { id: number; degree_name: string };
export type Asset = {
  id: number;
  asset_name: string;
  asset_type: string;
  capacity: number;
  location: string;
};
export type OptionType = { value: string; label: string };

// Helper function to determine error message based on error text and resource type
function getErrorMessage(error: string, resourceType: string) {
  const errorLower = error.toLowerCase();

  if (errorLower.includes("not found") || errorLower.includes("404"))
    return `${resourceType} list not found on server`;

  if (errorLower.includes(resourceType.toLowerCase()))
    return `No ${resourceType.toLowerCase()}s available at this time`;

  if (errorLower.includes("permission") || errorLower.includes("unauthorized"))
    return `You don't have permission to view ${resourceType.toLowerCase()}s`;

  if (errorLower.includes("connection") || errorLower.includes("network"))
    return `Network error while loading ${resourceType.toLowerCase()}s`;

  return `Failed to load ${resourceType.toLowerCase()}s`;
}

// Helper function to map API data to dropdown options
function mapToOptions<T extends { id: number }>(
  data: T[],
  labelKey: keyof T
): OptionType[] {
  return data.map(item => ({
    value: item.id.toString(),
    label: String(item[labelKey])
  }));
}

// API fetcher functions
const fetchCampuses = async (): Promise<OptionType[]> => {
  const response = await apiClient.get<Campus[]>('campuses/all');

  if (response.error) {
    throw new Error(getErrorMessage(response.error, "Campus"));
  }

  if (!response.data || response.data.length === 0) {
    throw new Error("No campuses found");
  }

  return mapToOptions(response.data, 'campus_name');
};

const fetchOffices = async (): Promise<OptionType[]> => {
  const response = await apiClient.get<Office[]>('offices/all');

  if (response.error) {
    throw new Error(getErrorMessage(response.error, "Office"));
  }

  if (!response.data || response.data.length === 0) {
    throw new Error("No offices found");
  }

  return mapToOptions(response.data, 'office_name');
};

const fetchCourses = async (): Promise<OptionType[]> => {
  const response = await apiClient.get<Course[]>('courses/all');

  if (response.error) {
    throw new Error(getErrorMessage(response.error, "Course"));
  }

  if (!response.data || response.data.length === 0) {
    throw new Error("No courses found");
  }

  return mapToOptions(response.data, 'degree_name');
};

const fetchAssets = async (): Promise<Asset[]> => {
  const response = await apiClient.get<Asset[]>('assets/all');

  if (response.error) {
    throw new Error(getErrorMessage(response.error, "Asset"));
  }

  if (!response.data || response.data.length === 0) {
    throw new Error("No assets found");
  }

  return response.data;
};

// Asset mutation function
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

// Hooks using TanStack Query
export const useCampuses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['campuses'],
    queryFn: fetchCampuses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    campuses: data || [],
    loading: isLoading,
    error: error?.message || null
  };
};

export const useOffices = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['offices'],
    queryFn: fetchOffices,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    offices: data || [],
    loading: isLoading,
    error: error?.message || null
  };
};

export const useCourses = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    courses: data || [],
    loading: isLoading,
    error: error?.message || null
  };
};

export const useAssets = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
    staleTime: 2 * 60 * 1000, // 2 minutes (assets might change more frequently)
  });

  return {
    assets: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch
  };
};

// Mutation hook for creating assets
export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      // Invalidate and refetch assets list
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      toast.success("Asset registered successfully!");
    },
    onError: (error: Error) => {
      console.error("Error creating asset:", error);
      toast.error(error.message || "Failed to register asset");
    },
  });
};