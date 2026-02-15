import { useState, useCallback } from 'react';
import { UIAsset, AssetFormValue } from '@/features/assets/types/asset';
import { transformUIToForm } from '@/features/assets/utils/asset-transformers';

export const useAssetSelection = () => {
  const [selectedAsset, setSelectedAsset] = useState<AssetFormValue | null>(null);

  const handleAssetSelect = useCallback((asset: UIAsset) => {
    const formAsset = transformUIToForm(asset);
    setSelectedAsset(formAsset);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAsset(null);
  }, []);

  return {
    selectedAsset,
    handleAssetSelect,
    clearSelection,
  };
};