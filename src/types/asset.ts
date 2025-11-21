import {
  MaintenanceFrequencyValue,
  MaintenanceRecord,
  MaintenanceStatus,
  MaintenanceType,
  MaintenancePriority,
  MaintenanceCriticality,
} from "./maintenance";

export interface Asset {
  id: string;
  item_number: number;
  description: string;
  sector: string;
  location_type?: 'departamento' | 'apartamento' | null;
  apartment_number?: string | null;
  asset_group: string;
  conservation_state: string;
  brand_model: string | null;
  evaluation_value: number | null;
  qr_code_url: string | null;
  invoice_url: string | null;
  user_id: string | null;
  modified_by: string | null;
  created_at: string;
  updated_at: string;
  maintenance_frequency?: MaintenanceFrequencyValue | null;
  maintenance_custom_interval?: number | null;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  maintenance_type?: MaintenanceType | null;
  maintenance_responsible?: string | null;
  maintenance_notes?: string | null;
  maintenance_status?: MaintenanceStatus | null;
  maintenance_priority?: MaintenancePriority | null;
  maintenance_criticality?: MaintenanceCriticality | null;
  maintenance_cost?: number | null;
  maintenance_history?: MaintenanceRecord[] | null;
}

export interface AssetFormData {
  description: string;
  sector: string;
  location_type?: 'departamento' | 'apartamento';
  apartment_number?: string;
  asset_group: string;
  conservation_state: "Novo" | "Bom" | "Regular" | "Ruim";
  brand_model?: string;
  evaluation_value?: number;
  maintenance_frequency?: MaintenanceFrequencyValue | null;
  maintenance_custom_interval?: number | null;
  last_maintenance_date?: string | null;
  next_maintenance_date?: string | null;
  maintenance_type?: MaintenanceType | null;
  maintenance_responsible?: string | null;
  maintenance_notes?: string | null;
  maintenance_status?: MaintenanceStatus | null;
  maintenance_priority?: MaintenancePriority | null;
  maintenance_criticality?: MaintenanceCriticality | null;
  maintenance_cost?: number | null;
}

export const SECTORS = [
  "Gerência",
  "Recepção",
  "Hall recepção",
  "Manutenção",
  "Cozinha",
  "Restaurante",
  "Lavanderia",
  "Apartamentos",
  "Área Externa",
  "Administrativo",
  "Reservas",
  "Cafeteria",
  "Copa",
  "Lava louças",
  "Almoxarifado",
  "Refeitorio",
  "Sala de descanço",
  "Bar da pscina",
  "Governança",
  "Deposito",
  "Ala 100",
  "Ala 200",
  "Ala 300",
  "Ala 80",
  "Ala 60",
  "Ala 600",
] as const;

export const ASSET_GROUPS = [
  "Móveis",
  "Eletrodomésticos",
  "Eletrônicos",
  "TI",
  "Decoração",
  "Ferramentas",
  "Equipamentos",
  "Utensílios",
] as const;

export const CONSERVATION_STATES = ["Novo", "Bom", "Regular", "Ruim"] as const;

export interface AssetHistoryEntry {
  id: string;
  asset_id: string;
  user_id: string;
  action: "created" | "updated" | "deleted" | "sector_changed";
  old_values: Partial<Asset> | null;
  new_values: Partial<Asset>;
  changed_fields: string[];
  created_at: string;
  deletion_reason?: string;
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
  apartmentNumbers?: string[];
  valueMin?: number;
  valueMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "date_desc" | "date_asc" | "value_desc" | "value_asc" | "alpha";
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
