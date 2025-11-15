-- Remove duplicate RLS policy on user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;