-- Adicionar campos de tipo de localização e número de apartamento
ALTER TABLE public.assets
ADD COLUMN location_type text CHECK (location_type IN ('departamento', 'apartamento')) DEFAULT 'departamento',
ADD COLUMN apartment_number text;

-- Criar índice para busca por apartamento
CREATE INDEX idx_assets_apartment_number ON public.assets(apartment_number) WHERE apartment_number IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN public.assets.location_type IS 'Tipo de localização: departamento ou apartamento/UH';
COMMENT ON COLUMN public.assets.apartment_number IS 'Número do apartamento quando location_type = apartamento';