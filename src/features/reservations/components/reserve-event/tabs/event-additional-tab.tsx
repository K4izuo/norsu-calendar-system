import React from "react";
import { Label } from "@/shared/components/ui/label";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import {
  Control,
  FieldErrors,
  Controller,
  useWatch,
} from "react-hook-form";
import { ReservationFormData } from "@/interface/user-props";
import { User, X, AlertCircle, UserPlus, Check } from "lucide-react";
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
  showOutsource: boolean;
  showGuest: boolean;
  guestNameInput: string;
  guestDetailsInput: string;
  outsourceError: string | null;
  guestNameError: string | null;
  guestDetailsError: string | null;
  setGuestNameInput: (v: string) => void;
  setGuestDetailsInput: (v: string) => void;
  setOutsourceError: (v: string | null) => void;
  setGuestNameError: (v: string | null) => void;
  setGuestDetailsError: (v: string | null) => void;
  handleOutsourceToggle: (checked: boolean) => void;
  handleGuestToggle: (checked: boolean) => void;
  handleAddGuest: () => void;
  handleRemoveGuest: (index: number) => void;
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
  showOutsource,
  showGuest,
  guestNameInput,
  guestDetailsInput,
  outsourceError,
  guestNameError,
  guestDetailsError,
  setGuestNameInput,
  setGuestDetailsInput,
  setOutsourceError,
  setGuestNameError,
  setGuestDetailsError,
  handleOutsourceToggle,
  handleGuestToggle,
  handleAddGuest,
  handleRemoveGuest,
}: Props) {
  const categoryValue = useWatch({ control, name: "category" });

  const isAll = showOutsource && showGuest;

  const handleAllToggle = (checked: boolean) => {
    handleOutsourceToggle(checked);
    handleGuestToggle(checked);
  };

  const filteredSuggestions = peopleSuggestions.filter(
    (person) =>
      person.name.toLowerCase().includes(tagInput.toLowerCase()) &&
      !taggedPeople.some((p) => p.id === person.id),
  );

  const getInputError = () => {
    if (tagInput.length > 0 && tagInput.length < 3) {
      return "People tag must be at least 3 characters";
    }
    return null;
  };

  const inputError = getInputError();

  return (
    <div className="space-y-5 pb-9">
      <div className="space-y-5">
        {/* People Tag */}
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
                      field.onBlur();
                      field.onChange(
                        taggedPeople.map((p) => p.name).join(", "),
                      );
                      setTimeout(() => setShowDropdown(false), 150);
                    }}
                    onFocus={() => {
                      setShowDropdown(tagInput.length > 0);
                    }}
                    className={`h-12 border-2 text-base w-full transition-all duration-150 ${hasError
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

        {/* Information Type */}
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

        {/* Category */}
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
        {categoryValue === "other" && (
          <Controller
            name="other_category"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="other_category" className="text-sm inline-flex pointer-events-none">
                  <span className="pointer-events-auto">
                    Please specify<span className="text-red-500"> *</span>
                  </span>
                </Label>
                <Textarea
                  id="other_category"
                  placeholder="Describe your category..."
                  value={field.value || ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  className={`min-h-20 text-base transition-all duration-150 resize-none ${errors.other_category
                    ? "border-2 border-red-400 focus:border-red-500 focus:ring-red-200"
                    : "border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                />
                {errors.other_category && (
                  <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>{errors.other_category.message as string}</p>
                  </div>
                )}
              </div>
            )}
          />
        )}

        {/* Add External Participants */}
        <Controller
          name="outsource"
          control={control}
          render={({ field: outsourceField }) => (
            <Controller
              name="guests"
              control={control}
              render={({ field: guestsField }) => {
                const guests = guestsField.value || [];

                return (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      Add External Participants
                    </Label>

                    {/* Option cards */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        {
                          label: "Outsource",
                          active: showOutsource && !showGuest,
                          onToggle: (on: boolean) => {
                            if (on) { handleOutsourceToggle(true); handleGuestToggle(false); }
                            else { handleOutsourceToggle(false); }
                          },
                        },
                        {
                          label: "Guest",
                          active: showGuest && !showOutsource,
                          onToggle: (on: boolean) => {
                            if (on) { handleGuestToggle(true); handleOutsourceToggle(false); }
                            else { handleGuestToggle(false); }
                          },
                        },
                        {
                          label: "All",
                          active: isAll,
                          onToggle: (on: boolean) => handleAllToggle(on),
                        },
                      ].map(({ label, active, onToggle }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => onToggle(!active)}
                          className={`flex items-center gap-3 rounded-lg border p-4 transition-colors cursor-pointer ${active
                            ? "border-gray-800 bg-gray-100"
                            : "border-border bg-white hover:bg-muted"
                            }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${active
                              ? "border-gray-800 bg-gray-800"
                              : "border-gray-300 bg-white"
                              }`}
                          >
                            {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                          </span>
                          <span className={`text-sm font-medium ${active ? "text-gray-800" : "text-gray-700"}`}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Outsource textarea */}
                    {showOutsource && (
                      <div className="flex flex-col gap-1.5 mt-3.5">
                        <Label htmlFor="outsource" className="inline-flex text-sm pointer-events-none">
                          Outsource
                        </Label>
                        <Textarea
                          id="outsource"
                          placeholder="Describe any outsourced services or external providers..."
                          value={outsourceField.value || ""}
                          onChange={(e) => {
                            outsourceField.onChange(e);
                            if (e.target.value.trim()) setOutsourceError(null);
                          }}
                          onBlur={() => {
                            outsourceField.onBlur();
                            if (!outsourceField.value?.trim()) setOutsourceError("Outsource description is required");
                          }}
                          className={`min-h-20 text-base transition-all duration-150 resize-none ${outsourceError
                            ? "border-2 border-red-400 focus:border-red-500 focus:ring-red-200"
                            : "border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                            }`}
                        />
                        {outsourceError && (
                          <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 mt-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <p>{outsourceError}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Guest inputs */}
                    {showGuest && (
                      <div className="flex flex-col gap-1.5 mt-3.5">
                        <Label className="inline-flex text-sm pointer-events-none">Guest</Label>
                        <div className="flex gap-2 items-start">
                          <div className="flex flex-col flex-1 gap-1.5">
                            <Input
                              placeholder="Guest name..."
                              value={guestNameInput}
                              onChange={(e) => {
                                setGuestNameInput(e.target.value);
                                if (e.target.value.trim()) setGuestNameError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleAddGuest(); }
                              }}
                              className={`h-12 text-base transition-all duration-150 ${guestNameError
                                ? "border-2 border-red-400 focus:border-red-500 focus:ring-red-200"
                                : "border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                }`}
                            />
                            {guestNameError && (
                              <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>{guestNameError}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1 gap-1.5">
                            <Input
                              placeholder="Guest details (role, org, etc.)..."
                              value={guestDetailsInput}
                              onChange={(e) => {
                                setGuestDetailsInput(e.target.value);
                                if (e.target.value.trim()) setGuestDetailsError(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); handleAddGuest(); }
                              }}
                              className={`h-12 text-base transition-all duration-150 ${guestDetailsError
                                ? "border-2 border-red-400 focus:border-red-500 focus:ring-red-200"
                                : "border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                                }`}
                            />
                            {guestDetailsError && (
                              <div className="flex will-change-transform backface-hidden items-start gap-1.5 text-red-500 text-xs sm:text-sm pl-1 animate-in fade-in slide-in-from-top-1 duration-150">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <p>{guestDetailsError}</p>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={handleAddGuest}
                            className="h-12 px-4 shrink-0 bg-gray-800 hover:bg-gray-700 text-white"
                          >
                            <UserPlus className="w-4 h-4" />
                          </Button>
                        </div>
                        {guests.length > 0 && (
                          <div className="flex flex-col gap-2 mt-1">
                            {guests.map((guest, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 bg-gray-50"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <User className="w-4 h-4 shrink-0 text-gray-500" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                      {guest.name}
                                    </p>
                                    {guest.details && (
                                      <p className="text-xs text-gray-500 truncate">
                                        {guest.details}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGuest(idx)}
                                  className="ml-3 shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }}
            />
          )}
        />
      </div>
    </div>
  );
}
