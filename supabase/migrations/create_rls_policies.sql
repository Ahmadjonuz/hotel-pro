-- Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for service role to bypass RLS
CREATE POLICY "Allow service role full access"
ON user_profiles
TO service_role
USING (true)
WITH CHECK (true);

-- Policy for inserting new users (admin only)
CREATE POLICY "Allow admins to create users"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy for viewing users (all authenticated users)
CREATE POLICY "Allow authenticated users to view all users"
ON user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Policy for updating users (admin only)
CREATE POLICY "Allow admins to update users"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy for deleting users (admin only)
CREATE POLICY "Allow admins to delete users"
ON user_profiles
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
); 