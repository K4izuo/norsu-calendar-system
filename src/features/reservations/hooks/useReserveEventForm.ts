import React, { useCallback, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { ReservationFormData, ReservationAPIPayload, Reservation, EventDetails, ReservationWithRelations, RequestorInfo } from "@/interface/user-props"
import { reservationSchema } from "@/features/reservations/utils/reservation-schema"
import { apiClient } from "@/core/api/api-client"
import { useAuth } from "@/shared/components/context/auth-context"
import { checkReservationConflicts } from "@/features/reservations/utils/reservation-conflict-check"
import { useQueryClient } from "@tanstack/react-query"
import { fetchReservations, normalizeRequestor, useResubmitReservation } from "@/features/calendar/services/reservation-service"
import { normalizeTime, normalizeDate } from "./useFormNormalizers"
import { usePeopleTagging } from "./usePeopleTagging"
import { useAssetSelection } from "./useAssetSelection"
import { usePeople } from "@/features/people/services/people-service"

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
  resubmitMode?: boolean
  eventData?: EventDetails
  userRole?: number
  userOffice?: { oversight_vp_id: number | null }
}

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const toFormBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
};

const getEventRequestor = (eventData: EventDetails): RequestorInfo | undefined => {
  return normalizeRequestor({
    requestor: eventData.requestor,
    requestor_type: eventData.requestor_type,
    student_sub_type: eventData.student_sub_type,
    student_org_name: eventData.student_org_name,
    csg_name: eventData.csg_name,
    requestor_tagged: eventData.requestor_tagged,
  });
};

export const useReserveEventForm = ({ eventDate, onClose, isOpen, onNewReservation, editMode = false, resubmitMode = false, eventData, userRole, userOffice }: UseReserveEventFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("requestor");
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [equipmentTouched, setEquipmentTouched] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestor, setRequestor] = useState<RequestorInfo | null>(null);
  const [requestorError, setRequestorError] = useState<string>("");
  const [showOutsource, setShowOutsource] = useState(false);
  const [showGuest, setShowGuest] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [guestDetailsInput, setGuestDetailsInput] = useState("");
  const [outsourceError, setOutsourceError] = useState<string | null>(null);
  const [guestNameError, setGuestNameError] = useState<string | null>(null);
  const [guestDetailsError, setGuestDetailsError] = useState<string | null>(null);
  const { user } = useAuth();
  const { mutateAsync: resubmit } = useResubmitReservation();

  const { people } = usePeople();
  const peopleSuggestions = people.map(p => ({ id: p.id, name: p.personName }));

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

  const isDean = userRole === 1
  const isHeadOfOffice = userRole === 10
  const oversightVpId = userOffice?.oversight_vp_id ?? null

  const form = useForm<ReservationFormData>({
    mode: "onTouched",
    resolver: zodResolver(reservationSchema) as Resolver<ReservationFormData>,
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
      other_category: "",
      date: eventDate || "",
      equipment: [],
      involves_students: false,
      requires_vpaa: isDean,
      requires_vpsas: false,
      requires_vpaf: false,
      requires_vprde: false,
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

  // Dean: always force VPAA on
  useEffect(() => {
    if (isDean) {
      setValue("requires_vpaa", true);
    }
  }, [isDean, setValue]);

  // HO under oversight VP: force that VP's flag on
  useEffect(() => {
    if (!isHeadOfOffice || !oversightVpId) return;
    const vpRoleToField: Record<number, keyof ReservationFormData> = {
      6: "requires_vpaa",
      7: "requires_vpsas",
      8: "requires_vpaf",
      9: "requires_vprde",
    };
    const field = vpRoleToField[oversightVpId];
    if (field) setValue(field as "requires_vpaa" | "requires_vpsas" | "requires_vpaf" | "requires_vprde", true);
  }, [isHeadOfOffice, oversightVpId, setValue]);

  // involves_students → auto-check VPSAS; uncheck when students unchecked
  const watchedInvolvesStudents = watch("involves_students");
  useEffect(() => {
    setValue("requires_vpsas", !!watchedInvolvesStudents);
  }, [watchedInvolvesStudents, setValue]);

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
    if (isOpen) {
      setActiveTab("requestor");
      setRequestorError("");
      if (!editMode && !resubmitMode) {
        const currentTime = getCurrentTime();
        setValue("time_start", currentTime);
        setValue("time_end", currentTime);
        setValue("equipment", []);
        setEquipmentTouched(false);
        setRequestor(null);
      }
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
        equipment: [],
        involves_students: false,
        requires_vpaa: isDean,
        requires_vpsas: false,
        requires_vpaf: false,
        requires_vprde: false,
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
      setEquipmentTouched(false);
      setShowOutsource(false);
      setShowGuest(false);
      setGuestNameInput("");
      setGuestDetailsInput("");
      setOutsourceError(null);
      setGuestNameError(null);
      setGuestDetailsError(null);
      setRequestor(null);
      setRequestorError("");
    }
  }, [isOpen, setValue, reset, eventDate, editMode, resubmitMode, setTaggedPeople, setTagInput, isDean]);

  // Pre-populate extra fields that useEditModePopulate doesn't cover
  useEffect(() => {
    if (!(editMode || resubmitMode) || !eventData || !isOpen) return;

    const eventRequestor = getEventRequestor(eventData);
    setRequestor(eventRequestor ?? null);
    setValue("requestor", eventRequestor);
    setRequestorError("");

    setValue("other_category", eventData.other_category ?? "");
    setValue("involves_students", toFormBoolean(eventData.involves_students));
    setValue("requires_vpaa", toFormBoolean(eventData.requires_vpaa) || isDean);
    setValue("requires_vpsas", toFormBoolean(eventData.requires_vpsas));
    setValue("requires_vpaf", toFormBoolean(eventData.requires_vpaf));
    setValue("requires_vprde", toFormBoolean(eventData.requires_vprde));

    if (eventData.equipment && eventData.equipment.length > 0) {
      setValue("equipment", eventData.equipment);
    }

    if (eventData.outsource) {
      setShowOutsource(true);
      setValue("outsource", eventData.outsource);
    }

    if (eventData.guests && eventData.guests.length > 0) {
      setShowGuest(true);
      setValue("guests", eventData.guests);
    }
  }, [editMode, resubmitMode, eventData, isOpen, setValue, setRequestor, setShowOutsource, setShowGuest, isDean]);

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
          tagged_people_ids: taggedPeople.filter(p => p.id > 0).map(p => p.id),
          reserved_by_user: parseInt(user?.id || "0"),
          involves_students: toFormBoolean(rest.involves_students),
          requires_vpaa: toFormBoolean(rest.requires_vpaa),
          requires_vpsas: toFormBoolean(rest.requires_vpsas),
          requires_vpaf: toFormBoolean(rest.requires_vpaf),
          requires_vprde: toFormBoolean(rest.requires_vprde),
          requestor: requestor ?? undefined,
          requestor_type: requestor?.type,
          student_sub_type: requestor?.student_sub_type,
          student_org_name: requestor?.student_org_name,
          csg_name: requestor?.csg_name,
          requestor_tagged: requestor?.tagged,
        };

        if (resubmitMode && eventData?.id) {
          const payload: ReservationAPIPayload = {
            title_name: formDataWithPeople.title_name,
            asset_id: formDataWithPeople.asset_id,
            time_start: formDataWithPeople.time_start,
            time_end: formDataWithPeople.time_end,
            description: formDataWithPeople.description,
            range: formDataWithPeople.range,
            people_tag: formDataWithPeople.people_tag,
            tagged_people_ids: formDataWithPeople.tagged_people_ids,
            info_type: formDataWithPeople.info_type,
            category: formDataWithPeople.category,
            other_category: formDataWithPeople.other_category,
            date: formDataWithPeople.date,
            outsource: formDataWithPeople.outsource,
            guests: formDataWithPeople.guests,
            involves_students: formDataWithPeople.involves_students,
            requires_vpaa: formDataWithPeople.requires_vpaa,
            requires_vpsas: formDataWithPeople.requires_vpsas,
            requires_vpaf: formDataWithPeople.requires_vpaf,
            requires_vprde: formDataWithPeople.requires_vprde,
            requestor: formDataWithPeople.requestor,
            requestor_type: formDataWithPeople.requestor_type,
            student_sub_type: formDataWithPeople.student_sub_type,
            student_org_name: formDataWithPeople.student_org_name,
            csg_name: formDataWithPeople.csg_name,
            requestor_tagged: formDataWithPeople.requestor_tagged,
          };
          try {
            await resubmit({ reservationId: eventData.id, payload });
            onClose();
            setShowSuccessModal(true);
          } catch {
            // onError in useResubmitReservation already shows the error toast
          }
          return;
        }

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
          setShowSuccessModal(true);
        }

        await queryClient.invalidateQueries({
          queryKey: ['reservations', user?.id]
        });

        await queryClient.invalidateQueries({
          queryKey: ['public-reservations']
        });

        queryClient.invalidateQueries({ queryKey: ['notifications-unread', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });

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
            equipment: [],
            involves_students: false,
            requires_vpaa: isDean,
            requires_vpsas: false,
            requires_vpaf: false,
            requires_vprde: false,
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
        setActiveTab("requestor");
        setRequestor(null);
        setRequestorError("");
        setShowOutsource(false);
        setShowGuest(false);
        setGuestNameInput("");
        setGuestDetailsInput("");
        setOutsourceError(null);
        setGuestNameError(null);
        setGuestDetailsError(null);
        onClose();

      } catch {
        toast.error(editMode ? "Failed to update event. Please try again." : "Failed to reserve event. Please try again.");
      }
    },
    [reset, onClose, taggedPeople, eventDate, onNewReservation, editMode, resubmitMode, resubmit, eventData, user?.id, queryClient, setTaggedPeople, setTagInput, isDean, requestor]
  );

  const handleRequestorTabNext = useCallback(() => {
    if (!requestor?.type) {
      setRequestorError("Please select a requestor type to continue.");
      return;
    }
    if (requestor.type === 'student') {
      if (!requestor.student_sub_type) {
        setRequestorError("Please select a student category.");
        return;
      }
      if (requestor.student_sub_type === 'student_org' && !requestor.student_org_name?.trim()) {
        setRequestorError("Please enter the student organization/society name.");
        return;
      }
      if (requestor.student_sub_type === 'csg' && !requestor.csg_name?.trim()) {
        setRequestorError("Please enter the college student government name.");
        return;
      }
    }
    if (requestor.type === 'faculty' && (!requestor.tagged || requestor.tagged.length === 0)) {
      setRequestorError("Please tag a faculty / degree course.");
      return;
    }
    if (requestor.type === 'office' && (!requestor.tagged || requestor.tagged.length === 0)) {
      setRequestorError("Please tag an office.");
      return;
    }
    setRequestorError("");
    setActiveTab("form");
  }, [requestor]);

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
        setActiveTab("equipment");
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
      setActiveTab("equipment");
    } catch (err) {
      console.error("Conflict check error:", err);
      setIsCheckingConflict(false);
      toast.error("Failed to check for conflicts. Please try again.");
      return;
    }
  }, [trigger, getValues, editMode, eventData, setActiveTab, queryClient, user?.id]);

  const handleOutsourceToggle = useCallback((checked: boolean) => {
    setShowOutsource(checked);
    if (!checked) { setValue("outsource", ""); setOutsourceError(null); }
  }, [setValue]);

  const handleGuestToggle = useCallback((checked: boolean) => {
    setShowGuest(checked);
    if (!checked) {
      setValue("guests", []);
      setGuestNameInput("");
      setGuestDetailsInput("");
      setGuestNameError(null);
      setGuestDetailsError(null);
    }
  }, [setValue]);

  const handleAddGuest = useCallback(() => {
    let hasError = false;
    if (!guestNameInput.trim()) { setGuestNameError("Guest name is required"); hasError = true; }
    else setGuestNameError(null);
    if (!guestDetailsInput.trim()) { setGuestDetailsError("Guest details is required"); hasError = true; }
    else setGuestDetailsError(null);
    if (hasError) return;
    const current = getValues("guests") || [];
    setValue("guests", [...current, { name: guestNameInput.trim(), details: guestDetailsInput.trim() }]);
    setGuestNameInput("");
    setGuestDetailsInput("");
  }, [guestNameInput, guestDetailsInput, getValues, setValue]);

  const handleRemoveGuest = useCallback((index: number) => {
    const current = getValues("guests") || [];
    setValue("guests", current.filter((_, i) => i !== index));
  }, [getValues, setValue]);

  const handleEquipmentTabNext = useCallback(() => {
    const equipment = getValues("equipment") || [];
    const valid = equipment.filter(
      (e): e is { name: string; quantity: number } =>
        typeof e === "object" && e !== null && typeof e.name === "string"
    );
    if (valid.length === 0) {
      setEquipmentTouched(true);
      return;
    }
    setEquipmentTouched(false);
    setActiveTab("additional");
  }, [getValues]);

  const handleAdditionalTabNext = useCallback(async () => {
    setValue("people_tag", taggedPeople.map(p => p.name).join(', '), {
      shouldValidate: true,
      shouldTouch: true
    });

    const isValid = await trigger(['people_tag', 'info_type', 'category', 'other_category']);

    let externalValid = true;
    if (showOutsource) {
      const outsourceVal = getValues("outsource");
      if (!outsourceVal?.trim()) { setOutsourceError("Outsource description is required"); externalValid = false; }
      else setOutsourceError(null);
    }

    if (showGuest) {
      const guests = getValues("guests") || [];
      if (guests.length === 0) {
        setGuestNameError("Guest name is required");
        setGuestDetailsError("Guest details is required");
        externalValid = false;
      }
    }

    if (isValid && taggedPeople.length > 0 && externalValid) {
      setActiveTab("summary");
    }
  }, [trigger, taggedPeople, setValue, showOutsource, showGuest, getValues]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(onSubmitForm)();
  };

  const resetForm = useCallback(() => {
    reset();
    setTaggedPeople([]);
    setTagInput("");
    setActiveTab("requestor");
    setRequestor(null);
    setRequestorError("");
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
    requestor,
    setRequestor,
    requestorError,
    setRequestorError,
    handleRequestorTabNext,
    handleFormTabNext,
    handleEquipmentTabNext,
    handleAdditionalTabNext,
    equipmentTouched,
    handleFormSubmit,
    resetForm,
    isCheckingConflict,
    peopleSuggestions,
    showOutsource,
    showGuest,
    guestNameInput,
    guestDetailsInput,
    outsourceError,
    guestNameError,
    guestDetailsError,
    setGuestNameInput,
    setGuestDetailsInput,
    setOutsourceError,
    setGuestNameError,
    setGuestDetailsError,
    handleOutsourceToggle,
    handleGuestToggle,
    handleAddGuest,
    handleRemoveGuest,
    isDean,
    isHeadOfOffice,
    oversightVpId,
    showSuccessModal,
    setShowSuccessModal,
  };
};
