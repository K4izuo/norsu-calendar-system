import { useState, useCallback, useMemo } from 'react';
import { UIAsset, AssetFormValue } from '@/types/asset';
import { transformUIToForm } from '@/utils/asset-transformers';

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