"use client"

import React from "react"
import { Package, MapPin, Calendar, Wrench, CheckCircle2, AlertCircle, Building2 } from "lucide-react"
import { AssetFormData } from "@/features/assets/utils/asset-validation-rules"

interface AssetSummaryTabProps {
  formData: AssetFormData
  assetTypes: { value: string; label: string }[]
  conditionOptions: { value: string; label: string }[]
  campuses: { value: string; label: string }[]
  offices: { value: string; label: string }[]
  isFormValid: boolean
  isAdmin?: boolean
}

export function AssetSummaryTab({
  formData,
  assetTypes,
  conditionOptions,
  campuses,
  offices,
  isFormValid,
  isAdmin = false
}: AssetSummaryTabProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Package className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Asset Information</h3>
        </div>
        <div className="border-b border-gray-300 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Asset Name</p>
            <p className="font-medium text-base">{formData.asset_name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Asset Type</p>
            <p className="font-medium text-base">
              {assetTypes.find(type => type.value === formData.asset_type)?.label || "Not selected"}
            </p>
          </div>
          <div>
            <p className="text-base text-gray-500">Capacity</p>
            <p className="font-medium text-base">{formData.capacity || "Not provided"}</p>
          </div>
          <div>
            <p className="text-base text-gray-500">Availability Status</p>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Campus & Office */}
      {isAdmin && (
        <div className="bg-gray-50 shadow-sm rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Building2 className="text-gray-500 mr-2 h-6 w-6" />
            <h3 className="text-lg font-medium text-gray-700">Campus & Office</h3>
          </div>
          <div className="border-b border-gray-300 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">Campus</p>
              <p className="font-medium text-base">
                {campuses.find(campus => campus.value === formData.campus_id)?.label || "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">Office</p>
              <p className="font-medium text-base">
                {offices.find(office => office.value === formData.office_id)?.label || "Not selected"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <MapPin className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Location Details</h3>
        </div>
        <div className="border-b border-gray-300 mb-4" />
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-base text-gray-500">Location</p>
            <p className="font-medium text-base">{formData.location || "Not provided"}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 shadow-sm rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Calendar className="text-gray-500 mr-2 h-6 w-6" />
          <h3 className="text-lg font-medium text-gray-700">Acquisition & Condition</h3>
        </div>
        <div className="border-b border-gray-300 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-base text-gray-500">Acquisition Date</p>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
              <p className="font-medium text-base">{formatDate(formData.acquisition_date)}</p>
            </div>
          </div>
          <div>
            <p className="text-base text-gray-500">Condition</p>
            <div className="flex items-center">
              <Wrench className="h-4 w-4 mr-1.5 text-gray-500" />
              <p className="font-medium text-base">
                {conditionOptions.find(option => option.value === formData.condition)?.label || "Not selected"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-6 p-3 rounded-md flex items-center justify-center ${isFormValid
        ? 'bg-green-50 text-green-800'
        : 'bg-yellow-50 text-yellow-800'
        }`}>
        {isFormValid ? (
          <>
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span className="text-base">Ready for submission</span>
          </>
        ) : (
          <>
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="text-base">Please complete all required fields</span>
          </>
        )}
      </div>
    </div>
  )
}