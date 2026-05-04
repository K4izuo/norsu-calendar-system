import { apiClient } from "@/core/api/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/shared/components/context/auth-context";
import type { Person, CreatePersonPayload, LinkUserPayload } from "../types/people.types";

const fetchPeople = async (): Promise<Person[]> => {
  const response = await apiClient.get<Person[]>('people');

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data || [];
};

export const usePeople = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isLoading, isFetching, isStale, error, refetch } = useQuery({
    queryKey: ['people', user?.id],
    queryFn: fetchPeople,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !isAuthLoading && isAuthenticated,
    placeholderData: (prev) => prev,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  return {
    people: data || [],
    loading: isAuthLoading || isLoading || isFetching,
    isFetching,
    isStale,
    error: error?.message || null,
    refetch,
  };
};

export const useCreatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePersonPayload): Promise<Person> => {
      const response = await apiClient.post<Person, CreatePersonPayload>('people', data);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to create person');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'], refetchType: 'all' });
      toast.success('Person added successfully!', { position: 'top-right', duration: 4000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to add person: ${error.message}`, { position: 'top-right', duration: 4000 });
    },
  });
};

export const useUpdatePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreatePersonPayload }): Promise<Person> => {
      const response = await apiClient.put<Person, CreatePersonPayload>(`people/${id}`, data);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to update person');
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'], refetchType: 'all' });
      toast.success('Person updated successfully!', { position: 'top-right', duration: 4000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update person: ${error.message}`, { position: 'top-right', duration: 4000 });
    },
  });
};

export const useDeletePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const response = await apiClient.delete<void>(`people/${id}`);
      if (response.error) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'], refetchType: 'all' });
      toast.success('Person deleted successfully!', { position: 'top-right', duration: 4000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete person: ${error.message}`, { position: 'top-right', duration: 4000 });
    },
  });
};

export const useLinkUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId, data }: { personId: number; data: LinkUserPayload }): Promise<Person> => {
      const response = await apiClient.post<{ person: Person }, LinkUserPayload>(
        `people/${personId}/link-user`,
        data
      );
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to link user');
      return response.data.person;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'], refetchType: 'all' });
      toast.success('User linked successfully!', { position: 'top-right', duration: 4000 });
    },
    onError: (error: Error) => {
      toast.error(`Failed to link user: ${error.message}`, { position: 'top-right', duration: 4000 });
    },
  });
};
