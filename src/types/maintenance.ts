export const MAINTENANCE_FREQUENCIES = [
  { label: "30 dias", value: "30" },
  { label: "90 dias", value: "90" },
  { label: "6 meses", value: "180" },
  { label: "1 ano", value: "365" },
  { label: "Personalizado", value: "custom" },
] as const;

export type MaintenanceFrequencyValue = typeof MAINTENANCE_FREQUENCIES[number]["value"];

export const MAINTENANCE_TYPES = ["Preventiva", "Corretiva", "Inspeção"] as const;
export type MaintenanceType = typeof MAINTENANCE_TYPES[number];

export const MAINTENANCE_STATUSES = [
  "Pendente",
  "Agendada",
  "Em andamento",
  "Concluída",
  "Atrasada",
] as const;
export type MaintenanceStatus = typeof MAINTENANCE_STATUSES[number];

export const MAINTENANCE_PRIORITIES = ["Alta", "Média", "Baixa"] as const;
export type MaintenancePriority = typeof MAINTENANCE_PRIORITIES[number];

export const MAINTENANCE_CRITICALITIES = ["Alta", "Média", "Baixa"] as const;
export type MaintenanceCriticality = typeof MAINTENANCE_CRITICALITIES[number];

export const MAINTENANCE_RESPONSIBLES = [
  "Equipe de Manutenção",
  "Manutenção Predial",
  "Manutenção Eletrotécnica",
  "Terceirizado",
] as const;

export interface MaintenanceChecklistItem {
  id: string;
  description: string;
  completed: boolean;
}

export interface MaintenanceWorkOrder {
  id: string;
  number: string;
  maintenanceId: string;
  assetId: string;
  scheduledDate: string;
  description: string;
  checklist: MaintenanceChecklistItem[];
  beforeImages: string[];
  afterImages: string[];
  technician: string;
  estimatedTime: number;
  estimatedCost: number;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  startedAt?: string;
  finishedAt?: string;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  workOrderId: string;
  type: MaintenanceType;
  technician: string;
  date: string;
  status: MaintenanceStatus;
  cost?: number;
  observations?: string;
  checklist?: MaintenanceChecklistItem[];
  attachments?: string[];
}

export interface MaintenanceTask {
  id: string;
  assetId: string;
  asset?: {
    id: string;
    description: string;
    sector?: string | null;
    asset_group?: string | null;
  };
  title: string;
  description?: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  frequency: MaintenanceFrequencyValue;
  customInterval?: number;
  lastMaintenance?: string | null;
  nextMaintenance: string;
  responsible: string;
  criticality: MaintenanceCriticality;
  workOrderId?: string;
  sector?: string;
  itemGroup?: string;
  priority?: MaintenancePriority;
  estimatedCost?: number;
}

export interface MaintenanceAlert {
  id: string;
  taskId: string;
  type:
    | "upcoming"
    | "due"
    | "overdue"
    | "ignored"
    | "critical";
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface MaintenanceDashboardMetrics {
  totalThisMonth: number;
  overdue: number;
  nextSevenDays: number;
  totalCost: number;
  criticalItems: Array<{ assetId: string; name: string; status: MaintenanceStatus; nextMaintenance?: string | null; } >;
  statusDistribution: Record<MaintenanceStatus, number>;
}
