import { useEffect } from "react";
import { UseFormSetValue } from "react-hook-form";
import { EventDetails, ReservationFormData } from "@/interface/user-props";

export function useEditModePopulate({
  editMode,
  resubmitMode,
  eventData,
  isOpen,
  setValue,
  setTaggedPeople,
}: {
  editMode: boolean;
  resubmitMode?: boolean;
  eventData: EventDetails | undefined;
  isOpen: boolean;
  setValue: UseFormSetValue<ReservationFormData>;
  setTaggedPeople: (people: { id: number; name: string }[]) => void;
}): void {
  useEffect(() => {
    if ((editMode || resubmitMode) && eventData && isOpen) {
      setValue("title_name", eventData.title_name || "");
      setValue("description", eventData.description || "");
      setValue("time_start", eventData.time_start || "");
      setValue("time_end", eventData.time_end || "");
      setValue("date", eventData.date || "");
      setValue("range", eventData.range || 1);
      setValue("info_type", eventData.info_type || "");
      setValue("category", eventData.category || "");

      if (eventData.asset) {
        setValue("asset", eventData.asset);
      }

      if (eventData.people_tag && eventData.people_tag.length > 0) {
        const people = eventData.people_tag.map((name, index) => ({
          id: -(index + 1), // negative = legacy tag with no People table ID
          name: name,
        }));
        setTaggedPeople(people);
        setValue("people_tag", eventData.people_tag.join(", "));
      }
    }
  }, [editMode, resubmitMode, eventData, isOpen, setValue, setTaggedPeople]);
}
