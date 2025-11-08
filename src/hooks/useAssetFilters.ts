import { useMemo } from 'react';
import { Asset, AssetFilters } from '@/types/asset';

export const useAssetFilters = (assets: Asset[], filters: AssetFilters) => {
  return useMemo(() => {
    let filtered = [...assets];

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(asset =>
        asset.description.toLowerCase().includes(term) ||
        asset.sector.toLowerCase().includes(term) ||
        asset.asset_group.toLowerCase().includes(term) ||
        asset.item_number.toString().includes(term) ||
        (asset.brand_model && asset.brand_model.toLowerCase().includes(term))
      );
    }

    // Sectors
    if (filters.sectors && filters.sectors.length > 0) {
      filtered = filtered.filter(asset => filters.sectors?.includes(asset.sector));
    }

    // Groups
    if (filters.groups && filters.groups.length > 0) {
      filtered = filtered.filter(asset => filters.groups?.includes(asset.asset_group));
    }

    // Conservation states
    if (filters.conservationStates && filters.conservationStates.length > 0) {
      filtered = filtered.filter(asset => filters.conservationStates?.includes(asset.conservation_state));
    }

    // Value range
    if (filters.valueMin !== undefined) {
      filtered = filtered.filter(asset => (asset.evaluation_value || 0) >= filters.valueMin!);
    }
    if (filters.valueMax !== undefined) {
      filtered = filtered.filter(asset => (asset.evaluation_value || 0) <= filters.valueMax!);
    }

    // Date range
    if (filters.dateFrom) {
      filtered = filtered.filter(asset => new Date(asset.created_at) >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(asset => new Date(asset.created_at) <= filters.dateTo!);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'date_desc':
          filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        case 'date_asc':
          filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          break;
        case 'value_desc':
          filtered.sort((a, b) => (b.evaluation_value || 0) - (a.evaluation_value || 0));
          break;
        case 'value_asc':
          filtered.sort((a, b) => (a.evaluation_value || 0) - (b.evaluation_value || 0));
          break;
        case 'alpha':
          filtered.sort((a, b) => a.description.localeCompare(b.description));
          break;
      }
    }

    return filtered;
  }, [assets, filters]);
};