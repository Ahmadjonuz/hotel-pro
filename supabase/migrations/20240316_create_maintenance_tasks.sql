-- Create maintenance_tasks table
CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    notes TEXT,
    room_id UUID REFERENCES rooms(id),
    equipment_id UUID REFERENCES equipment(id),
    estimated_time INTEGER, -- in minutes
    actual_time INTEGER, -- in minutes
    cost DECIMAL(10,2),
    attachments TEXT[],
    tags TEXT[]
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS maintenance_tasks_status_idx ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS maintenance_tasks_priority_idx ON maintenance_tasks(priority);
CREATE INDEX IF NOT EXISTS maintenance_tasks_assigned_to_idx ON maintenance_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS maintenance_tasks_due_date_idx ON maintenance_tasks(due_date);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_maintenance_tasks_updated_at
    BEFORE UPDATE ON maintenance_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all maintenance tasks"
    ON maintenance_tasks FOR SELECT
    USING (true);

CREATE POLICY "Users can create maintenance tasks"
    ON maintenance_tasks FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own maintenance tasks"
    ON maintenance_tasks FOR UPDATE
    USING (auth.uid() = created_by OR auth.uid() = assigned_to);

CREATE POLICY "Users can delete their own maintenance tasks"
    ON maintenance_tasks FOR DELETE
    USING (auth.uid() = created_by);

-- Create maintenance_task_history table
CREATE TABLE IF NOT EXISTS maintenance_task_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES maintenance_tasks(id),
    status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- Create index for task history
CREATE INDEX IF NOT EXISTS maintenance_task_history_task_id_idx ON maintenance_task_history(task_id);

-- Enable RLS for history table
ALTER TABLE maintenance_task_history ENABLE ROW LEVEL SECURITY;

-- Create policies for history table
CREATE POLICY "Users can view all maintenance task history"
    ON maintenance_task_history FOR SELECT
    USING (true);

CREATE POLICY "Users can create maintenance task history"
    ON maintenance_task_history FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL); 