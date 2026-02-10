import React, { useCallback, useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { ReservationFormData, ReservationAPIPayload, Reservation, EventDetails } from "@/interface/user-props"
import { RESERVATION_VALIDATION_RULES } from "@/utils/reserve-event/reservation-validation-rules"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { checkReservationConflicts } from "@/utils/reserve-event/reservation-conflict-check"
import { useReservations } from "@/services/reservation-service"
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
  const [isCheckingConflict, setIsCheckingConflict] = useState(false); // ✅ NEW: Loading state
  const { user } = useAuth();

  // Fetch all reservations for conflict checking
  const { reservations, loading: reservationsLoading, hasData, isQueryEnabled } = useReservations();
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

  // Reset form when eventDate changes
  useEffect(() => {
    if (eventDate) {
      setValue("date", eventDate);
    }
  }, [eventDate, setValue]);

  // Sync tagged people with form field
  useEffect(() => {
    const peopleValue = taggedPeople.map(p => p.name).join(', ');
    const hasBeenTouched = form.formState.touchedFields.people_tag;

    setValue("people_tag", peopleValue, {
      shouldDirty: taggedPeople.length > 0,
      shouldValidate: hasBeenTouched,
      shouldTouch: false
    });
  }, [taggedPeople, setValue, form.formState.touchedFields.people_tag]);

  // Reset time when modal opens
  useEffect(() => {
    if (isOpen && !editMode) {
      const currentTime = getCurrentTime();
      setValue("time_start", currentTime);
      setValue("time_end", currentTime);
      setActiveTab("form");
    } else if (!isOpen) {
      // Reset form when modal closes to ensure clean state on next open
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
      setIsCheckingConflict(false); // ✅ Reset loading state
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
        // Normalize times to "HH:mm" (fixes your H:i validation)
        const normalizeTime = (time: string): string => {
          if (!time) return "00:00";
          const [hour, minute] = time.split(":");
          return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
        };

        // Ensure date is in YYYY-MM-DD format for backend
        const normalizeDate = (dateStr: string): string => {
          if (!dateStr) return "";

          // If already in YYYY-MM-DD format, return as-is
          if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
          }

          // Parse and format
          const date = new Date(dateStr);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const { asset, ...rest } = data;

        const normalizedTimeStart = normalizeTime(rest.time_start);
        const normalizedTimeEnd = normalizeTime(rest.time_end);
        const normalizedDate = normalizeDate(rest.date);

        // NO CONFLICT CHECK HERE - Already checked in Event Details "Next" button

        // Final payload you're actually sending
        const formDataWithPeople = {
          ...rest,
          time_start: normalizedTimeStart,
          time_end: normalizedTimeEnd,
          date: normalizedDate,
          asset_id: asset?.id ?? 0,
          people_tag: taggedPeople.map(p => p.name).join(", "),
          reserved_by_user: parseInt(user?.id || "0"),
        };

        // Different API calls for create vs update
        let response;
        if (editMode && eventData?.id) {
          // Update existing reservation
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

          // ✅ CLOSE MODAL AND SHOW SUCCESS TOAST AT THE SAME TIME
          onClose();
          toast.success("Event reservation updated successfully!");
        } else {
          // Create new reservation
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

          // ✅ CLOSE MODAL AND SHOW SUCCESS TOAST AT THE SAME TIME
          onClose();
          toast.success("Event reservation sent successfully!");
        }

        // Invalidate cache to refresh reservations (in background)
        await queryClient.invalidateQueries({
          queryKey: ['reservations', user?.id]
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

      } catch (error) {
        console.error("Reservation error:", error);
        toast.error(editMode ? "Failed to update event. Please try again." : "Failed to reserve event. Please try again.");
      }
    },
    [reset, onClose, taggedPeople, eventDate, onNewReservation, editMode, eventData, user?.id, queryClient]
  );

  const handleFormTabNext = useCallback(async () => {
    // First validate the form fields
    const isValid = await trigger(['title_name', 'asset', 'time_start', 'time_end', 'description', 'range']);

    if (!isValid) {
      return; // Stop if form validation fails
    }

    // ✅ START: Show loading state
    setIsCheckingConflict(true);

    // Form is valid, now check for conflicts
    try {
      const values = getValues();

      // ✅ WAIT A BIT: Let the UI update before heavy processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // ✅ CRITICAL FIX 1: Check if query is enabled (user authenticated)
      if (!isQueryEnabled) {
        toast.error("Authentication required. Please log in and try again.");
        setIsCheckingConflict(false);
        return;
      }

      // ✅ CRITICAL FIX 2: Wait for loading to complete
      if (reservationsLoading) {
        toast.error("Loading reservation data, please wait...");
        setIsCheckingConflict(false);
        return;
      }

      // ✅ CRITICAL FIX 3: Verify data has been fetched
      if (!hasData) {
        toast.error("Unable to load reservation data. Please refresh the page.");
        setIsCheckingConflict(false);
        return;
      }

      // ✅ CRITICAL FIX 4: Validate reservations array
      if (!Array.isArray(reservations)) {
        toast.error("Invalid reservation data. Please refresh the page.");
        setIsCheckingConflict(false);
        return;
      }

      // Normalize times to "HH:mm" format
      const normalizeTime = (time: string): string => {
        if (!time) return "00:00";
        const [hour, minute] = time.split(":");
        return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
      };

      // Ensure date is in YYYY-MM-DD format
      const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return "";

        // If already in YYYY-MM-DD format, return as-is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }

        // Parse and format
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const normalizedTimeStart = normalizeTime(values.time_start);
      const normalizedTimeEnd = normalizeTime(values.time_end);
      const normalizedDate = normalizeDate(values.date);

      // ✅ PRODUCTION DEBUG: Show what data we're working with
      const approvedReservations = reservations.filter(r =>
        r.status?.toUpperCase() === 'APPROVED' &&
        r.asset_id === values.asset?.id &&
        r.date === normalizedDate
      );

      // ✅ FORCE SHOW DEBUG INFO (This WILL show on Vercel)
      alert(`DEBUG INFO:
Total Reservations: ${reservations.length}
Checking Asset ID: ${values.asset?.id}
Checking Date: ${normalizedDate}
Checking Time: ${normalizedTimeStart} - ${normalizedTimeEnd}
Approved on same date/asset: ${approvedReservations.length}
${approvedReservations.length > 0 ? '\nFound:\n' + approvedReservations.map(r => `${r.title_name} (${r.time_start} - ${r.time_end})`).join('\n') : ''}`);

      // ✅ ADD MINIMUM DELAY: Ensure loading is visible (500ms minimum)
      await new Promise(resolve => setTimeout(resolve, 500));

      // ✅ CHECK FOR CONFLICTS HERE (ONLY PLACE)
      const conflicts = checkReservationConflicts({
        assetId: values.asset?.id ?? 0,
        date: normalizedDate,
        timeStart: normalizedTimeStart,
        timeEnd: normalizedTimeEnd,
        reservations: reservations,
        excludeId: editMode ? eventData?.id : undefined
      });

      // ✅ FORCE SHOW CONFLICT RESULT
      alert(`CONFLICT CHECK RESULT: ${conflicts.length} conflicts found`);

      // ✅ STOP: Hide loading state
      setIsCheckingConflict(false);

      if (conflicts.length > 0) {
        // Show detailed error with conflict type
        const conflictDetails = conflicts.map(c => {
          const conflictMsg = c.conflictType === 'start'
            ? 'START time conflicts'
            : c.conflictType === 'end'
              ? 'END time conflicts'
              : 'Both START and END times conflict';

          return `- ${c.title_name} (${c.time_start} - ${c.time_end}) - ${conflictMsg}`;
        }).join('\n');

        const errorMessage = `Cannot proceed: Time slot conflicts detected with ${conflicts.length} approved event(s):\n\n${conflictDetails}`;

        alert(errorMessage);
        toast.error(errorMessage, { duration: 8000 });
        return; // Stop here, don't advance to next tab
      }

      // No conflicts, proceed to next tab
      setActiveTab("additional");
    } catch (error) {
      console.error("Error checking conflicts:", error);
      setIsCheckingConflict(false);
      toast.error("Failed to check for conflicts. Please try again.");
    }
  }, [trigger, getValues, reservations, editMode, eventData, setActiveTab, reservationsLoading, hasData, isQueryEnabled]);

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
    isCheckingConflict, // ✅ NEW: Expose loading state
  };
};