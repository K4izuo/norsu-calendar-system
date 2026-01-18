"use client"

import React from "react"
import { Controller, Control, FieldErrors, UseFormRegister, UseFormWatch } from "react-hook-form"
import { AssetFormInput } from "./asset-input-field"
import { AssetSelectField } from "./asset-select-field"
import { ASSET_VALIDATION_RULES } from "@/utils/assets/asset-validation-rules"
import { useAssetFieldValidation } from "@/utils/assets/asset-field-validation"

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
  // isDeanOrStaff?: boolean
  // userCampusId?: string
  // userOfficeId?: string
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
  // isDeanOrStaff = false,
  // userCampusId,
  // userOfficeId,
}: AssetDetailsTabProps) {
  // Watch all form data for real-time updates
  const formData = watch()

  // Real-time validation with debounce
  const assetNameError = useAssetFieldValidation(formData.asset_name || "", ASSET_VALIDATION_RULES.asset_name)
  const capacityError = useAssetFieldValidation(formData.capacity || "", ASSET_VALIDATION_RULES.capacity)
  const locationError = useAssetFieldValidation(formData.location || "", ASSET_VALIDATION_RULES.location)
  const acquisitionDateError = useAssetFieldValidation(formData.acquisition_date || "", ASSET_VALIDATION_RULES.acquisition_date)

  return (
    <div className="space-y-4 sm:space-y-5">
      <AssetFormInput
        name="asset_name"
        label="Asset Name"
        register={register}
        rules={ASSET_VALIDATION_RULES.asset_name}
        errors={errors}
        clientError={assetNameError}
        placeholder="Enter asset name"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Asset Type */}
        <Controller
          name="asset_type"
          control={control}
          rules={ASSET_VALIDATION_RULES.asset_type}
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
          rules={ASSET_VALIDATION_RULES.capacity}
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
            rules={{ required: "Campus is required" }}
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
            rules={{ required: "Office is required" }}
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
            rules={ASSET_VALIDATION_RULES.location}
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
          rules={ASSET_VALIDATION_RULES.acquisition_date}
          errors={errors}
          clientError={acquisitionDateError}
          type="date"
        />

        {/* Condition */}
        <Controller
          name="condition"
          control={control}
          rules={ASSET_VALIDATION_RULES.condition}
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