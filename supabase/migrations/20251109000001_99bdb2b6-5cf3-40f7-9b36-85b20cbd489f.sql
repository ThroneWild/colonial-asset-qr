-- Add invoice_url field to assets table
ALTER TABLE public.assets 
ADD COLUMN invoice_url TEXT;

-- Create storage bucket for invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false);

-- Storage policies for invoices
CREATE POLICY "Authenticated users can view invoices"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'invoices');

CREATE POLICY "Authenticated users can upload invoices"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'invoices');

CREATE POLICY "Authenticated users can update their invoices"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'invoices');

CREATE POLICY "Admins can delete invoices"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'invoices' AND
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);