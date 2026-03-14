import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { ReservationFormData, ReservationAPIPayload, Reservation, EventDetails, ReservationWithRelations } from "@/interface/user-props"
import { RESERVATION_VALIDATION_RULES } from "@/features/reservations/utils/reservation-validation-rules"
import { apiClient } from "@/core/api/api-client"
import { useAuth } from "@/shared/components/context/auth-context"
import { checkReservationConflicts } from "@/features/reservations/utils/reservation-conflict-check"
import { useQueryClient } from "@tanstack/react-query"
import { fetchReservations } from "@/features/calendar/services/reservation-service"
import { normalizeTime, normalizeDate } from "./useFormNormalizers"
import { usePeopleTagging } from "./usePeopleTagging"
import { useAssetSelection } from "./useAssetSelection"

interface ReservationResponse {
  reservation: {
    id: number
    title_name: string
    asset_id: number
    time_start: string
    time_end: string
    description: string
    range: number
    people_tag: string
    info_type: string
    category: string
    date: string
    status: string
    created_at: string
    updated_at: string
    reserve_by_user: number
  }
  message: string
}

interface UseReserveEventFormProps {
  eventDate?: string | undefined
  onSubmit?: (data: ReservationAPIPayload) => void
  onClose: () => void
  isOpen: boolean
  onNewReservation?: (reservation: Reservation) => void
  editMode?: boolean
  eventData?: EventDetails
}

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const useReserveEventForm = ({ eventDate, onClose, isOpen, onNewReservation, editMode = false, eventData }: UseReserveEventFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("form");
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const {
    tagInput,
    setTagInput,
    taggedPeople,
    showDropdown,
    setShowDropdown,
    peopleFieldRef,
    setTaggedPeople,
    handleTagInputChange,
    handleTagSelect,
    handleRemoveTag,
  } = usePeopleTagging();

  const form = useForm<ReservationFormData>({
    mode: "onTouched",
    defaultValues: {
      title_name: "",
      asset: undefined,
      time_start: getCurrentTime(),
      time_end: getCurrentTime(),
      description: "",
      range: 1,
      people_tag: "",
      info_type: "",
      category: "",
      date: eventDate || "",
    },
  });

  const { control, handleSubmit, setValue, getValues, watch, register, trigger, formState: { errors, isSubmitting }, reset } = form;

  const {
    showVenueModal,
    setShowVenueModal,
    showVehicleModal,
    setShowVehicleModal,
    handleAssetChange,
    handleAssetItemSelect,
  } = useAssetSelection(setValue);

  useEffect(() => {
    if (eventDate) {
      setValue("date", eventDate);
    }
  }, [eventDate, setValue]);

  useEffect(() => {
    const peopleValue = taggedPeople.map(p => p.name).join(', ');
    const hasBeenTouched = form.formState.touchedFields.people_tag;

    setValue("people_tag", peopleValue, {
      shouldDirty: taggedPeople.length > 0,
      shouldValidate: hasBeenTouched,
      shouldTouch: false
    });
  }, [taggedPeople, setValue, form.formState.touchedFields.people_tag]);

  useEffect(() => {
    if (isOpen && !editMode) {
      const currentTime = getCurrentTime();
      setValue("time_start", currentTime);
      setValue("time_end", currentTime);
      setActiveTab("form");
    } else if (!isOpen) {
      const currentTime = getCurrentTime();
      reset({
        title_name: "",
        asset: undefined,
        time_start: currentTime,
        time_end: currentTime,
        description: "",
        range: 1,
        people_tag: "",
        info_type: "",
        category: "",
        date: eventDate || "",
      }, {
        keepErrors: false,
        keepDirty: false,
        keepIsSubmitted: false,
        keepTouched: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });
      setTaggedPeople([]);
      setTagInput("");
      setIsCheckingConflict(false);
    }
  }, [isOpen, setValue, reset, eventDate, editMode, setTaggedPeople, setTagInput]);

  const isFormValid = useCallback((): boolean => {
    const values = getValues();
    return Boolean(
      values.title_name &&
      values.asset &&
      values.time_start &&
      values.time_end &&
      values.time_end > values.time_start &&
      values.description &&
      values.range &&
      values.info_type &&
      values.category &&
      taggedPeople.length > 0
    );
  }, [getValues, taggedPeople.length]);

  const onSubmitForm = useCallback(
    async (data: ReservationFormData) => {
      try {
        const { asset, ...rest } = data;

        const normalizedTimeStart = normalizeTime(rest.time_start);
        const normalizedTimeEnd = normalizeTime(rest.time_end);
        const normalizedDate = normalizeDate(rest.date);

        const formDataWithPeople = {
          ...rest,
          time_start: normalizedTimeStart,
          time_end: normalizedTimeEnd,
          date: normalizedDate,
          asset_id: asset?.id ?? 0,
          people_tag: taggedPeople.map(p => p.name).join(", "),
          reserved_by_user: parseInt(user?.id || "0"),
        };

        let response;
        if (editMode && eventData?.id) {
          response = await apiClient.put<
            ReservationResponse,
            ReservationAPIPayload
          >(`/event/reservation/${eventData.id}`, formDataWithPeople);

          if (response.error) {
            const errorMsg = typeof response.error === "string"
              ? response.error
              : JSON.stringify(response.error);
            toast.error(`Update failed: ${errorMsg}`);
            return;
          }

          onClose();
          toast.success("Event reservation updated successfully!");
        } else {
          response = await apiClient.post<
            ReservationResponse,
            ReservationAPIPayload
          >("/event/reservation", formDataWithPeople);

          if (response.error) {
            const errorMsg = typeof response.error === "string"
              ? response.error
              : JSON.stringify(response.error);
            toast.error(`Reservation failed: ${errorMsg}`);
            return;
          }

          if (response.data?.reservation) {
            onNewReservation?.(response.data.reservation);
          }

          onClose();
          toast.success("Event reservation sent successfully!");
        }

        await queryClient.invalidateQueries({
          queryKey: ['reservations', user?.id]
        });

        await queryClient.invalidateQueries({
          queryKey: ['public-reservations']
        });

        const currentTime = getCurrentTime();

        reset(
          {
            title_name: "",
            asset: undefined,
            time_start: currentTime,
            time_end: currentTime,
            description: "",
            range: 1,
            people_tag: "",
            info_type: "",
            category: "",
            date: eventDate || "",
          },
          {
            keepErrors: false,
            keepDirty: false,
            keepIsSubmitted: false,
            keepTouched: false,
            keepIsValid: false,
            keepSubmitCount: false,
          }
        );

        setTaggedPeople([]);
        setTagInput("");
        setActiveTab("form");
        onClose();

      } catch {
        toast.error(editMode ? "Failed to update event. Please try again." : "Failed to reserve event. Please try again.");
      }
    },
    [reset, onClose, taggedPeople, eventDate, onNewReservation, editMode, eventData, user?.id, queryClient, setTaggedPeople, setTagInput]
  );

  const handleFormTabNext = useCallback(async () => {
    const isValid = await trigger(['title_name', 'asset', 'time_start', 'time_end', 'description', 'range']);

    if (!isValid) {
      return;
    }

    setIsCheckingConflict(true);

    try {
      const values = getValues();

      if (!values.asset?.id) {
        toast.error("Please select an asset first.");
        setIsCheckingConflict(false);
        return;
      }

      // Fetch reservations (using cache if fresh)
      let freshReservations: ReservationWithRelations[] = [];
      try {
        // Use the same query key structure as the service
        const queryKey = user?.id ? ['reservations', user.id] : ['public-reservations'];

        freshReservations = await queryClient.ensureQueryData({
          queryKey,
          queryFn: fetchReservations,
          staleTime: 1000 * 60 * 2 // 2 mins cache
        });
      } catch (err) {
        console.error("API Error:", err);
        toast.error("Unable to load reservation data. Please try again.");
        setIsCheckingConflict(false);
        return;
      }

      if (freshReservations.length === 0) {
        setIsCheckingConflict(false);
        setActiveTab("additional");
        return;
      }

      const normalizedTimeStart = normalizeTime(values.time_start);
      const normalizedTimeEnd = normalizeTime(values.time_end);
      const normalizedDate = normalizeDate(values.date);

      // Check for conflicts
      const conflicts = checkReservationConflicts({
        assetId: values.asset.id,
        date: normalizedDate,
        timeStart: normalizedTimeStart,
        timeEnd: normalizedTimeEnd,
        reservations: freshReservations,
        excludeId: editMode ? eventData?.id : undefined
      });

      setIsCheckingConflict(false);

      if (conflicts.length > 0) {
        const formatTimeTo12Hour = (time: string) => {
          if (!time) return "";
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const hour12 = hour % 12 || 12;
          return `${hour12}:${minutes} ${ampm}`;
        };

        const conflictDetails = conflicts.map(c => {
          const conflictMsg = c.conflictType === 'start'
            ? 'Start time conflicts'
            : c.conflictType === 'end'
              ? 'End time conflicts'
              : 'Overlaps completely';

          const timeStart = formatTimeTo12Hour(c.time_start);
          const timeEnd = formatTimeTo12Hour(c.time_end);

          return `- ${c.title_name} (${timeStart} - ${timeEnd})\n - ${conflictMsg}`;
        }).join('\n');

        toast.error(
          `Time slot conflicts detected with ${conflicts.length} approved event(s):\n\n${conflictDetails}`,
          {
            duration: 8000,
            style: {
              maxWidth: '500px',
              whiteSpace: 'pre-line',
            }
          }
        );
        return;
      }

      // No conflicts, proceed to next tab
      setActiveTab("additional");
    } catch (err) {
      console.error("Conflict check error:", err);
      setIsCheckingConflict(false);
      toast.error("Failed to check for conflicts. Please try again.");
      return;
    }
  }, [trigger, getValues, editMode, eventData, setActiveTab, queryClient, user?.id]);

  const handleAdditionalTabNext = useCallback(async () => {
    setValue("people_tag", taggedPeople.map(p => p.name).join(', '), {
      shouldValidate: true,
      shouldTouch: true
    });

    const isValid = await trigger(['people_tag', 'info_type', 'category']);

    if (isValid && taggedPeople.length > 0) {
      setActiveTab("summary");
    }
  }, [trigger, taggedPeople, setValue]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmitForm)();
  };

  const resetForm = useCallback(() => {
    reset();
    setTaggedPeople([]);
    setTagInput("");
    setActiveTab("form");
  }, [reset, setTaggedPeople, setTagInput]);

  return {
    form,
    control,
    errors,
    isSubmitting,
    register,
    watch,
    activeTab,
    setActiveTab,
    showVenueModal,
    setShowVenueModal,
    showVehicleModal,
    setShowVehicleModal,
    tagInput,
    taggedPeople,
    showDropdown,
    setShowDropdown,
    peopleFieldRef,
    watchedAsset: watch("asset"),
    getValues,
    setValue,
    setTaggedPeople,
    handleAssetChange,
    handleAssetItemSelect,
    handleTagInputChange,
    handleTagSelect,
    handleRemoveTag,
    isFormValid,
    handleFormTabNext,
    handleAdditionalTabNext,
    handleFormSubmit,
    resetForm,
    validationRules: RESERVATION_VALIDATION_RULES,
    isCheckingConflict,
  };
};
