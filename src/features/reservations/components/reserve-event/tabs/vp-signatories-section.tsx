import { UseFormWatch, UseFormSetValue, UseFormRegister } from "react-hook-form";
import { ReservationFormData } from "@/interface/user-props";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Check } from "lucide-react";

interface Props {
  watch: UseFormWatch<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
  register: UseFormRegister<ReservationFormData>;
  studentInvolvementLocked?: boolean;
}

const VP_ITEMS: { label: string; field: keyof Pick<ReservationFormData, "requires_vpaa" | "requires_vpsas" | "requires_vpaf" | "requires_vprde"> }[] = [
  { label: "VPAA", field: "requires_vpaa" },
  { label: "VPSAS", field: "requires_vpsas" },
  { label: "VPAF", field: "requires_vpaf" },
  { label: "VPRDE", field: "requires_vprde" },
];

const toChecked = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "1" || normalized === "true";
  }
  return false;
};

export function VpSignatoriesSection({ watch, setValue, register, studentInvolvementLocked = false }: Props) {
  const involvesStudents = toChecked(watch("involves_students"));

  const toggleStudents = () => {
    if (studentInvolvementLocked) return;
    setValue("involves_students", !involvesStudents, { shouldDirty: true });
  };

  return (
    <div className="space-y-5 pb-9">
      {/* Student Involvement */}
      <div className="flex flex-col gap-1.5">
        <Label>Student Involvement</Label>
        <button
          type="button"
          onClick={toggleStudents}
          disabled={studentInvolvementLocked}
          title={studentInvolvementLocked ? "Student requestors require student involvement" : undefined}
          className={`flex items-center gap-3 rounded-lg border p-4 w-full transition-colors ${studentInvolvementLocked ? "cursor-not-allowed" : "cursor-pointer"} ${involvesStudents ? "border-gray-800 bg-gray-100" : "border-border bg-white hover:bg-muted"
            }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${involvesStudents ? "border-gray-800 bg-gray-800" : "border-gray-300 bg-white"
              }`}
          >
            {involvesStudents && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </span>
          <span className={`text-sm font-medium ${involvesStudents ? "text-gray-800" : "text-gray-700"}`}>
            This event involves students
          </span>
        </button>
      </div>

      {/* VP Signatories */}
      <div className="flex flex-col gap-1.5">
        <Label>VP Signatories</Label>
        <div className="grid grid-cols-2 gap-3">
          {VP_ITEMS.map(({ label, field }) => {
            const checked = toChecked(watch(field));

            return (
              <button
                key={field}
                type="button"
                onClick={() => setValue(field, !checked, { shouldDirty: true })}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-colors cursor-pointer ${checked ? "border-gray-800 bg-gray-100" : "border-border bg-white hover:bg-muted"}`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${checked ? "border-gray-800 bg-gray-800" : "border-gray-300 bg-white"
                    }`}
                >
                  {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
                <span className={`text-sm font-medium ${checked ? "text-gray-800" : "text-gray-700"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Proof of Approval/Decline */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="proof_of_approval" className="inline-flex text-sm pointer-events-none">
          <span className="pointer-events-auto">
            Proof of Approval/Decline <span className="text-muted-foreground">(optional)</span>
          </span>
        </Label>
        <Input
          {...register("proof_of_approval")}
          id="proof_of_approval"
          type="url"
          placeholder="Paste Google Drive/Cloud Storage link"
          className="h-12 text-base border border-gray-300 rounded-lg transition-all duration-150 focus:border-blue-500 focus:ring-blue-500/20"
        />
      </div>
    </div>
  );
}
