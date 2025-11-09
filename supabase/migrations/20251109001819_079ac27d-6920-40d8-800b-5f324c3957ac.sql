-- Add INSERT policy to profiles table for defensive security
-- This allows manual profile creation if trigger fails or for admin recovery

-- Policy for users to insert their own profile (defensive measure)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy for admins to insert any profile (support operations)
CREATE POLICY "Admins can insert any profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));