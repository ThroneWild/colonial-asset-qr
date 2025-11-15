-- Fix 1: Remove recursive RLS policy and replace with has_role function
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Create table to track failed login attempts for rate limiting
CREATE TABLE IF NOT EXISTS public.failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  last_attempt timestamp with time zone NOT NULL DEFAULT now(),
  locked_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_failed_login_username ON public.failed_login_attempts(username);

-- Enable RLS
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only the system/edge functions should access this table
CREATE POLICY "Service role can manage login attempts" ON public.failed_login_attempts
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create function to update updated_at
CREATE TRIGGER update_failed_login_attempts_updated_at
BEFORE UPDATE ON public.failed_login_attempts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();