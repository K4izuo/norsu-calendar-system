import React, { useMemo } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Control, FieldErrors, Controller, UseFormRegister, FieldErrorsImpl, Merge, FieldError } from "react-hook-form"
import { ReservationFormData } from "@/interface/user-props"
import { EventFormInput } from "./event-input-field"

interface Asset {
  id: number
  asset_name: string
  capacity: number
}

interface Props {
  control: Control<ReservationFormData>
  errors: FieldErrors<ReservationFormData>
  assets: Asset[]
  handleAssetChange: (value: string) => void
  selectedAsset?: Asset | null
  validationRules: Record<string, Record<string, unknown>>
  register: UseFormRegister<ReservationFormData>
}

export function ReserveEventFormTab({
  control,
  errors,
  assets,
  handleAssetChange,
  selectedAsset,
  validationRules,
  register,
}: Props) {
  // Memoize border classes to prevent recalculation
  const getBorderClass = useMemo(() => {
    return (fieldError: FieldError | Merge<FieldError, FieldErrorsImpl<Asset>> | undefined) => 
      fieldError ? "border-red-400" : "border-gray-200"
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-5">
        <EventFormInput
          name="title_name"
          id="title_name"
          label="Event Title"
          register={register}
          rules={validationRules.title_name}
          errors={errors}
          placeholder="Enter event title"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex-1 min-w-0">
            <Label htmlFor="asset" className="text-base inline-block font-medium">Assets<span className="text-red-500"> *</span></Label>
            <Controller
              name="asset"
              control={control}
              rules={validationRules.asset}
              render={({ field }) => (
                <Select
                  value={selectedAsset ? `selected-${selectedAsset.id}` : ""}
                  onValueChange={handleAssetChange}
                >
                  <SelectTrigger id="asset" className={`mt-1 cursor-pointer border-2 text-base w-full h-12 focus:border-ring transition-all duration-90 ${errors.asset ? "border-red-400" : "border-gray-200"}`}>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-base">Asset Type</SelectLabel>
                      {selectedAsset && (
                        <SelectItem key={`selected-${selectedAsset.id}`} value={`selected-${selectedAsset.id}`} className="text-base hidden cursor-pointer">
                          {selectedAsset.asset_name}
                        </SelectItem>
                      )}
                      {assets.map(asset => (
                        <SelectItem key={asset.id} value={asset.id.toString()} className="text-base cursor-pointer">
                          {asset.asset_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="range" className="text-base inline-flex font-medium">Range</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-pointer">
                      <svg className="w-4 h-4 text-gray-400 hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path stroke="currentColor" strokeWidth="2" d="M12 16v-4M12 8h.01" />
                      </svg>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-white text-gray-700 border border-gray-200 shadow-md px-3 py-2 rounded-md text-sm max-w-xs">
                    Specify how many days you want to reserve this event for. For example, enter &quot;3&quot; to reserve for 3 days.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Controller
              name="range"
              control={control}
              rules={validationRules.range}
              render={({ field: { onChange, value, ...field } }) => (
                <Input
                  {...field}
                  type="number"
                  id="range"
                  placeholder="Enter range (days)"
                  value={value || ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? "" : Number(e.target.value);
                    onChange(val);
                  }}
                  min="1"
                  className={`mt-1 border-2 h-12 text-base w-full focus:border-ring ${getBorderClass(errors.range)}`}
                />
              )}
            />
          </div>
          <EventFormInput
            name="time_start"
            id="time_start"
            label="Start Time"
            register={register}
            rules={validationRules.time_start}
            errors={errors}
            type="time"
          />
          <EventFormInput
            name="time_end"
            id="time_end"
            label="End Time"
            register={register}
            rules={validationRules.time_end}
            errors={errors}
            type="time"
            placeholder="Select end time"
          />
        </div>
        <EventFormInput
          name="description"
          id="description"
          label="Description"
          register={register}
          rules={validationRules.description}
          errors={errors}
          placeholder="Enter event description"
          isTextarea={true}
        />
      </div>
    </div>
  )
}