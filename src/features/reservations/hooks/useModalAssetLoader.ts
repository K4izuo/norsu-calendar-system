import { useEffect, useState } from "react";

export function useModalAssetLoader({
  showVenueModal,
  showVehicleModal,
  assets,
}: {
  showVenueModal: boolean;
  showVehicleModal: boolean;
  assets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[] | undefined;
}): {
  loadingVenueAssets: boolean;
  loadingVehicleAssets: boolean;
  venueAssets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[];
  vehicleAssets: { id: number; asset_name: string; asset_type: string; capacity: number; location: string }[];
} {
  const [loadingVenueAssets, setLoadingVenueAssets] = useState(false);
  const [loadingVehicleAssets, setLoadingVehicleAssets] = useState(false);
  const [venueAssets, setVenueAssets] = useState<
    {
      id: number;
      asset_name: string;
      asset_type: string;
      capacity: number;
      location: string;
    }[]
  >([]);
  const [vehicleAssets, setVehicleAssets] = useState<
    {
      id: number;
      asset_name: string;
      asset_type: string;
      capacity: number;
      location: string;
    }[]
  >([]);

  useEffect(() => {
    if (showVenueModal) {
      setLoadingVenueAssets(true);
      setTimeout(() => {
        if (assets && assets.length > 0) {
          const venueAssetsData = assets.map((asset) => ({
            id: asset.id,
            asset_name: asset.asset_name,
            asset_type: asset.asset_type,
            capacity: asset.capacity || 0,
            location: asset.location || "N/A",
          }));
          setVenueAssets(venueAssetsData);
        } else {
          setVenueAssets([
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
          ]);
        }
        setLoadingVenueAssets(false);
      }, 1000);
    }
  }, [showVenueModal, assets]);

  useEffect(() => {
    if (showVehicleModal) {
      setLoadingVehicleAssets(true);
      setTimeout(() => {
        if (assets && assets.length > 0) {
          const vehicleAssetsData = assets.map((asset) => ({
            id: asset.id,
            asset_name: asset.asset_name,
            asset_type: asset.asset_type,
            capacity: asset.capacity || 0,
            location: asset.location || "N/A",
          }));
          setVehicleAssets(vehicleAssetsData);
        } else {
          setVehicleAssets([
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
          ]);
        }
        setLoadingVehicleAssets(false);
      }, 1000);
    }
  }, [showVehicleModal, assets]);

  return { loadingVenueAssets, loadingVehicleAssets, venueAssets, vehicleAssets };
}
