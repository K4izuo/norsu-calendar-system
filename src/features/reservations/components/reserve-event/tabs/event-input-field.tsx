import { useRef } from "react";
import {
  UseFormRegister,
  FieldErrors,
  FieldValues,
  Path,
} from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { AlertCircle, Clock3 } from "lucide-react";

type EventFormInputProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  required?: boolean;
  isTextarea?: boolean;
  clientError?: string;
} & React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const EventFormInput = <T extends FieldValues>({
  name,
  label,
  register,
  errors,
  required = true,
  isTextarea = false,
  clientError,
  ...inputProps
}: EventFormInputProps<T>) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const registerProps = register(name);
  const isTimeInput = !isTextarea && inputProps.type === "time";

  // Server errors take priority over client-side validation
  const displayError = errors[name]?.message || clientError;

  const inputClassName = `h-12 text-base border rounded-lg transition-all duration-150 ${displayError
    ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
    } ${isTimeInput ? "reserve-time-input cursor-pointer pr-12" : ""}`;

  const textareaClassName = `min-h-[120px] text-base border rounded-lg transition-all duration-150 ${displayError
    ? "border-red-500 focus-visible:ring-red-200 focus-visible:border-red-500"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
    } resize-none`;

  const handlePickerOpen = () => {
    const input = inputRef.current;
    if (!input) return;

    input.focus();
    const pickerInput = input as HTMLInputElement & {
      showPicker?: () => void;
    };
    pickerInput.showPicker?.();
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name} className="inline-flex text-sm pointer-events-none">
        <span className="pointer-events-auto">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </span>
      </Label>
      {isTextarea ? (
        <Textarea
          {...registerProps}
          id={name}
          className={textareaClassName}
          {...inputProps}
        />
      ) : (
        <div className="relative">
          <Input
            {...registerProps}
            ref={(node) => {
              registerProps.ref(node);
              inputRef.current = node;
            }}
            id={name}
            className={inputClassName}
            {...inputProps}
          />
          {isTimeInput && (
            <button
              type="button"
              onClick={handlePickerOpen}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer text-gray-900"
              aria-label={`Open ${label.toLowerCase()} picker`}
            >
              <Clock3 className="h-4 w-4" />
            </button>
          )}
        </div>
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
