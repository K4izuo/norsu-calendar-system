import { UseFormRegister, FieldErrors, FieldValues, RegisterOptions, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

type EventFormInputProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors: FieldErrors<T>;
  required?: boolean;
  isTextarea?: boolean;
  clientError?: string;
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const EventFormInput = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  errors,
  required = true,
  isTextarea = false,
  clientError,
  ...inputProps
}: EventFormInputProps<T>) => {
  // Server errors take priority over client-side validation
  const displayError = errors[name]?.message || clientError;

  const inputClassName = `h-12 text-base border-2 rounded-lg transition-all duration-150 ${displayError
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
    }`;

  const textareaClassName = `min-h-[120px] text-base border-2 rounded-lg transition-all duration-150 ${displayError
    ? "border-red-400 focus:border-red-500 focus:ring-red-200"
    : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
    }`;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="inline-flex pointer-events-none">
        <span className="pointer-events-auto">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      </Label>
      {isTextarea ? (
        <Textarea
          {...register(name, rules)}
          id={name}
          className={`mt-1 ${textareaClassName}`}
          {...inputProps}
        />
      ) : (
        <Input
          {...register(name, rules)}
          id={name}
          className={`mt-1 ${inputClassName}`}
          {...inputProps}
        />
      )}
      {displayError && typeof displayError === "string" && (
        <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>{displayError}</p>
        </div>
      )}
    </div>
  );
};