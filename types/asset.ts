// Database/API types (what your backend expects)
export interface DatabaseAsset {
  id: number;
  asset_name: string;
  capacity: number;
}

// UI types (what your frontend uses)
export interface UIAsset {
  id: string;
  name: string;
  capacity: string;
  facilities?: string[];
}

// Form types (what react-hook-form uses)
export interface AssetFormValue {
  id: string;
  name: string;
  capacity: string;
}