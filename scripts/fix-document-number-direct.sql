-- Fix document_number column issue 
-- Run this in the Supabase SQL Editor

-- 1. Ensure the column exists
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS document_number TEXT;

-- 2. Force a schema cache refresh
SELECT pg_notify('pgrst', 'reload schema'); 