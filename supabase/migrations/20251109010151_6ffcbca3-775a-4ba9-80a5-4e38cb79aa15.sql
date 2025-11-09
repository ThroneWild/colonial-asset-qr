-- Add foreign key between asset_history and profiles
ALTER TABLE public.asset_history 
ADD CONSTRAINT asset_history_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;