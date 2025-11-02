import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Control, FieldErrors, Controller } from "react-hook-form"
import { ReservationFormData } from "@/interface/user-props"
import { RESERVATION_VALIDATION_RULES } from "@/utils/reservation-validation-rules"

interface Asset {
  id: string
  name: string
  capacity: string
}

interface Props {
  control: Control<ReservationFormData>
  errors: FieldErrors<ReservationFormData>
  assets: Asset[]
  handleAssetChange: (value: string) => void
  selectedAsset?: Asset | null
}

export function ReserveEventFormTab({
  control,
  errors,
  assets,
  handleAssetChange,
  selectedAsset,
}: Props) {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="title" className="text-base inline-block font-medium">Event Title</Label>
          <Input
            {...control.register("title", RESERVATION_VALIDATION_RULES.title)}
            id="title"
            placeholder="Enter event title"
            className={`mt-1 border-2 text-base h-12 w-full ${errors.title ? "border-red-500 focus:border-red-500" : ""}`}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex-1 min-w-0">
            <Label htmlFor="asset" className="text-base inline-block font-medium">Assets</Label>
            <Controller
              name="asset"
              control={control}
              rules={RESERVATION_VALIDATION_RULES.asset}
              render={({ field }) => (
                <Select
                  value={selectedAsset?.id || ""}
                  onValueChange={handleAssetChange}
                >
                  <SelectTrigger id="asset" className={`mt-1 border-2 text-base w-full h-12 ${errors.asset ? "border-red-500 focus:border-red-500" : ""}`}>
                    <SelectValue
                      placeholder="Select an asset"
                      {...(selectedAsset ? { children: selectedAsset.name } : {})}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-base">Asset Type</SelectLabel>
                      {assets.map(asset => (
                        <SelectItem key={asset.id} value={asset.id} className="text-base">
                          {asset.name}
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
              rules={RESERVATION_VALIDATION_RULES.range}
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
                  className={`mt-1 border-2 h-12 text-base w-full ${errors.range ? "border-red-500 focus:border-red-500" : ""}`}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="timeStart" className="text-base inline-block font-medium">Start Time</Label>
            <Input
              {...control.register("timeStart", RESERVATION_VALIDATION_RULES.timeStart)}
              id="timeStart"
              type="time"
              defaultValue={currentTime}
              className={`mt-1 border-2 text-base h-12 w-full ${errors.timeStart ? "border-red-500 focus:border-red-500" : ""}`}
            />
          </div>
          <div>
            <Label htmlFor="timeEnd" className="text-base inline-block font-medium">End Time</Label>
            <Input
              {...control.register("timeEnd", RESERVATION_VALIDATION_RULES.timeEnd)}
              id="timeEnd"
              type="time"
              placeholder="Select end time"
              className={`mt-1 border-2 text-base h-12 w-full ${errors.timeEnd ? "border-red-500 focus:border-red-500" : ""}`}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="description" className="text-base inline-block font-medium">Description</Label>
          <Textarea
            {...control.register("description", RESERVATION_VALIDATION_RULES.description)}
            id="description"
            placeholder="Enter event description"
            className={`mt-1 border-2 min-h-[120px] text-base h-12 w-full ${errors.description ? "border-red-500 focus:border-red-500" : ""}`}
          />
        </div>
      </div>
    </div>
  )
}