-- Create a function to execute SQL statements
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void AS $$
BEGIN
  EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create role enum type
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'receptionist');

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role user_role NOT NULL DEFAULT 'receptionist',
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, resource, action)
);

-- Insert default permissions
INSERT INTO role_permissions (role, resource, action) VALUES
    -- Admin permissions (full access)
    ('admin', 'all', 'all'),
    
    -- Manager permissions
    ('manager', 'rooms', 'read'),
    ('manager', 'rooms', 'write'),
    ('manager', 'bookings', 'read'),
    ('manager', 'bookings', 'write'),
    ('manager', 'guests', 'read'),
    ('manager', 'guests', 'write'),
    ('manager', 'housekeeping', 'read'),
    ('manager', 'housekeeping', 'write'),
    ('manager', 'maintenance', 'read'),
    ('manager', 'maintenance', 'write'),
    ('manager', 'reports', 'read'),
    
    -- Receptionist permissions
    ('receptionist', 'rooms', 'read'),
    ('receptionist', 'bookings', 'read'),
    ('receptionist', 'bookings', 'write'),
    ('receptionist', 'guests', 'read'),
    ('receptionist', 'guests', 'write'),
    ('receptionist', 'housekeeping', 'read');

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON user_profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ));

CREATE POLICY "Admins can update all profiles"
    ON user_profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ));

-- Role permissions policies
CREATE POLICY "Anyone can view role permissions"
    ON role_permissions FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify role permissions"
    ON role_permissions FOR ALL
    USING (EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    ));

-- Create function to check if user has permission
CREATE OR REPLACE FUNCTION check_user_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role user_role;
BEGIN
    -- Get the user's role
    SELECT role INTO user_role
    FROM user_profiles
    WHERE id = auth.uid();

    -- Check if user has permission
    RETURN EXISTS (
        SELECT 1 FROM role_permissions
        WHERE role_permissions.role = user_role
        AND (role_permissions.resource = resource OR role_permissions.resource = 'all')
        AND (role_permissions.action = action OR role_permissions.action = 'all')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- First, create the auth user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@hotel.com',
  crypt('admin2125', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Then, create the admin profile
INSERT INTO user_profiles (id, role, full_name, phone)
SELECT 
    id,
    'admin',
    'System Admin',
    '+998900000000'
FROM auth.users
WHERE email = 'admin@hotel.com';

-- Update the admin user's password to 'admin2125'
UPDATE auth.users 
SET encrypted_password = crypt('admin2125', gen_salt('bf'))
WHERE email = 'admin@hotel.com'; 

SELECT * FROM auth.users WHERE email = 'admin@hotel.com'; 

SELECT * FROM user_profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'admin@hotel.com'
); 