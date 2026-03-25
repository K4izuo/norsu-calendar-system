import { useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { ReservationFormData } from "@/interface/user-props";

export const useAssetSelection = (setValue: UseFormSetValue<ReservationFormData>) => {
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  const handleAssetChange = (value: string) => {
    const numericValue = parseInt(value);

    if (numericValue === 1) {
      setShowVenueModal(true);
      return;
    }
    if (numericValue === 2) {
      setShowVehicleModal(true);
      return;
    }
  };

  const handleAssetItemSelect = (asset: { id: number; asset_name: string; asset_type: string; capacity: number }) => {
    setValue("asset", {
      id: Number(asset.id),
      asset_name: asset.asset_name,
      capacity: Number(asset.capacity) || 0,
      asset_type: asset.asset_type,
    }, { shouldValidate: true, shouldTouch: true });
    setShowVenueModal(false);
    setShowVehicleModal(false);
  };

  return {
    showVenueModal,
    setShowVenueModal,
    showVehicleModal,
    setShowVehicleModal,
    handleAssetChange,
    handleAssetItemSelect,
  };
};
