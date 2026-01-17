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

// ============ QUERY KEYS (Centralized) ============
export const queryKeys = {
  campuses: ['campuses'] as const,
  offices: ['offices'] as const,
  courses: ['courses'] as const,
  assets: ['assets'] as const,
} as const;

// ============ HELPER FUNCTIONS ============
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

function mapToOptions<T extends { id: number }>(
  data: T[],
  labelKey: keyof T
): OptionType[] {
  return data.map(item => ({
    value: item.id.toString(),
    label: String(item[labelKey])
  }));
}

// ============ API FETCHERS ============
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

// ============ QUERY OPTIONS (Reusable Configuration) ============
export const campusesQueryOptions = {
  queryKey: queryKeys.campuses,
  queryFn: fetchCampuses,
  staleTime: 30 * 60 * 1000, // 30 minutes - campuses rarely change
  gcTime: 60 * 60 * 1000, // 1 hour
} as const;

export const officesQueryOptions = {
  queryKey: queryKeys.offices,
  queryFn: fetchOffices,
  staleTime: 30 * 60 * 1000, // 30 minutes - offices rarely change
  gcTime: 60 * 60 * 1000, // 1 hour
} as const;

export const coursesQueryOptions = {
  queryKey: queryKeys.courses,
  queryFn: fetchCourses,
  staleTime: 30 * 60 * 1000, // 30 minutes
  gcTime: 60 * 60 * 1000, // 1 hour
} as const;

export const assetsQueryOptions = {
  queryKey: queryKeys.assets,
  queryFn: fetchAssets,
  staleTime: 1 * 60 * 1000, // 1 minute - assets change more frequently
  gcTime: 5 * 60 * 1000, // 5 minutes
} as const;

// ============ HOOKS ============
export const useCampuses = () => {
  const query = useQuery(campusesQueryOptions);

  return {
    campuses: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isFetching: query.isFetching,
  };
};

export const useOffices = () => {
  const query = useQuery(officesQueryOptions);

  return {
    offices: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isFetching: query.isFetching,
  };
};

export const useCourses = () => {
  const query = useQuery(coursesQueryOptions);

  return {
    courses: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isFetching: query.isFetching,
  };
};

export const useAssets = () => {
  const query = useQuery(assetsQueryOptions);

  return {
    assets: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};

// ============ MUTATIONS ============
export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: (newAsset) => {
      // Optimistic update: immediately add to cache
      queryClient.setQueryData<Asset[]>(queryKeys.assets, (old) => {
        return old ? [...old, newAsset] : [newAsset];
      });

      // Then invalidate to refetch and ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.assets });

      toast.success("Asset registered successfully!");
    },
    onError: (error: Error) => {
      console.error("Error creating asset:", error);
      toast.error(error.message || "Failed to register asset");
    },
  });
};

// ============ PREFETCH UTILITIES ============
export const prefetchCampuses = (queryClient: ReturnType<typeof useQueryClient>) => {
  return queryClient.prefetchQuery(campusesQueryOptions);
};

export const prefetchOffices = (queryClient: ReturnType<typeof useQueryClient>) => {
  return queryClient.prefetchQuery(officesQueryOptions);
};

export const prefetchCourses = (queryClient: ReturnType<typeof useQueryClient>) => {
  return queryClient.prefetchQuery(coursesQueryOptions);
};