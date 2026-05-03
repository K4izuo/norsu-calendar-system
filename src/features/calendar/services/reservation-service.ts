import { apiClient } from "@/core/api/api-client";
import { QueryClient, useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/shared/components/context/auth-context";
import { ReservationWithRelations, MoveReservationPayload, ReservationAPIPayload, RequestorInfo } from "@/interface/user-props";
import toast from "react-hot-toast";

const DASHBOARD_RESERVATIONS_STALE_TIME = 60 * 1000;

export type Asset = {
  id: number;
  asset_name: string;
  capacity: number;
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
};

const parseJsonValue = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

export const normalizeTagged = (value: unknown): RequestorInfo["tagged"] | undefined => {
  const parsed = parseJsonValue(value);

  if (!Array.isArray(parsed)) return undefined;

  const tagged = parsed
    .map((item, index) => {
      if (typeof item === "string") {
        return { id: -(index + 1), name: item };
      }

      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const name = record.name ?? record.label ?? record.office_name ?? record.degree_name;
      const id = toNumber(record.id ?? record.value);

      return typeof name === "string" && name.trim()
        ? { id: id || -(index + 1), name }
        : null;
    })
    .filter((item): item is { id: number; name: string } => item !== null);

  return tagged.length > 0 ? tagged : undefined;
};

export const normalizeRequestor = (value: unknown): RequestorInfo | undefined => {
  if (!value) return undefined;

  const parsed = parseJsonValue(value);

  if (typeof parsed === "string") {
    const type = parsed.trim().toLowerCase();
    return type === "student" || type === "faculty" || type === "office"
      ? { type }
      : undefined;
  }

  if (!parsed || typeof parsed !== "object") return undefined;

  const record = parsed as Record<string, unknown>;
  const nestedRequestor = normalizeRequestor(record.requestor ?? record.requestor_info ?? record.requestorInfo);

  const rawType = record.type ?? record.requestor_type ?? record.requestorType ?? nestedRequestor?.type ?? record.requestor;
  const type = typeof rawType === "string" ? rawType.trim().toLowerCase() : rawType;

  if (type !== "student" && type !== "faculty" && type !== "office") {
    return nestedRequestor;
  }

  const tagged = normalizeTagged(
    record.tagged ??
    record.requestor_tagged ??
    record.requestorTagged ??
    record.requestor_tags ??
    record.requestorTags
  ) ?? nestedRequestor?.tagged;

  const rawStudentSubType = record.student_sub_type ?? record.studentSubType ?? record.requestor_student_sub_type ?? record.requestorStudentSubType;
  const studentSubType = typeof rawStudentSubType === "string"
    ? rawStudentSubType.trim().toLowerCase()
    : rawStudentSubType ?? nestedRequestor?.student_sub_type;
  const studentOrgName = record.student_org_name ?? record.studentOrgName ?? record.requestor_student_org_name ?? record.requestorStudentOrgName;
  const csgName = record.csg_name ?? record.csgName ?? record.requestor_csg_name ?? record.requestorCsgName;

  return {
    type,
    student_sub_type: studentSubType as RequestorInfo["student_sub_type"],
    student_org_name: typeof studentOrgName === "string" ? studentOrgName : nestedRequestor?.student_org_name,
    csg_name: typeof csgName === "string" ? csgName : nestedRequestor?.csg_name,
    tagged,
  };
};

export const normalizeReservation = (
  reservation: ReservationWithRelations,
): ReservationWithRelations => ({
  ...reservation,
  id: toNumber(reservation.id),
  asset_id: toNumber(reservation.asset_id),
  range: toNumber(reservation.range),
  involves_students: toBoolean(reservation.involves_students),
  requires_vpaa: toBoolean(reservation.requires_vpaa),
  requires_vpsas: toBoolean(reservation.requires_vpsas),
  requires_vpaf: toBoolean(reservation.requires_vpaf),
  requires_vprde: toBoolean(reservation.requires_vprde),
  is_moved: toBoolean(reservation.is_moved),
  requestor: normalizeRequestor(reservation),
});

// Fetch all reservations with relations (PUBLIC endpoint)
export const fetchReservations = async (): Promise<ReservationWithRelations[]> => {
  const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");
  if (response.error) throw new Error(response.error);
  if (!response.data) return [];
  return response.data.map(normalizeReservation);
};

// Fetch single asset by ID (PROTECTED endpoint)
const fetchReservation = async (id: number): Promise<Asset | null> => {
  const response = await apiClient.get<Asset[]>(`/reservations/${id}`);
  if (response.error) throw new Error(response.error);
  if (!response.data || response.data.length === 0) return null;
  return response.data[0];
};

// Fetch single asset by ID from public endpoint
const fetchPublicAsset = async (id: number): Promise<Asset | null> => {
  const response = await apiClient.get<Asset[]>(`/reservations/assets/${id}`);
  if (response.error) {
    console.warn(`Failed to fetch asset ${id}:`, response.error);
    return null;
  }
  if (!response.data || response.data.length === 0) return null;
  return response.data[0];
};

// Approve / Campus-Director-action reservation
const approveReservation = async ({
  reservationId,
  userId,
  action = "APPROVED",
}: {
  reservationId: number;
  userId: string | number;
  action?: "APPROVED" | "APPROVE" | "ENDORSE";
}): Promise<void> => {
  const response = await apiClient.put(`/reservations/${reservationId}`, {
    action,
    approved_by_user: userId,
  });
  if (response.error) throw new Error(response.error);
};

// Decline reservation
const declineReservation = async ({
  reservationId,
  userId,
  reason,
}: {
  reservationId: number;
  userId: string | number;
  reason?: string;
}): Promise<void> => {
  const response = await apiClient.put(`/reservations/${reservationId}`, {
    action: "DECLINED",
    declined_by_user: userId,
    reason: reason || "",
  });
  if (response.error) throw new Error(response.error);
};

// Move reservation
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

// Resubmit a declined reservation
const resubmitReservation = async ({
  reservationId,
  payload,
}: {
  reservationId: number;
  payload: ReservationAPIPayload;
}): Promise<void> => {
  const response = await apiClient.post(`/reservations/${reservationId}/resubmit`, payload);
  if (response.error) throw new Error(response.error);
};

// Fetch the approval queue for the current user's role
export const fetchQueue = async (): Promise<ReservationWithRelations[]> => {
  const response = await apiClient.get<ReservationWithRelations[]>("/reservations/queue", { cache: "no-store" });
  if (response.error) throw new Error(response.error);
  return (response.data ?? []).map(normalizeReservation);
};

// ─── Hooks ──────────────────────────────────────────────────────────────────

export const useReservations = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, isLoading, error, refetch, dataUpdatedAt, isSuccess } = useQuery({
    queryKey: ["reservations", user?.id],
    queryFn: fetchReservations,
    staleTime: DASHBOARD_RESERVATIONS_STALE_TIME,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !isAuthLoading && isAuthenticated,
    placeholderData: (previousData) => previousData,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("401")) return false;
      return failureCount < 2;
    },
  });

  const hasValidData = isSuccess && !!data && dataUpdatedAt > 0;

  return {
    reservations: data || [],
    loading: isAuthLoading || isLoading || isFetching,
    isFetching,
    hasData: hasValidData,
    isQueryEnabled: !isAuthLoading && isAuthenticated,
    error: error?.message || null,
    refetch,
  };
};

export const prefetchDashboardReservations = (
  queryClient: QueryClient,
  userId: string | number | null | undefined,
) => {
  if (!userId) return Promise.resolve();

  return queryClient.prefetchQuery({
    queryKey: ["reservations", userId],
    queryFn: fetchReservations,
    staleTime: DASHBOARD_RESERVATIONS_STALE_TIME,
  });
};

export const usePublicReservations = () => {
  const { data, isFetching, error, refetch } = useQuery({
    queryKey: ["public-reservations"],
    queryFn: fetchReservations,
    staleTime: 2 * 60 * 1000,
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

export const useGetQueue = () => {
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["reservation-queue", user?.id],
    queryFn: fetchQueue,
    staleTime: 10 * 1000,
    enabled: !isAuthLoading && isAuthenticated,
    refetchOnWindowFocus: true,
    refetchInterval: 15 * 1000,
  });

  return {
    queue: data || [],
    loading: isAuthLoading || isLoading || isFetching,
    isFetching,
    error: error?.message || null,
    refetch,
  };
};

export const useAssets = (assetIds: number[]) => {
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const queries = useQuery({
    queryKey: ["reservation-assets", user?.id, [...assetIds].sort().join(",")],
    queryFn: async () => {
      const uniqueIds = [...new Set(assetIds)];
      const assets = new Map<number, Asset>();
      const missingIds: number[] = [];

      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(["asset", id]);
        if (cached) { assets.set(id, cached); } else { missingIds.push(id); }
      }

      if (missingIds.length > 0) {
        const fetchedAssets = await Promise.all(missingIds.map(id => fetchReservation(id)));
        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            queryClient.setQueryData(["asset", assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000,
    enabled: assetIds.length > 0 && !isAuthLoading && isAuthenticated,
    placeholderData: (previousData) => previousData,
  });

  return {
    assets: queries.data || new Map<number, Asset>(),
    loading: isAuthLoading || queries.isLoading,
    error: queries.error?.message || null,
  };
};

export const usePublicAssets = (assetIds: number[]) => {
  const queryClient = useQueryClient();

  const queries = useQuery({
    queryKey: ["public-reservation-assets", [...assetIds].sort().join(",")],
    queryFn: async () => {
      const uniqueIds = [...new Set(assetIds)];
      const assets = new Map<number, Asset>();
      const missingIds: number[] = [];

      for (const id of uniqueIds) {
        const cached = queryClient.getQueryData<Asset>(["public-asset", id]);
        if (cached) { assets.set(id, cached); } else { missingIds.push(id); }
      }

      if (missingIds.length > 0) {
        const fetchedAssets = await Promise.all(missingIds.map(id => fetchPublicAsset(id)));
        fetchedAssets.forEach((asset, index) => {
          if (asset) {
            const assetId = missingIds[index];
            assets.set(assetId, asset);
            queryClient.setQueryData(["public-asset", assetId], asset);
          }
        });
      }

      return assets;
    },
    staleTime: 5 * 60 * 1000,
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

export const useAsset = (id: number) => {
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();

  const { data, isFetching, error } = useQuery({
    queryKey: ["asset", id],
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

const invalidateReservationQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["reservations"], refetchType: "all" });
  queryClient.invalidateQueries({ queryKey: ["public-reservations"], refetchType: "all" });
  queryClient.invalidateQueries({ queryKey: ["reservation-queue"], refetchType: "all" });
};

const removeReservationFromQueueQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  reservationId: number,
) => {
  queryClient.setQueriesData<ReservationWithRelations[]>(
    { queryKey: ["reservation-queue"] },
    (previous) => previous?.filter((reservation) => reservation.id !== reservationId),
  );
};

export const useApproveReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      reservationId,
      action = "APPROVED",
    }: {
      reservationId: number;
      action?: "APPROVED" | "APPROVE" | "ENDORSE";
    }) => {
      if (!user?.id) throw new Error("User not authenticated. Please login again.");
      return approveReservation({ reservationId, userId: user.id, action });
    },
    onSuccess: (_data, variables) => {
      removeReservationFromQueueQueries(queryClient, variables.reservationId);
      invalidateReservationQueries(queryClient);
      toast.success("Reservation approved successfully!");
    },
    onError: (err) => {
      console.error("Approve error:", err);
      toast.error("Failed to approve reservation");
    },
  });
};

export const useDeclineReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ reservationId, reason }: { reservationId: number; reason?: string }) => {
      if (!user?.id) throw new Error("User not authenticated. Please login again.");
      return declineReservation({ reservationId, userId: user.id, reason });
    },
    onSuccess: (_data, variables) => {
      removeReservationFromQueueQueries(queryClient, variables.reservationId);
      invalidateReservationQueries(queryClient);
      toast.success("Reservation declined successfully!");
    },
    onError: (err) => {
      console.error("Decline error:", err);
      toast.error("Failed to decline reservation");
    },
  });
};

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
      return moveReservation({ reservationId, payload: { ...payload, moved_by: Number(user.id) } });
    },
    onSuccess: () => {
      invalidateReservationQueries(queryClient);
    },
    onError: (err) => {
      console.error("Move reservation error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to move reservation");
    },
  });
};

export const useUpdateMultimediaComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reservationId, comment }: { reservationId: number; comment: string }) =>
      apiClient.put(`/reservations/${reservationId}/multimedia-comment`, { multimedia_comment: comment }),
    onSuccess: () => {
      invalidateReservationQueries(queryClient);
    },
    onError: (err) => {
      console.error("Multimedia comment error:", err);
      toast.error("Failed to save comment");
    },
  });
};

export const useResubmitReservation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({
      reservationId,
      payload,
    }: {
      reservationId: number;
      payload: ReservationAPIPayload;
    }) => {
      if (!user?.id) throw new Error("User not authenticated. Please login again.");
      return resubmitReservation({ reservationId, payload });
    },
    onSuccess: () => {
      invalidateReservationQueries(queryClient);
      toast.success("Reservation resubmitted successfully!");
    },
    onError: (err) => {
      console.error("Resubmit error:", err);
      toast.error("Failed to resubmit reservation");
    },
  });
};
