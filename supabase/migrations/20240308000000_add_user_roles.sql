-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'receptionist');

-- Create user_profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'receptionist',
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
    ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON user_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, role)
    VALUES (new.id, new.email, 'receptionist');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

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