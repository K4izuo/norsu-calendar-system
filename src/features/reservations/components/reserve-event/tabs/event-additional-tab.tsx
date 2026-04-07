import React from "react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import {
  Control,
  FieldErrors,
  Controller,
} from "react-hook-form";
import { ReservationFormData } from "@/interface/user-props";
import { User, X, AlertCircle } from "lucide-react";
import { EventSelectField } from "@/features/reservations/components/reserve-event/tabs/event-select-field";

interface Props {
  control: Control<ReservationFormData>;
  errors: FieldErrors<ReservationFormData>;
  infoTypes: { value: string; label: string }[];
  categories: { value: string; label: string }[];
  tagInput: string;
  taggedPeople: { id: number; name: string }[];
  peopleSuggestions: { id: number; name: string }[];
  showDropdown: boolean;
  handleTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTagSelect: (person: { id: number; name: string }) => void;
  handleRemoveTag: (id: number) => void;
  setShowDropdown: (show: boolean) => void;
  peopleFieldRef: React.RefObject<HTMLInputElement | null>;
}

export function ReserveEventAdditionalTab({
  control,
  errors,
  infoTypes,
  categories,
  tagInput,
  taggedPeople,
  peopleSuggestions,
  showDropdown,
  handleTagInputChange,
  handleTagSelect,
  handleRemoveTag,
  setShowDropdown,
  peopleFieldRef,
}: Props) {
  const filteredSuggestions = peopleSuggestions.filter(
    (person) =>
      person.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !taggedPeople.some((p) => p.id === person.id),
  );

  // Client-side validation for typing input
  const getInputError = () => {
    if (tagInput.length > 0 && tagInput.length < 3) {
      return "People tag must be at least 3 characters";
    }
    return null;
  };

  const inputError = getInputError();

  return (
    <div className="space-y-5 min-h-100">
      <div className="space-y-5">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="people"
            className="text-sm inline-flex pointer-events-none"
          >
            <span className="pointer-events-auto">
              People Tag<span className="text-red-500"> *</span>
            </span>
          </Label>
          <Controller
            name="people_tag"
            control={control}
            render={({ field }) => {
              // Priority: input error (typing) > form validation error (no tags)
              const displayError =
                inputError ||
                (errors.people_tag
                  ? (errors.people_tag.message as string)
                  : null);
              const hasError = !!inputError || !!errors.people_tag;

              return (
                <div className="relative">
                  <Input
                    name="people_tag"
                    id="people_tag"
                    ref={peopleFieldRef}
                    placeholder="Type a name to tag..."
                    value={tagInput}
                    onChange={(e) => {
                      handleTagInputChange(e);
                    }}
                    onBlur={() => {
                      // ALWAYS mark as touched and update field value on blur
                      field.onBlur();
                      field.onChange(
                        taggedPeople.map((p) => p.name).join(", "),
                      );
                      setTimeout(() => setShowDropdown(false), 150);
                    }}
                    onFocus={() => {
                      setShowDropdown(tagInput.length > 0);
                    }}
                    className={`h-12 border-2 text-base w-full transition-all duration-150 ${
                      hasError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-200"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                    autoComplete="off"
                  />
                  {showDropdown && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
                      {filteredSuggestions.map((person) => (
                        <button
                          key={person.id}
                          type="button"
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50"
                          onMouseDown={() => {
                            handleTagSelect(person);
                            const updatedPeople = [...taggedPeople, person];
                            field.onChange(
                              updatedPeople.map((p) => p.name).join(", "),
                            );
                          }}
                        >
                          <User className="w-4 h-4 mr-2 text-gray-800" />
                          {person.name}
                        </button>
                      ))}
                      {filteredSuggestions.length === 0 && (
                        <div className="px-3 py-2 text-gray-400">
                          No matches found
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {taggedPeople.map((person) => (
                      <span
                        key={person.id}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent"
                      >
                        <User className="w-3 h-3 mr-1.5 text-gray-800" />
                        {person.name}
                        <button
                          type="button"
                          onClick={() => {
                            handleRemoveTag(person.id);
                            const updatedPeople = taggedPeople.filter(
                              (p) => p.id !== person.id,
                            );
                            field.onChange(
                              updatedPeople.map((p) => p.name).join(", "),
                            );
                          }}
                          className="ml-1.5 text-gray-800 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  {/* Show error message - prioritize input error over form error */}
                  {displayError && (
                    <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <p>{displayError}</p>
                    </div>
                  )}
                </div>
              );
            }}
          />
        </div>
        <Controller
          name="info_type"
          control={control}
          render={({ field }) => (
            <EventSelectField
              id="infoType"
              name="info_type"
              label="Information Type"
              placeholder="Select information type"
              value={field.value || ""}
              onChange={field.onChange}
              options={infoTypes}
              required
              hasError={!!errors.info_type}
              validationError={errors.info_type?.message as string}
              groupLabel="Types"
            />
          )}
        />
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <EventSelectField
              id="category"
              name="category"
              label="Category"
              placeholder="Select category"
              value={field.value || ""}
              onChange={field.onChange}
              options={categories}
              required
              hasError={!!errors.category}
              validationError={errors.category?.message as string}
              groupLabel="Categories"
            />
          )}
        />
      </div>
    </div>
  );
}
