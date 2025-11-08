export interface Asset {
  id: string;
  item_number: number;
  description: string;
  sector: string;
  asset_group: string;
  conservation_state: string;
  brand_model: string | null;
  evaluation_value: number | null;
  qr_code_url: string | null;
  user_id: string | null;
  modified_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssetFormData {
  description: string;
  sector: string;
  asset_group: string;
  conservation_state: 'Novo' | 'Bom' | 'Regular' | 'Ruim';
  brand_model?: string;
  evaluation_value?: number;
}

export const SECTORS = [
  'Gerência',
  'Recepção',
  'Manutenção',
  'Cozinha',
  'Restaurante',
  'Lavanderia',
  'Apartamentos',
  'Área Externa',
  'Administrativo',
] as const;

export const ASSET_GROUPS = [
  'Móveis',
  'Eletrodomésticos',
  'Eletrônicos',
  'TI',
  'Decoração',
  'Ferramentas',
  'Equipamentos',
  'Utensílios',
] as const;

export const CONSERVATION_STATES = ['Novo', 'Bom', 'Regular', 'Ruim'] as const;

export interface AssetHistoryEntry {
  id: string;
  asset_id: string;
  user_id: string;
  action: 'created' | 'updated' | 'deleted' | 'sector_changed';
  old_values: Partial<Asset> | null;
  new_values: Partial<Asset>;
  changed_fields: string[];
  created_at: string;
  user_profile?: {
    full_name: string;
    email: string;
  };
}

export interface AssetFilters {
  searchTerm?: string;
  sectors?: string[];
  groups?: string[];
  conservationStates?: string[];
  valueMin?: number;
  valueMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'date_desc' | 'date_asc' | 'value_desc' | 'value_asc' | 'alpha';
}

export interface AssetStatistics {
  totalAssets: number;
  totalValue: number;
  averageValue: number;
  assetsBySector: Record<string, number>;
  assetsByGroup: Record<string, number>;
  assetsByConservation: Record<string, number>;
  maintenanceRate: number;
  monthlyGrowth: number;
}
