import React, { useCallback, useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { ReservationFormData, ReservationAPIPayload, Reservation, EventDetails, ReservationWithRelations } from "@/interface/user-props"
import { RESERVATION_VALIDATION_RULES } from "@/utils/reserve-event/reservation-validation-rules"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { checkReservationConflicts } from "@/utils/reserve-event/reservation-conflict-check"
import { useQueryClient } from "@tanstack/react-query"

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
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const { user } = useAuth();

  const queryClient = useQueryClient();

  const peopleFieldRef = useRef<HTMLInputElement>(null);

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
  }, [isOpen, setValue, reset, eventDate, editMode]);

  const handleAssetChange = (value: string) => {
    const numericValue = parseInt(value);

    if (numericValue === 1) {
      setShowVenueModal(true);
      return;
    }
    if (numericValue === 2) {
      setShowVehicleModal(true);
      return;
    }
  };

  const handleAssetItemSelect = (asset: { id: number; asset_name: string; asset_type: string; capacity: number }) => {
    setValue("asset", asset, { shouldValidate: true, shouldTouch: true });
    setShowVenueModal(false);
    setShowVehicleModal(false);
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setShowDropdown(e.target.value.length > 0);
  };

  const handleTagSelect = (person: { id: string; name: string }) => {
    if (!taggedPeople.some(p => p.id === person.id)) {
      setTaggedPeople([...taggedPeople, person]);
      setTagInput("");
      setShowDropdown(false);
    }
  };

  const handleRemoveTag = (id: string) => {
    setTaggedPeople(taggedPeople.filter(p => p.id !== id));
  };

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
        const normalizeTime = (time: string): string => {
          if (!time) return "00:00";
          const [hour, minute] = time.split(":");
          return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
        };

        const normalizeDate = (dateStr: string): string => {
          if (!dateStr) return "";

          // If already in YYYY-MM-DD format, return as-is
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }

          // Extract date portion from ISO string or datetime string
          // This prevents timezone conversion issues
          const datePart = dateStr.split('T')[0].split(' ')[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            return datePart;
          }

          // Fallback: parse as UTC to avoid timezone shifts
          const date = new Date(dateStr + 'T00:00:00Z');
          if (isNaN(date.getTime())) return "";
          
          const year = date.getUTCFullYear();
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const day = String(date.getUTCDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

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
    [reset, onClose, taggedPeople, eventDate, onNewReservation, editMode, eventData, user?.id, queryClient]
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

      // Fetch reservations from API
      const response = await apiClient.get<ReservationWithRelations[]>("/reservations/all");

      if (response.error || !response.data) {
        console.error("API Error:", response.error);
        toast.error("Unable to load reservation data. Please try again.");
        setIsCheckingConflict(false);
        return;
      }

      const freshReservations = response.data;

      // Provide feedback about fetched data
      const approvedCount = freshReservations.filter(r => 
        r.status?.toUpperCase() === 'APPROVED'
      ).length;
      
      if (freshReservations.length === 0) {
        toast.error("No reservations found in the system. Please contact support if this seems incorrect.");
        setIsCheckingConflict(false);
        return;
      }

      const normalizeTime = (time: string): string => {
        if (!time) return "00:00";
        const [hour, minute] = time.split(":");
        return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
      };

      const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return "";
        
        // Extract date portion from ISO string or datetime string
        // This prevents timezone conversion issues
        const datePart = dateStr.split('T')[0].split(' ')[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
        
        // Fallback: parse as UTC to avoid timezone shifts
        const date = new Date(dateStr + 'T00:00:00Z');
        if (isNaN(date.getTime())) return "";
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const normalizedTimeStart = normalizeTime(values.time_start);
      const normalizedTimeEnd = normalizeTime(values.time_end);
      const normalizedDate = normalizeDate(values.date);

      // DIAGNOSTIC: Show what we're checking
      const sameDateReservations = freshReservations.filter(r => {
        const rDate = normalizeDate(r.date);
        return rDate === normalizedDate && r.status?.toUpperCase() === 'APPROVED';
      });
      
      const sameAssetAndDateReservations = sameDateReservations.filter(r => 
        Number(r.asset_id) === Number(values.asset.id)
      );

      // Show asset IDs of existing reservations on this date
      const existingAssetIds = sameDateReservations.map(r => 
        `Asset ${r.asset_id}: ${r.title_name} (${r.time_start}-${r.time_end})`
      ).join('\n');

      toast(`🔍 Checking: Date="${normalizedDate}", Asset ID=${values.asset.id}, Time=${normalizedTimeStart}-${normalizedTimeEnd}\n\nFound ${sameDateReservations.length} approved on this date:\n${existingAssetIds || 'None'}\n\n${sameAssetAndDateReservations.length} matched your asset ID`, {
        duration: 8000
      });

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
        const conflictDetails = conflicts.map(c => {
          const conflictMsg = c.conflictType === 'start'
            ? 'Start time conflicts'
            : c.conflictType === 'end'
              ? 'End time conflicts'
              : 'Overlaps completely';

          return `• ${c.title_name} (${c.time_start} - ${c.time_end}) - ${conflictMsg}`;
        }).join('\n');

        toast.error(
          `Time slot conflicts detected with ${conflicts.length} approved event(s):\n\n${conflictDetails}`,
          { duration: 8000 }
        );
        return;
      }

      // Success feedback
      toast.success(`✅ No conflicts! Checked ${approvedCount} approved, ${sameAssetAndDateReservations.length} matched asset+date`, {
        duration: 3000
      });

      // No conflicts, proceed to next tab
      setActiveTab("additional");
    } catch (err) {
      console.error("Conflict check error:", err);
      setIsCheckingConflict(false);
      toast.error("Failed to check for conflicts. Please try again.");
      return;
    }
  }, [trigger, getValues, editMode, eventData, setActiveTab]);

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
  }, [reset]);

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