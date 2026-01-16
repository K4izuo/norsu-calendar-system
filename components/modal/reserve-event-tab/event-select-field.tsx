import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

type EventSelectFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  validationError?: string;
  groupLabel?: string;
};

export const EventSelectField = memo(function EventSelectField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  hasError = false,
  validationError,
  groupLabel,
}: EventSelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="inline-flex pointer-events-none">
        <span className="pointer-events-auto">
          {label} {required && <span className="text-red-500"> *</span>}
        </span>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        name={name}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className={`h-12 cursor-pointer text-base border-2 rounded-lg w-full transition-all duration-150 ${hasError || validationError
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {groupLabel && <SelectLabel className="text-base">{groupLabel}</SelectLabel>}
            {options.length > 0 ? (
              options.map((option) => (
                <SelectItem className="cursor-pointer text-base" key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="empty" disabled>
                No {label.toLowerCase()} available
              </SelectItem>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      {validationError && (
        <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{validationError}</p>
        </div>
      )}
    </div>
  );
});