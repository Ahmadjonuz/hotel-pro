-- Ensure document fields exist on guests table
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS document_number TEXT;

-- Refresh Supabase's schema cache
NOTIFY pgrst, 'reload schema'; 