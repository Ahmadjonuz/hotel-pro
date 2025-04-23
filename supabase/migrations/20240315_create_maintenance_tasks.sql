-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  room_id UUID REFERENCES rooms(id),
  assigned_to UUID REFERENCES user_profiles(id),
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

CREATE TRIGGER update_maintenance_tasks_updated_at
    BEFORE UPDATE ON maintenance_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Allow authenticated users to create maintenance tasks" ON maintenance_tasks;
DROP POLICY IF EXISTS "Allow authenticated users to update their assigned tasks" ON maintenance_tasks;

-- Create new policies
CREATE POLICY "Allow authenticated users to read maintenance tasks"
ON maintenance_tasks FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to create maintenance tasks"
ON maintenance_tasks FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update maintenance tasks"
ON maintenance_tasks FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete maintenance tasks"
ON maintenance_tasks FOR DELETE
TO authenticated
USING (true); 