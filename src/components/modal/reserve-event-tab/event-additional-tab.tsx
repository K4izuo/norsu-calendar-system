import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, User } from "lucide-react"

interface Props {
  formData: any
  infoTypes: { value: string; label: string }[]
  categories: { value: string; label: string }[]
  tagInput: string
  taggedPeople: { id: string; name: string }[]
  peopleSuggestions: { id: string; name: string }[]
  showDropdown: boolean
  handleTagInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleTagSelect: (person: { id: string; name: string }) => void
  handleRemoveTag: (id: string) => void
  handleInfoTypeChange: (value: string) => void
  handleCategoryChange: (value: string) => void
  setShowDropdown: (show: boolean) => void
  missingFields?: Record<string, boolean>
}

export function ReserveEventAdditionalTab({
  formData,
  infoTypes,
  categories,
  tagInput,
  taggedPeople,
  peopleSuggestions,
  showDropdown,
  handleTagInputChange,
  handleTagSelect,
  handleRemoveTag,
  handleInfoTypeChange,
  handleCategoryChange,
  setShowDropdown,
  missingFields = {},
}: Props) {
  return (
    <form className="space-y-4 sm:space-y-6">
      <div className="space-y-4 sm:space-y-5">
        <div>
          <Label htmlFor="people" className="text-base font-medium">People Tag</Label>
          <div className="relative mt-1">
            <Input
              id="people"
              name="people"
              placeholder="Type a name to tag..."
              value={tagInput}
              onChange={handleTagInputChange}
              className={`h-12 text-base w-full ${missingFields.people ? "border-red-500 focus:border-red-500" : ""}`}
              autoComplete="off"
              onFocus={() => setShowDropdown(tagInput.length > 0)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && (
              <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-auto">
                {peopleSuggestions
                  .filter(person =>
                    person.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !taggedPeople.some(p => p.id === person.id)
                  )
                  .map(person => (
                    <button
                      key={person.id}
                      type="button"
                      className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50"
                      onMouseDown={() => handleTagSelect(person)}
                    >
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      {person.name}
                    </button>
                  ))}
                {peopleSuggestions.filter(person =>
                  person.name.toLowerCase().includes(tagInput.toLowerCase()) &&
                  !taggedPeople.some(p => p.id === person.id)
                ).length === 0 && (
                  <div className="px-3 py-2 text-gray-400">No matches found</div>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {taggedPeople.map(person => (
                <span
                  key={person.id}
                  className="px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent"
                >
                  {person.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(person.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={`Remove ${person.name}`}
                  >
                    <X className="w-3 cursor-pointer h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="infoType" className="text-base font-medium">Information Type</Label>
          <Select
            value={formData.infoType}
            onValueChange={handleInfoTypeChange}
          >
            <SelectTrigger id="infoType" className={`mt-1 text-base w-full h-12 ${missingFields.infoType ? "border-red-500 focus:border-red-500" : ""}`}>
              <SelectValue placeholder="Select information type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-base">Types</SelectLabel>
                {infoTypes.map(type => (
                  <SelectItem key={type.value} value={type.value} className="text-base">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category" className="text-base font-medium">Category</Label>
          <Select
            value={formData.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger id="category" className={`mt-1 text-base w-full h-12 ${missingFields.category ? "border-red-500 focus:border-red-500" : ""}`}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-base">Categories</SelectLabel>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value} className="text-base">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  )
}