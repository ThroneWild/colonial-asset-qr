-- Update public view to include brand_model and evaluation_value for display
DROP VIEW IF EXISTS public.assets_public;

CREATE OR REPLACE VIEW public.assets_public AS
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

-- Make the view publicly readable
GRANT SELECT ON public.assets_public TO anon;
GRANT SELECT ON public.assets_public TO authenticated;