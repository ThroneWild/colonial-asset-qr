-- Create role enum and user_roles table for RBAC
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'viewer');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to automatically assign admin role to first user
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is the first user in the system, make them admin
  IF NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to assign admin role to first user
CREATE TRIGGER on_first_user_assign_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_first_admin();

-- Drop old permissive policies on assets
DROP POLICY IF EXISTS "Public can view assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can delete assets" ON public.assets;
DROP POLICY IF EXISTS "Authenticated users can update assets" ON public.assets;

-- Create secure RLS policies for assets table
-- SELECT: Only authenticated users can view assets
CREATE POLICY "Authenticated users can view all assets"
ON public.assets FOR SELECT
TO authenticated
USING (true);

-- INSERT: Only authenticated users can create assets (existing policy is fine)
-- Already exists: "Authenticated users can insert assets"

-- UPDATE: Only admins and managers can update assets
CREATE POLICY "Admins can update all assets"
ON public.assets FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can update asset details"
ON public.assets FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'manager'))
WITH CHECK (public.has_role(auth.uid(), 'manager'));

-- DELETE: Only admins can delete assets
CREATE POLICY "Only admins can delete assets"
ON public.assets FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create a trigger to enforce modified_by on updates
CREATE OR REPLACE FUNCTION public.set_modified_by()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.modified_by = auth.uid();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_modified_by
  BEFORE UPDATE ON public.assets
  FOR EACH ROW
  EXECUTE FUNCTION public.set_modified_by();

-- Create public view for QR code access (non-sensitive data only)
CREATE OR REPLACE VIEW public.assets_public AS
SELECT 
  id,
  item_number,
  description,
  sector,
  asset_group,
  conservation_state,
  qr_code_url,
  created_at
FROM public.assets;

-- Make the view publicly readable
GRANT SELECT ON public.assets_public TO anon;
GRANT SELECT ON public.assets_public TO authenticated;