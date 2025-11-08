import { UseFormRegister, FieldErrors, FieldValues, RegisterOptions, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type EventFormInputProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors: FieldErrors<T>;
  required?: boolean;
  isTextarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const EventFormInput = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  errors,
  required = true,
  isTextarea = false,
  className,
  ...inputProps
}: EventFormInputProps<T>) => {
  const inputClassName = `h-12 text-base border-2 rounded-lg focus:border-ring transition-all duration-[90ms] ${
    errors[name] ? "border-red-400" : "border-gray-200"
  }`;

  const textareaClassName = `min-h-[120px] text-base border-2 rounded-lg focus:border-ring transition-all duration-[90ms] ${
    errors[name] ? "border-red-400" : "border-gray-200"
  }`;

  return (
    <div>
      <Label htmlFor={name} className="text-base inline-block font-medium">
        {label}
        {required && <span className="text-red-500"> *</span>}
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
    </div>
  );
};