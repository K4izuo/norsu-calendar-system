import { Control, FieldErrors, FieldValues, RegisterOptions, Controller, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ReserveEventInputProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  control: Control<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors: FieldErrors<T>;
  required?: boolean;
  multiline?: boolean;
  tooltip?: string;
} & React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>;

export const ReserveEventInput = <T extends FieldValues>({
  name,
  label,
  control,
  rules,
  errors,
  required = false,
  multiline = false,
  tooltip,
  ...inputProps
}: ReserveEventInputProps<T>) => (
  <div className="flex-1 flex flex-col gap-1">
    <div className="flex items-center gap-2">
      <Label htmlFor={name} className="text-base font-medium inline-flex pointer-events-none">
        <span className="pointer-events-auto">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
      </Label>
      {tooltip && (
        <div className="inline-flex items-center cursor-help group relative">
          <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path stroke="currentColor" strokeWidth="2" d="M12 16v-4M12 8h.01" />
          </svg>
          <div className="invisible group-hover:visible absolute left-6 top-0 bg-white text-gray-700 border border-gray-200 shadow-md px-3 py-2 rounded-md text-sm max-w-xs z-10 whitespace-normal">
            {tooltip}
          </div>
        </div>
      )}
    </div>
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        multiline ? (
          <Textarea
            {...field}
            id={name}
            className={`mt-1 border-2 text-base min-h-[120px] ${
              errors[name] ? "border-red-500 focus:border-red-500" : "border-gray-200"
            } focus:border-ring rounded-lg`}
            {...(inputProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <Input
            {...field}
            id={name}
            className={`h-12 text-base border-2 rounded-lg ${
              errors[name] ? "border-red-500 focus:border-red-500" : "border-gray-200"
            } focus:border-ring`}
            {...(inputProps as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )
      )}
    />
    {errors[name] && (
      <span className="text-sm text-red-500 mt-1">
        {errors[name]?.message as string}
      </span>
    )}
  </div>
);