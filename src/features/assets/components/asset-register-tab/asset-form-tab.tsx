"use client"

// import React, { useMemo } from "react"
import { Controller, Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form"
import { AssetFormInput } from "./asset-input-field"
import { AssetSelectField } from "./asset-select-field"
import { assetSchema, AssetFormData } from "@/features/assets/utils/asset-validation-rules"
import { useAssetFieldValidation } from "@/features/assets/utils/asset-field-validation"


interface AssetDetailsTabProps {
  control: Control<AssetFormData>
  errors: FieldErrors<AssetFormData>
  register: UseFormRegister<AssetFormData>
  watch: UseFormWatch<AssetFormData>
  assetTypes: { value: string; label: string }[]
  conditionOptions: { value: string; label: string }[]
  campuses: { value: string; label: string }[]
  offices: { value: string; label: string }[]
  loadingCampuses: boolean
  loadingOffices: boolean
  campusError: string | null
  officeError: string | null
  isAdmin?: boolean
}

export function AssetDetailsTab({
  control,
  errors,
  register,
  watch,
  assetTypes,
  conditionOptions,
  campuses,
  offices,
  loadingCampuses,
  loadingOffices,
  campusError,
  officeError,
  isAdmin = false,
}: AssetDetailsTabProps) {
  // ✅ Watch individual fields instead of all form data
  const assetName = watch("asset_name")
  const capacity = watch("capacity")
  const location = watch("location")
  const acquisitionDate = watch("acquisition_date")

  // ✅ Only run validation when values actually change
  const assetNameError = useAssetFieldValidation(assetName || "", assetSchema.shape.asset_name)
  const capacityError = useAssetFieldValidation(capacity || "", assetSchema.shape.capacity)
  const locationError = useAssetFieldValidation(location || "", assetSchema.shape.location)
  const acquisitionDateError = useAssetFieldValidation(acquisitionDate || "", assetSchema.shape.acquisition_date)

  return (
    <div className="space-y-4 sm:space-y-5">
      <AssetFormInput
        name="asset_name"
        label="Asset Name"
        register={register}
        errors={errors}
        clientError={assetNameError}
        placeholder="Enter asset name"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Asset Type */}
        <Controller
          name="asset_type"
          control={control}
          render={({ field }) => (
            <AssetSelectField
              id="asset_type"
              name="asset_type"
              label="Asset Type"
              placeholder="Select asset type"
              value={field.value || ""}
              onChange={field.onChange}
              options={assetTypes}
              required
              hasError={!!errors.asset_type}
              validationError={errors.asset_type?.message as string}
            />
          )}
        />

        {/* Capacity */}
        <AssetFormInput
          name="capacity"
          label="Capacity"
          register={register}
          errors={errors}
          clientError={capacityError}
          type="number"
          placeholder="Enter capacity"
        />

        {/* Campus - Only show for Admin */}
        {isAdmin && (
          <Controller
            name="campus_id"
            control={control}
            render={({ field }) => (
              <AssetSelectField
                id="campus_id"
                name="campus_id"
                label="Campus"
                placeholder="Select campus"
                value={field.value || ""}
                onChange={field.onChange}
                options={campuses}
                loading={loadingCampuses}
                error={campusError}
                required
                hasError={!!errors.campus_id}
                validationError={errors.campus_id?.message as string}
              />
            )}
          />
        )}

        {/* Office - Only show for Admin */}
        {isAdmin && (
          <Controller
            name="office_id"
            control={control}
            render={({ field }) => (
              <AssetSelectField
                id="office_id"
                name="office_id"
                label="Office"
                placeholder="Select office"
                value={field.value || ""}
                onChange={field.onChange}
                options={offices}
                loading={loadingOffices}
                error={officeError}
                required
                hasError={!!errors.office_id}
                validationError={errors.office_id?.message as string}
              />
            )}
          />
        )}

        {/* Location - spans full width */}
        <div className="sm:col-span-2">
          <AssetFormInput
            name="location"
            label="Location"
            register={register}
            errors={errors}
            clientError={locationError}
            placeholder="Enter location"
          />
        </div>

        {/* Acquisition Date */}
        <AssetFormInput
          name="acquisition_date"
          label="Acquisition Date"
          register={register}
          errors={errors}
          clientError={acquisitionDateError}
          type="date"
        />

        {/* Condition */}
        <Controller
          name="condition"
          control={control}
          render={({ field }) => (
            <AssetSelectField
              id="condition"
              name="condition"
              label="Condition"
              placeholder="Select condition"
              value={field.value || ""}
              onChange={field.onChange}
              options={conditionOptions}
              required
              hasError={!!errors.condition}
              validationError={errors.condition?.message as string}
            />
          )}
        />
      </div>
    </div>
  )
}
