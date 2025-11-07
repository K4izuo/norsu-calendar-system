import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { OptionType } from "@/services/academicDataService";

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
};

export const FacultyFormSelectField = memo(function FacultyFormSelectField({
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
}: FormSelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
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
          className={`h-11 cursor-pointer text-base border-2 rounded-lg w-full transition-all duration-[95ms] ${
            hasError ? "border-red-400" : "border-gray-200"
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
    </div>
  );
});