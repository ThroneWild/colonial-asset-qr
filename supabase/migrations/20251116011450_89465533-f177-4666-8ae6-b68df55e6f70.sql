-- Adicionar colunas de manutenção à tabela assets
ALTER TABLE public.assets
ADD COLUMN IF NOT EXISTS maintenance_frequency TEXT CHECK (maintenance_frequency IN ('30', '90', '180', '365', 'custom')),
ADD COLUMN IF NOT EXISTS maintenance_custom_interval INTEGER,
ADD COLUMN IF NOT EXISTS last_maintenance_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_maintenance_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS maintenance_type TEXT CHECK (maintenance_type IN ('Preventiva', 'Corretiva', 'Inspeção')),
ADD COLUMN IF NOT EXISTS maintenance_responsible TEXT,
ADD COLUMN IF NOT EXISTS maintenance_notes TEXT,
ADD COLUMN IF NOT EXISTS maintenance_status TEXT CHECK (maintenance_status IN ('Pendente', 'Agendada', 'Em andamento', 'Concluída', 'Atrasada')),
ADD COLUMN IF NOT EXISTS maintenance_priority TEXT CHECK (maintenance_priority IN ('Baixa', 'Média', 'Alta')),
ADD COLUMN IF NOT EXISTS maintenance_criticality TEXT CHECK (maintenance_criticality IN ('Baixa', 'Média', 'Alta')),
ADD COLUMN IF NOT EXISTS maintenance_cost NUMERIC;

-- Criar índices para melhorar performance nas consultas de manutenção
CREATE INDEX IF NOT EXISTS idx_assets_next_maintenance_date ON public.assets(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_assets_maintenance_status ON public.assets(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_assets_maintenance_priority ON public.assets(maintenance_priority);

-- Comentários nas colunas para documentação
COMMENT ON COLUMN public.assets.maintenance_frequency IS 'Frequência de manutenção em dias: 30, 90, 180, 365 ou custom';
COMMENT ON COLUMN public.assets.maintenance_custom_interval IS 'Intervalo personalizado em dias quando frequency é custom';
COMMENT ON COLUMN public.assets.last_maintenance_date IS 'Data da última manutenção realizada';
COMMENT ON COLUMN public.assets.next_maintenance_date IS 'Data prevista para a próxima manutenção';
COMMENT ON COLUMN public.assets.maintenance_type IS 'Tipo de manutenção: Preventiva, Corretiva ou Inspeção';
COMMENT ON COLUMN public.assets.maintenance_responsible IS 'Responsável pela manutenção';
COMMENT ON COLUMN public.assets.maintenance_notes IS 'Observações sobre a manutenção';
COMMENT ON COLUMN public.assets.maintenance_status IS 'Status da manutenção: Pendente, Agendada, Em andamento, Concluída ou Atrasada';
COMMENT ON COLUMN public.assets.maintenance_priority IS 'Prioridade da manutenção: Baixa, Média ou Alta';
COMMENT ON COLUMN public.assets.maintenance_criticality IS 'Criticidade do ativo: Baixa, Média ou Alta';
COMMENT ON COLUMN public.assets.maintenance_cost IS 'Custo estimado ou real da manutenção';