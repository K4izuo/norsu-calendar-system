import { DatabaseAsset, UIAsset, AssetFormValue } from "@/types/asset";

export const transformDatabaseToUI = (dbAsset: DatabaseAsset): UIAsset => ({
  id: String(dbAsset.id),
  name: dbAsset.asset_name,
  capacity: `${dbAsset.capacity} seats`,
});

export const transformUIToForm = (uiAsset: UIAsset): AssetFormValue => ({
  id: uiAsset.id,
  name: uiAsset.name,
  capacity: uiAsset.capacity,
});

export const transformFormToAPI = (formAsset: AssetFormValue): { asset_id: number } => ({
  asset_id: Number(formAsset.id), // Only send ID to backend
});