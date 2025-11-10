-- Adicionar campo username na tabela profiles (se não existir)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;

-- Preencher username para registros existentes que não têm username
UPDATE public.profiles 
SET username = split_part(email, '@', 1)
WHERE username IS NULL;

-- Criar índice único para username
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles(username);

-- Adicionar constraint de username obrigatório
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS username_required;
  
ALTER TABLE public.profiles 
  ADD CONSTRAINT username_required 
  CHECK (username IS NOT NULL AND username != '');

-- Função para buscar email pelo username
CREATE OR REPLACE FUNCTION public.get_email_by_username(user_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_email text;
BEGIN
  -- Buscar email pelo username
  SELECT email INTO user_email
  FROM public.profiles
  WHERE username = user_username;
  
  RETURN user_email;
END;
$$;

-- Atualizar função handle_new_user para incluir username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;