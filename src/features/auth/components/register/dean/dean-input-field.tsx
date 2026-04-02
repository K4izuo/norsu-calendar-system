import { UseFormRegister, FieldErrors, FieldValues, RegisterOptions, Path } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { AlertCircle } from "lucide-react";

type FormInputProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors: FieldErrors<T>;
  required?: boolean;
  clientError?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const DeanFormInput = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  errors,
  required = true,
  clientError,
  ...inputProps
}: FormInputProps<T>) => {
  // Server errors take priority over client-side validation
  const displayError = errors[name]?.message || clientError;

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <Label htmlFor={name} className="inline-flex pointer-events-none">
        <span className="pointer-events-auto">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </Label>
      <Input
        {...register(name, rules)}
        id={name}
        className={`h-12 text-base border rounded-lg transition-all duration-150 ${displayError ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
        {...inputProps}
      />
      {displayError && typeof displayError === "string" && (
        <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{displayError}</p>
        </div>
      )}
    </div>
  );
};