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
}

export function useAssetRegistrationForm({
  // onSubmit,
  onClose,
  isOpen,
  editMode = false,
  assetData
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
      campus_id: "",
      office_id: "",
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setActiveTab("details")
    }
  }, [isOpen, reset])

  // Populate form when editing
  useEffect(() => {
    if (editMode && assetData && isOpen) {
      setValue('asset_name', assetData.asset_name)
      setValue('asset_type', assetData.asset_type)
      setValue('capacity', assetData.capacity.toString())
      setValue('location', assetData.location)
      setValue('acquisition_date', assetData.acquisition_date)
      setValue('condition', assetData.condition)
      setValue('campus_id', assetData.campus_id || '')
      setValue('office_id', assetData.office_id || '')
    }
  }, [editMode, assetData, isOpen, setValue])

  const isFormValid = (): boolean => {
    const values = getValues()
    return !!(
      values.asset_name &&
      values.asset_type &&
      values.capacity &&
      values.location &&
      values.acquisition_date &&
      values.condition &&
      values.campus_id &&
      values.office_id
    )
  }

  const handleDetailsTabNext = async () => {
    const isValid = await trigger([
      'asset_name',
      'asset_type',
      'capacity',
      'location',
      'acquisition_date',
      'condition',
      'campus_id',
      'office_id'
    ])

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
          availability_status: "available",
          campus_id: data.campus_id,
          office_id: data.office_id,
        }

        // Remove the setTimeout - real API call will show loading
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
    [reset, onClose]
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