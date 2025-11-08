-- Adicionar política de leitura pública para visualização de ativos via QR Code
-- Mantém as outras operações restritas a usuários autenticados
DROP POLICY IF EXISTS "Authenticated users can view assets" ON public.assets;

-- Política para permitir leitura pública (para QR Code)
CREATE POLICY "Public can view assets"
ON public.assets
FOR SELECT
USING (true);

-- As políticas de INSERT, UPDATE e DELETE permanecem restritas a usuários autenticados