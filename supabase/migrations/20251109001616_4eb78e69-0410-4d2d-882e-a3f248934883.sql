-- Fix Security Definer View issue by recreating assets_public with SECURITY INVOKER
-- This ensures the view uses the querying user's permissions, not the creator's

DROP VIEW IF EXISTS public.assets_public;

CREATE OR REPLACE VIEW public.assets_public
WITH (security_invoker = true) AS
SELECT 
  id,
  item_number,
  description,
  sector,
  asset_group,
  conservation_state,
  brand_model,
  evaluation_value,
  qr_code_url,
  created_at,
  updated_at
FROM public.assets;

-- Grant SELECT permissions
GRANT SELECT ON public.assets_public TO anon;
GRANT SELECT ON public.assets_public TO authenticated;

COMMENT ON VIEW public.assets_public IS 'Public view of assets for QR code scanning. Uses security_invoker to enforce RLS policies from the underlying assets table.';