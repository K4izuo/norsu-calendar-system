import { toast } from "react-hot-toast"

export const showAssetFieldError = (field: string, message: string) => {
  const fieldLabels: Record<string, string> = {
    asset_name: "Asset Name",
    asset_type: "Asset Type",
    capacity: "Capacity",
    location: "Location",
    acquisition_date: "Acquisition Date",
    condition: "Condition",
  }

  const fieldLabel = fieldLabels[field] || field

  toast.error(`${fieldLabel} Error: ${message}`, {
    duration: 3000,
  })
}