import React, { useMemo } from "react"
import { Label } from "@/shared/components/ui/label"
import { Input } from "@/shared/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip"
import { Control, FieldErrors, Controller, UseFormRegister, UseFormWatch, FieldErrorsImpl, Merge, FieldError } from "react-hook-form"
import { ReservationFormData } from "@/interface/user-props"
import { EventFormInput } from "./event-input-field"
import { AlertCircle } from "lucide-react"
import { useReservationFieldValidation } from "@/features/reservations/utils/reservation-field-validation"
import { RESERVATION_VALIDATION_RULES } from "@/features/reservations/utils/reservation-validation-rules"

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
  watch: UseFormWatch<ReservationFormData>
}

export function ReserveEventFormTab({
  control,
  errors,
  assets,
  handleAssetChange,
  selectedAsset,
  validationRules,
  register,
  watch,
}: Props) {
  // Watch form data for real-time validation
  const formData = watch()

  // Real-time validation with debounce (only client-side)
  const titleNameError = useReservationFieldValidation(formData.title_name || "", RESERVATION_VALIDATION_RULES.title_name)
  const rangeError = useReservationFieldValidation(formData.range || "", RESERVATION_VALIDATION_RULES.range)
  const descriptionError = useReservationFieldValidation(formData.description || "", RESERVATION_VALIDATION_RULES.description)

  // Memoize border classes to prevent recalculation
  const getBorderClass = useMemo(() => {
    return (fieldError: FieldError | Merge<FieldError, FieldErrorsImpl<Asset>> | undefined) =>
      fieldError
        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 hover:bg-muted bg-transparent"
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
          clientError={titleNameError}
          placeholder="Enter event title"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <Label htmlFor="asset" className="text-base inline-flex pointer-events-none">
              <span className="pointer-events-auto">
                Assets<span className="text-red-500"> *</span>
              </span>
            </Label>
            <Controller
              name="asset"
              control={control}
              rules={validationRules.asset}
              render={() => (
                <>
                  <Select
                    value={selectedAsset ? `selected-${selectedAsset.id}` : ""}
                    onValueChange={handleAssetChange}
                  >
                    <SelectTrigger
                      id="asset"
                      className={`mt-1 cursor-pointer border-2 text-base w-full h-12 transition-all duration-150 ${getBorderClass(errors.asset)}`}
                    >
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
                  {errors.asset && (
                    <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>{errors.asset.message as string}</p>
                    </div>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Label htmlFor="range" className="text-base inline-flex pointer-events-none">
                <span className="pointer-events-auto">Day(s)</span>
              </Label>
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
              render={({ field: { onChange, value, ...field } }) => {
                // Server errors take priority over client-side validation
                const displayError = errors.range?.message || rangeError;

                return (
                  <>
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
                      className={`mt-1 border-2 h-12 text-base w-full transition-all duration-150 ${displayError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                        }`}
                    />
                    {displayError && typeof displayError === "string" && (
                      <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p>{displayError}</p>
                      </div>
                    )}
                  </>
                );
              }}
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
          clientError={descriptionError}
          placeholder="Enter event description"
          isTextarea={true}
        />
      </div>
    </div>
  )
}