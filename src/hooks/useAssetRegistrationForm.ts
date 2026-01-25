// hooks/useAssetRegistrationForm.ts
import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { AssetRegistrationData, AssetRegistrationPayload } from "@/interface/user-props"
import { apiClient } from "@/lib/api-client"

interface AssetFormData {
  asset_name: string
  asset_type: string
  capacity: string
  location: string
  acquisition_date: string
  condition: string
  campus_id: string
  office_id: string
}

interface UseAssetRegistrationFormProps {
  onSubmit?: (data: AssetRegistrationPayload) => Promise<void> | void
  onClose: () => void
  isOpen: boolean
  editMode?: boolean
  assetData?: AssetRegistrationData
  defaultCampusId?: string
  defaultOfficeId?: string
  isAdmin?: boolean
}

export function useAssetRegistrationForm({
  onSubmit,
  onClose,
  isOpen,
  editMode = false,
  assetData,
  defaultCampusId,
  defaultOfficeId,
  isAdmin = false
}: UseAssetRegistrationFormProps) {
  const [activeTab, setActiveTab] = useState<"details" | "summary">("details")

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
    trigger,
    watch,
  } = useForm<AssetFormData>({
    mode: "onTouched",
    defaultValues: {
      asset_name: "",
      asset_type: "",
      capacity: "",
      location: "",
      acquisition_date: "",
      condition: "",
      campus_id: defaultCampusId || "",
      office_id: defaultOfficeId || "",
    },
  })

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editMode && assetData) {
        // Editing existing asset
        reset({
          asset_name: assetData.asset_name,
          asset_type: assetData.asset_type,
          capacity: assetData.capacity.toString(),
          location: assetData.location,
          acquisition_date: assetData.acquisition_date,
          condition: assetData.condition,
          campus_id: assetData.campus_id || defaultCampusId || "",
          office_id: assetData.office_id || defaultOfficeId || "",
        })
      } else {
        // Creating new asset
        reset({
          asset_name: "",
          asset_type: "",
          capacity: "",
          location: "",
          acquisition_date: "",
          condition: "",
          campus_id: defaultCampusId || "",
          office_id: defaultOfficeId || "",
        })
      }
    } else {
      // Modal closed - reset to empty
      reset()
      setActiveTab("details")
    }
  }, [isOpen, editMode, assetData, defaultCampusId, defaultOfficeId, reset])

  const isFormValid = (): boolean => {
    const values = getValues()
    const baseValid = !!(
      values.asset_name &&
      values.asset_type &&
      values.capacity &&
      values.location &&
      values.acquisition_date &&
      values.condition
    )

    // Admin must select campus/office, dean/staff auto-filled
    if (isAdmin) {
      return baseValid && !!(values.campus_id && values.office_id)
    }

    return baseValid
  }

  const handleDetailsTabNext = async () => {
    // Different validation for admin vs dean/staff
    const fieldsToValidate: (keyof AssetFormData)[] = isAdmin
      ? ['asset_name', 'asset_type', 'capacity', 'location', 'acquisition_date', 'condition', 'campus_id', 'office_id']
      : ['asset_name', 'asset_type', 'capacity', 'location', 'acquisition_date', 'condition']

    const isValid = await trigger(fieldsToValidate)

    if (isValid) {
      setActiveTab("summary")
    }
  }

  const onSubmitForm = useCallback(
    async (data: AssetFormData) => {
      try {
        const payload: AssetRegistrationPayload = {
          asset_name: data.asset_name.trim(),
          asset_type: data.asset_type,
          capacity: parseInt(data.capacity),
          location: data.location.trim(),
          acquisition_date: data.acquisition_date,
          condition: data.condition,
          availability_status: "AVAILABLE",
          // campus_id: data.campus_id || defaultCampusId || "",
          // office_id: data.office_id || defaultOfficeId || "",
        }

        if (isAdmin) {
          payload.campus_id = data.campus_id;
          payload.office_id = data.office_id;
        }

        if (onSubmit) {
          // Use custom submit handler if provided
          await onSubmit(payload)
        } else {
          // Default API submission
          const response = await apiClient.post<AssetRegistrationPayload, AssetRegistrationPayload>(
            "assets/store",
            payload
          )

          if (response.error) {
            const errorMsg = typeof response.error === "string"
              ? response.error
              : JSON.stringify(response.error);
            toast.error(`Asset registration failed: ${errorMsg}`);
            return;
          }

          toast.success("Asset registered successfully!");
        }

        reset()
        onClose()
      } catch (error) {
        console.error("Error submitting asset form:", error)

        const errorMessage = error instanceof Error
          ? error.message
          : "An error occurred while submitting the form. Please try again."

        toast.error(errorMessage)
      }
    },
    [reset, onClose, onSubmit, isAdmin]
  )

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(onSubmitForm)()
  }

  return {
    control,
    errors,
    isSubmitting,
    register,
    watch,
    handleFormSubmit,
    setValue,
    getValues,
    activeTab,
    setActiveTab,
    isFormValid,
    handleDetailsTabNext,
  }
}