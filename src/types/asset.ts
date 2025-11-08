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
