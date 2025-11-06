import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, User } from "lucide-react"
import { Control, FieldErrors, Controller, UseFormRegister, RegisterOptions } from "react-hook-form"
import { ReservationFormData } from "@/interface/user-props"

interface ValidationRules {
  people: RegisterOptions<ReservationFormData, "people">
  infoType: RegisterOptions<ReservationFormData, "infoType">
  category: RegisterOptions<ReservationFormData, "category">
}

interface Props {
  control: Control<ReservationFormData>
  errors: FieldErrors<ReservationFormData>
  infoTypes: { value: string; label: string }[]
  categories: { value: string; label: string }[]
  tagInput: string
  taggedPeople: { id: string; name: string }[]
  peopleSuggestions: { id: string; name: string }[]
  showDropdown: boolean
  handleTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleTagSelect: (person: { id: string; name: string }) => void
  handleRemoveTag: (id: string) => void
  setShowDropdown: (show: boolean) => void
  validationRules: ValidationRules
  register: UseFormRegister<ReservationFormData>
  peopleFieldRef: React.RefObject<HTMLInputElement | null>
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
  validationRules,
  peopleFieldRef,
}: Props) {
  const getFieldClass = (hasError: boolean) => 
    `mt-1 cursor-pointer border-2 text-base w-full h-12 focus:border-ring ${
      hasError ? "border-red-500 focus:border-red-500" : "border-gray-200"
    }`

  const filteredSuggestions = peopleSuggestions.filter(person =>
    person.name.toLowerCase().includes(tagInput.toLowerCase()) &&
    !taggedPeople.some(p => p.id === person.id)
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="people" className="text-base inline-block font-medium">People Tag<span className="text-red-500"> *</span></Label>
          <Controller
            name="people"
            control={control}
            rules={validationRules.people}
            render={({ field, fieldState: { invalid, isTouched } }) => (
              <div className="relative mt-1">
                <Input
                  ref={peopleFieldRef}
                  placeholder="Type a name to tag..."
                  value={tagInput}
                  onChange={(e) => {
                    handleTagInputChange(e);
                    // Trigger validation on every change
                    field.onChange(taggedPeople.map(p => p.name).join(', '));
                  }}
                  onBlur={() => {
                    // Mark field as touched and validate
                    field.onBlur();
                    field.onChange(taggedPeople.map(p => p.name).join(', '));
                    setTimeout(() => setShowDropdown(false), 150);
                  }}
                  onFocus={() => {
                    setShowDropdown(tagInput.length > 0);
                    // Ensure field is marked as touched when focused
                    field.onChange(taggedPeople.map(p => p.name).join(', '));
                  }}
                  className={`h-12 border-2 text-base w-full focus:border-ring transition-all duration-[95ms] ${
                    (errors.people || (invalid && isTouched && taggedPeople.length === 0)) ? "border-red-500 focus:border-red-500" : "border-gray-200"
                  }`}
                  autoComplete="off"
                />
                {showDropdown && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
                    {filteredSuggestions.map(person => (
                      <button
                        key={person.id}
                        type="button"
                        className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50"
                        onMouseDown={() => {
                          handleTagSelect(person);
                          // Update field value immediately when tag is selected
                          const updatedPeople = [...taggedPeople, person];
                          field.onChange(updatedPeople.map(p => p.name).join(', '));
                        }}
                      >
                        <User className="w-4 h-4 mr-2 text-blue-500" />
                        {person.name}
                      </button>
                    ))}
                    {filteredSuggestions.length === 0 && (
                      <div className="px-3 py-2 text-gray-400">No matches found</div>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {taggedPeople.map(person => (
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
                          // Update field value immediately when tag is removed
                          const updatedPeople = taggedPeople.filter(p => p.id !== person.id);
                          field.onChange(updatedPeople.map(p => p.name).join(', '));
                        }}
                        className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label={`Remove ${person.name}`}
                      >
                        <X className="w-3 cursor-pointer h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          />
        </div>
        <div>
          <Label htmlFor="infoType" className="text-base inline-block font-medium">Information Type<span className="text-red-500"> *</span></Label>
          <Controller
            name="infoType"
            control={control}
            rules={validationRules.infoType}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="infoType" className={getFieldClass(!!errors.infoType)}>
                  <SelectValue placeholder="Select information type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-base">Types</SelectLabel>
                    {infoTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-base cursor-pointer">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label htmlFor="category" className="text-base inline-block font-medium">Category<span className="text-red-500"> *</span></Label>
          <Controller
            name="category"
            control={control}
            rules={validationRules.category}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="category" className={getFieldClass(!!errors.category)}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-base">Categories</SelectLabel>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value} className="text-base cursor-pointer">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  )
}