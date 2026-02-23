import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { EventDetails } from "@/features/calendar/types/calendar.types";
import { ReservationFormData } from "@/interface/user-props";

export function useEditModePopulate({
  editMode,
  eventData,
  isOpen,
  setValue,
  setTaggedPeople,
}: {
  editMode: boolean;
  eventData: EventDetails | undefined;
  isOpen: boolean;
  setValue: UseFormSetValue<ReservationFormData>;
  setTaggedPeople: (people: { id: string; name: string }[]) => void;
}): void {
  useEffect(() => {
    if (editMode && eventData && isOpen) {
      setValue("title_name", eventData.title_name || "");
      setValue("description", eventData.description || "");
      setValue("time_start", eventData.time_start || "");
      setValue("time_end", eventData.time_end || "");
      setValue("range", eventData.range || 1);
      setValue("info_type", eventData.info_type || "");
      setValue("category", eventData.category || "");

      if (eventData.asset) {
        setValue("asset", eventData.asset);
      }

      if (eventData.people_tag && eventData.people_tag.length > 0) {
        const people = eventData.people_tag.map((name, index) => ({
          id: `edit-${index}`,
          name: name,
        }));
        setTaggedPeople(people);
        setValue("people_tag", eventData.people_tag.join(", "));
      }
    }
  }, [editMode, eventData, isOpen, setValue, setTaggedPeople]);
}
