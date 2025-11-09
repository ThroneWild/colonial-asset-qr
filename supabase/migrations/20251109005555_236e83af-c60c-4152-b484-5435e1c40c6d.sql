-- Add deletion_reason column to asset_history table
ALTER TABLE public.asset_history 
ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Add comment to explain the field
COMMENT ON COLUMN public.asset_history.deletion_reason IS 'Reason provided when an asset is deleted';