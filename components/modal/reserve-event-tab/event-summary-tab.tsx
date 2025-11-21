import React from "react"
import { CalendarPlus2, MapPin, NotebookPen, Clock, FileText, CheckCircle2, User } from "lucide-react"
import { ReservationFormData } from "@/interface/user-props"

interface Props {
  formData: ReservationFormData
  categories: { value: string; label: string }[]
  infoTypes: { value: string; label: string }[]
  taggedPeople: { id: string; name: string }[]
  isFormValid: () => boolean
}

export function ReserveEventSummaryTab({
  formData,
  categories,
  infoTypes,
  taggedPeople,
  isFormValid,
}: Props) {
  const asset = formData.asset;
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <CalendarPlus2 className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Basic Information</h3>
        </div>
        <div className="border-b border-gray-300 mb-4" /> {/* line below label */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Event Title</p>
            <p className="font-medium text-base">{formData.title_name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Information Type</p>
            <p className="font-medium text-base">
              {infoTypes.find(type => type.value === formData.info_type)?.label || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">People Tag</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {taggedPeople.length > 0 ? (
                taggedPeople.map(person => (
                  <span
                    key={person.id}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 text-gray-800 bg-transparent"
                  >
                    <User className="w-3 h-3 mr-1.5 text-gray-800" />
                    {person.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">None</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-base text-gray-500">Category</p>
            <p className="font-medium text-base">
              {categories.find(cat => cat.value === formData.category)?.label || "Not provided"}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <MapPin className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Asset Information</h3>
        </div>
        <div className="border-b border-gray-300 mb-4" /> {/* line below label */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* <div>
            <p className="text-base text-gray-500">Asset Type</p>
            <p className="font-medium text-base">{asset?.asset_type || "Not selected"}</p>
          </div> */}
          <div>
            <p className="text-base text-gray-500">Asset Name</p>
            <p className="font-medium text-base">{asset?.asset_name || "Not selected"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Capacity</p>
            <p className="font-medium text-base">{asset?.capacity || "N/A"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Date</p>
            <p className="font-medium text-base">{asset?.capacity || "N/A"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Facilities</p>
            <p className="font-medium text-base">{asset?.capacity || "N/A"}</p>
          </div>
          {asset?.facilities && asset.facilities.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-base text-gray-500">Facilities</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {asset.facilities.map((facility, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <NotebookPen className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Reservation Details</h3>
        </div>
        <div className="border-b border-gray-300 mb-4" /> {/* line below label */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Start Time</p>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
              <p className="font-medium text-base">{formData.time_start || "Not specified"}</p>
            </div>
          </div>
          <div>
            <p className="text-base text-gray-500">End Time</p>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
              <p className="font-medium text-base">{formData.time_end || "Not specified"}</p>
            </div>
          </div>
          <div>
            <p className="text-base text-gray-500">Reservation Range</p>
            <p className="font-medium text-base">{formData.range} day{formData.range > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>
      {formData.description && (
        <div className="bg-gray-50 shadow-sm rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FileText className="text-gray-500 mr-2 h-6 w-6" />
            <h3 className="text-lg font-medium text-gray-700">Additional Details</h3>
          </div>
          <div className="border-b border-gray-300 mb-4" />
          <div>
            <p className="text-base text-gray-500">Full Description</p>
            <p className="mt-1 text-base">{formData.description}</p>
          </div>
        </div>
      )}
      <div className={`mt-6 p-3 rounded-md flex items-center justify-center ${isFormValid()
          ? 'bg-green-50 text-green-800'
          : 'bg-yellow-50 text-yellow-800'
        }`}>
        {isFormValid() ? (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span className="text-base">Ready for submission</span>
          </>
        ) : (
          <>
            <Clock className="h-5 w-5 mr-2" />
            <span className="text-base">Please complete all required fields</span>
          </>
        )}
      </div>
    </div>
  )
}