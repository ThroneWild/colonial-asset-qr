-- Criar tabela de ativos patrimoniais
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_number SERIAL UNIQUE NOT NULL,
  description TEXT NOT NULL,
  sector TEXT NOT NULL,
  asset_group TEXT NOT NULL,
  conservation_state TEXT NOT NULL,
  brand_model TEXT,
  evaluation_value DECIMAL(10, 2),
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir acesso público (uso interno do hotel)
CREATE POLICY "Permitir leitura pública dos ativos" 
ON public.assets 
FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserção pública de ativos" 
ON public.assets 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Permitir atualização pública de ativos" 
ON public.assets 
FOR UPDATE 
USING (true);

CREATE POLICY "Permitir exclusão pública de ativos" 
ON public.assets 
FOR DELETE 
USING (true);

-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar trigger para atualização automática de timestamps
CREATE TRIGGER update_assets_updated_at
BEFORE UPDATE ON public.assets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhorar performance nas buscas
CREATE INDEX idx_assets_sector ON public.assets(sector);
CREATE INDEX idx_assets_group ON public.assets(asset_group);
CREATE INDEX idx_assets_item_number ON public.assets(item_number);