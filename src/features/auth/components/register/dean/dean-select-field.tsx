import React, { memo } from "react";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/shared/components/ui/select";
import { OptionType } from "@/features/calendar/services/academicDataService";
import { AlertCircle } from "lucide-react";

type FormSelectFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionType[];
  loading: boolean;
  error: string | null;
  required?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  validationError?: string;
};

export const DeanFormSelectField = memo(function DeanFormSelectField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  options,
  loading,
  error,
  required = false,
  disabled = false,
  hasError = false,
  validationError,
}: FormSelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="inline-flex pointer-events-none">
        <span className="pointer-events-auto">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        name={name}
        disabled={disabled || loading}
      >
        <SelectTrigger
          id={id}
          className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full transition-all duration-150 ${hasError || validationError
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
        >
          <SelectValue placeholder={loading ? `Loading ${label.toLowerCase()}...` : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {error ? (
            <SelectItem value="error" disabled>
              {error}
            </SelectItem>
          ) : loading ? (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          ) : options.length > 0 ? (
            options.map((option) => (
              <SelectItem className="cursor-pointer" key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="empty" disabled>
              No {label.toLowerCase()} available
            </SelectItem>
          )}
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