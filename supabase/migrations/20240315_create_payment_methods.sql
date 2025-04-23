-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL,
  last_four TEXT NOT NULL,
  expiry_month INTEGER NOT NULL,
  expiry_year INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read their payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Allow authenticated users to create payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Allow authenticated users to update their payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Allow authenticated users to delete their payment methods" ON payment_methods;

-- Create new policies
CREATE POLICY "Allow authenticated users to read their payment methods"
ON payment_methods FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to create payment methods"
ON payment_methods FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their payment methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their payment methods"
ON payment_methods FOR DELETE
TO authenticated
USING (auth.uid() = user_id); 