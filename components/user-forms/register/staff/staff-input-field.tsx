import { UseFormRegister, FieldErrors, FieldValues, RegisterOptions, Path } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormInputProps<T extends FieldValues = FieldValues> = {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions<T, Path<T>>;
  errors: FieldErrors<T>;
  required?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const StaffFormInput = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  errors,
  required = true,
  ...inputProps
}: FormInputProps<T>) => (
  <div className="flex-1 flex flex-col gap-1">
    <Label htmlFor={name} className="inline-flex pointer-events-none">
      <span className="pointer-events-auto">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
    </Label>
    <Input
      {...register(name, rules)}
      id={name}
      className={`h-11 text-base border-2 rounded-lg ${
        errors[name] ? "border-red-400" : "border-gray-200"
      } focus:border-ring`}
      {...inputProps}
    />
  </div>
);