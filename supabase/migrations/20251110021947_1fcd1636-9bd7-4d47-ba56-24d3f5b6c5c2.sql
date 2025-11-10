-- Dropar função existente
DROP FUNCTION IF EXISTS public.list_all_users();

-- Recriar função com username
CREATE OR REPLACE FUNCTION public.list_all_users()
RETURNS TABLE(id uuid, email text, full_name text, created_at timestamp with time zone, role text, username text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Apenas administradores podem listar usuários';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.created_at,
    COALESCE(ur.role::text, 'user') as role,
    p.username
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  ORDER BY p.created_at DESC;
END;
$$;