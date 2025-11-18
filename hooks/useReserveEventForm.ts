// hooks/useReserveEventForm.ts
import React, { useCallback, useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { ReservationFormData, ReservationAPIPayload } from "@/interface/user-props"
import { RESERVATION_VALIDATION_RULES } from "@/utils/reserve-event/reservation-validation-rules"
import { showFormTabErrorToast, showAdditionalTabErrorToast } from "@/utils/reserve-event/reservation-field-error-toast"

interface UseReserveEventFormProps {
  eventDate?: string | undefined
  onSubmit?: (data: ReservationAPIPayload) => void
  onClose: () => void
  isOpen: boolean
}

const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

export const useReserveEventForm = ({ eventDate, onSubmit, onClose, isOpen }: UseReserveEventFormProps) => {
  const [activeTab, setActiveTab] = useState<string>("form");
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [taggedPeople, setTaggedPeople] = useState<{ id: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

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
    setValue("people_tag", peopleValue, {
      shouldDirty: taggedPeople.length > 0,
      shouldValidate: true,
      shouldTouch: true
    });
  }, [taggedPeople, setValue]);

  // Reset time when modal opens
  useEffect(() => {
    if (isOpen) {
      const currentTime = getCurrentTime();
      setValue("time_start", currentTime);
      setValue("time_end", currentTime);
      setActiveTab("form");
    } else {
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
    }
  }, [isOpen, setValue, reset, eventDate]);

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
        const { asset, people_tag, ...rest } = data;
        const formDataWithPeople: ReservationAPIPayload = {
          ...rest,
          asset_id: asset?.id ?? 0,
          people_tag: taggedPeople.map(p => p.name).join(', '),
        };

        await new Promise(resolve => setTimeout(resolve, 1500));

        if (onSubmit) {
          onSubmit(formDataWithPeople);
        }

        toast.success("Event reservation sent successfully!");

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
        setActiveTab("form");

        setTimeout(() => {
          onClose();
        }, 1000);

      } catch (error) {
        console.error("Reservation error:", error);
        toast.error("Failed to reserve event. Please try again.");
      }
    },
    [onSubmit, reset, onClose, taggedPeople, eventDate]
  );

  const handleFormTabNext = useCallback(() => {
    handleSubmit(
      () => setActiveTab("additional"),
      (errors) => showFormTabErrorToast(errors, getValues())
    )();
  }, [handleSubmit, getValues]);

  const handleAdditionalTabNext = useCallback(async () => {
    setValue("people_tag", taggedPeople.map(p => p.name).join(', '), {
      shouldValidate: true,
      shouldTouch: true
    });

    const isValid = await trigger(['people_tag', 'info_type', 'category']);

    if (isValid && taggedPeople.length > 0) {
      setActiveTab("summary");
    } else {
      if (taggedPeople.length === 0) {
        setValue("people_tag", "", { shouldValidate: true, shouldTouch: true });
        setTimeout(() => peopleFieldRef.current?.focus(), 100);
      }
      showAdditionalTabErrorToast(errors, getValues(), taggedPeople);
    }
  }, [trigger, getValues, taggedPeople, setValue, errors]);

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
    validationRules: RESERVATION_VALIDATION_RULES
  };
};