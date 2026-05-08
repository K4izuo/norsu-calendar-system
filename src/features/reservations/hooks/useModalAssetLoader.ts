import { useEffect, useState } from "react";
import { useTimedLoading } from "@/shared/components/hooks/use-timed-loading";

type ModalAsset = {
  id: number;
  asset_name: string;
  asset_type: string;
  capacity: number;
  location: string;
};

const fallbackVenueAssets: ModalAsset[] = [
  {
    id: 1,
    asset_name: "Main Building, Room 101",
    asset_type: "venue",
    capacity: 120,
    location: "Main Campus",
  },
  {
    id: 2,
    asset_name: "Science Building, Room 203",
    asset_type: "venue",
    capacity: 80,
    location: "Science Campus",
  },
];

const fallbackVehicleAssets: ModalAsset[] = [
  {
    id: 3,
    asset_name: "School Bus",
    asset_type: "vehicle",
    capacity: 50,
    location: "Main Campus",
  },
  {
    id: 4,
    asset_name: "Van",
    asset_type: "vehicle",
    capacity: 15,
    location: "Science Campus",
  },
];

const mapAssets = (assets: ModalAsset[] | undefined, fallbackAssets: ModalAsset[]) => {
  if (!assets || assets.length === 0) return fallbackAssets;

  return assets.map((asset) => ({
    id: asset.id,
    asset_name: asset.asset_name,
    asset_type: asset.asset_type,
    capacity: asset.capacity || 0,
    location: asset.location || "N/A",
  }));
};

export function useModalAssetLoader({
  showVenueModal,
  showVehicleModal,
  assets,
}: {
  showVenueModal: boolean;
  showVehicleModal: boolean;
  assets: ModalAsset[] | undefined;
}): {
  loadingVenueAssets: boolean;
  loadingVehicleAssets: boolean;
  venueAssets: ModalAsset[];
  vehicleAssets: ModalAsset[];
} {
  const [venueAssets, setVenueAssets] = useState<ModalAsset[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<ModalAsset[]>([]);
  const {
    isLoading: loadingVenueAssets,
    startLoading: startVenueAssetsLoading,
    stopLoading: stopVenueAssetsLoading,
  } = useTimedLoading();
  const {
    isLoading: loadingVehicleAssets,
    startLoading: startVehicleAssetsLoading,
    stopLoading: stopVehicleAssetsLoading,
  } = useTimedLoading();

  useEffect(() => {
    if (!showVenueModal) {
      stopVenueAssetsLoading();
      return;
    }

    setVenueAssets(mapAssets(assets, fallbackVenueAssets));
    startVenueAssetsLoading(1000);
  }, [assets, showVenueModal, startVenueAssetsLoading, stopVenueAssetsLoading]);

  useEffect(() => {
    if (!showVehicleModal) {
      stopVehicleAssetsLoading();
      return;
    }

    setVehicleAssets(mapAssets(assets, fallbackVehicleAssets));
    startVehicleAssetsLoading(1000);
  }, [assets, showVehicleModal, startVehicleAssetsLoading, stopVehicleAssetsLoading]);

  return { loadingVenueAssets, loadingVehicleAssets, venueAssets, vehicleAssets };
}
