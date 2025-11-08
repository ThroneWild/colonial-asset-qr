-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna user_id na tabela assets para rastrear quem criou/modificou
ALTER TABLE public.assets
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD COLUMN modified_by UUID REFERENCES auth.users(id);

-- Atualizar políticas RLS da tabela assets para usuários autenticados
DROP POLICY IF EXISTS "Permitir leitura pública dos ativos" ON public.assets;
DROP POLICY IF EXISTS "Permitir inserção pública de ativos" ON public.assets;
DROP POLICY IF EXISTS "Permitir atualização pública de ativos" ON public.assets;
DROP POLICY IF EXISTS "Permitir exclusão pública de ativos" ON public.assets;

-- Novas políticas para usuários autenticados
CREATE POLICY "Authenticated users can view assets"
ON public.assets
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert assets"
ON public.assets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update assets"
ON public.assets
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete assets"
ON public.assets
FOR DELETE
TO authenticated
USING (true);