import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminFormFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  hasError?: boolean;
  type?: string;
};

export function AdminFormField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  hasError = false,
  type = "text",
}: AdminFormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="inline-flex pointer-events-none">
        <span className="pointer-events-auto">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`h-11 text-base border-2 rounded-lg ${hasError ? "border-red-400" : "border-gray-200"} focus:border-ring`}
      />
    </div>
  );
}