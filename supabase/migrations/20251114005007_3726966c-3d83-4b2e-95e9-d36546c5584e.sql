-- Fix search_path for security functions to prevent injection attacks

-- Update admin_create_user function
CREATE OR REPLACE FUNCTION public.admin_create_user(user_email text, user_password text, user_full_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem criar usuários';
  END IF;

  -- Inserir no auth.users seria feito via Supabase Admin API
  -- Esta função serve apenas como placeholder e validação
  -- A criação real será feita via Supabase client no frontend
  
  result := json_build_object(
    'success', true,
    'message', 'Use Supabase Admin API para criar o usuário'
  );
  
  RETURN result;
END;
$$;

-- Update get_email_by_username function
CREATE OR REPLACE FUNCTION public.get_email_by_username(user_username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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