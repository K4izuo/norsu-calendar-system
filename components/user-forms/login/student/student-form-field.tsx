import React, { memo } from "react";
import { Input } from "@/components/ui/input";

interface StudentFormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  hasError?: boolean;
  errorMessage?: string;
  rightElement?: React.ReactNode;
}

export const StudentFormField = memo(function StudentFormField({
  id,
  icon: Icon,
  hasError = false,
  errorMessage,
  rightElement,
  ...rest
}: StudentFormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={id}
          {...rest}
          className={`h-12 text-base sm:text-lg pl-[42px] ${
            rightElement ? "pr-12" : "pr-4"
          } border-2 rounded-lg transition-colors ${
            hasError
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-gray-200 focus:border-green-500 focus:ring-green-500/20"
          } placeholder:text-gray-400`}
        />
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {/* Remove or comment out the error message below */}
      {/* {hasError && errorMessage && (
        <p className="text-red-500 text-sm ml-1">{errorMessage}</p>
      )} */}
    </div>
  );
});