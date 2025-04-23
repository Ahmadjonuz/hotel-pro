-- Add document_type and document_number columns to guests table
ALTER TABLE guests
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS document_number TEXT; 