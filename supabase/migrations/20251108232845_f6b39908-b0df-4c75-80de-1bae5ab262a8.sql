-- FASE 2: Criar tabela de histórico de alterações
CREATE TABLE IF NOT EXISTS public.asset_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON public.asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_history_created_at ON public.asset_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_asset_history_user_id ON public.asset_history(user_id);

-- RLS Policies
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ver histórico"
  ON public.asset_history FOR SELECT
  USING (true);

CREATE POLICY "Sistema pode inserir histórico"
  ON public.asset_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger para registro automático de alterações
CREATE OR REPLACE FUNCTION public.log_asset_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.asset_history (
      asset_id,
      user_id,
      action,
      old_values,
      new_values,
      changed_fields
    ) VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.modified_by),
      'updated',
      to_jsonb(OLD),
      to_jsonb(NEW),
      ARRAY(
        SELECT key FROM jsonb_each(to_jsonb(NEW))
        WHERE to_jsonb(NEW) -> key IS DISTINCT FROM to_jsonb(OLD) -> key
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.asset_history (
      asset_id,
      user_id,
      action,
      old_values,
      new_values,
      changed_fields
    ) VALUES (
      NEW.id,
      COALESCE(auth.uid(), NEW.user_id),
      'created',
      NULL,
      to_jsonb(NEW),
      ARRAY[]::TEXT[]
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER asset_changes_trigger
  AFTER INSERT OR UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_asset_changes();