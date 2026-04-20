import { UseFormWatch, UseFormSetValue } from "react-hook-form";
import { ReservationFormData } from "@/features/reservations/types/reservation.types";
import { Check, Minus, Plus, AlertCircle } from "lucide-react";

const EQUIPMENT_LIST = [
  "Microphones",
  "Mic cables",
  "Tables",
  "Chairs",
  "Speakers",
  "LED wall",
  "Sound system",
  "Air-conditioning",
];

interface Props {
  watch: UseFormWatch<ReservationFormData>;
  setValue: UseFormSetValue<ReservationFormData>;
  touched: boolean;
}

export function ReserveEventEquipmentTab({ watch, setValue, touched }: Props) {
  const selected = (watch("equipment") || []).filter(
    (e): e is { name: string; quantity: number } =>
      typeof e === "object" && e !== null && typeof e.name === "string"
  );

  const getItem = (name: string) => selected.find((e) => e.name === name);
  const isSelected = (name: string) => !!getItem(name);
  const getQty = (name: string) => getItem(name)?.quantity ?? 0;

  const toggleItem = (name: string) => {
    if (isSelected(name)) {
      setValue("equipment", selected.filter((e) => e.name !== name), { shouldDirty: true });
    } else {
      setValue("equipment", [...selected, { name, quantity: 1 }], { shouldDirty: true });
    }
  };

  const increment = (name: string) => {
    setValue(
      "equipment",
      selected.map((e) => (e.name === name ? { ...e, quantity: e.quantity + 1 } : e)),
      { shouldDirty: true }
    );
  };

  const decrement = (name: string) => {
    const item = getItem(name);
    if (!item) return;
    if (item.quantity <= 1) {
      setValue("equipment", selected.filter((e) => e.name !== name), { shouldDirty: true });
    } else {
      setValue(
        "equipment",
        selected.map((e) => (e.name === name ? { ...e, quantity: e.quantity - 1 } : e)),
        { shouldDirty: true }
      );
    }
  };

  const showError = touched && selected.length === 0;

  return (
    <div className="space-y-5 pb-2">
      <p className="text-sm text-gray-500">
        Select the equipment you need for your event
      </p>
      <div className="grid grid-cols-2 gap-3">
        {EQUIPMENT_LIST.map((item) => {
          const active = isSelected(item);
          const qty = getQty(item);
          return (
            <div
              key={item}
              className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${active
                ? "border-gray-800 bg-gray-100"
                : "border-border bg-white hover:bg-muted"
                }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item)}
                className="flex items-center gap-3 flex-1 text-left cursor-pointer"
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active ? "border-gray-800 bg-gray-800" : "border-gray-300 bg-white"
                    }`}
                >
                  {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </span>
                <span className={`text-sm font-medium ${active ? "text-gray-800" : "text-gray-700"}`}>
                  {item}
                </span>
              </button>

              {active && (
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => decrement(item)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-800 bg-white text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-gray-800">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(item)}
                    className="flex h-6 w-6 items-center justify-center rounded-md border border-gray-800 bg-white text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showError && (
        <div className="flex items-start gap-1.5 text-red-500 text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Please select at least one equipment item.</p>
        </div>
      )}
    </div>
  );
}
