-- Drop existing tables and functions if they exist
DROP FUNCTION IF EXISTS get_staff_tasks;
DROP TABLE IF EXISTS housekeeping_task_history;
DROP TABLE IF EXISTS housekeeping_tasks;
DROP TYPE IF EXISTS task_type;
DROP TYPE IF EXISTS room_status;

-- Create custom types
CREATE TYPE task_type AS ENUM (
    'room_cleaning',
    'deep_cleaning',
    'turndown_service',
    'linen_change',
    'restocking',
    'maintenance_report',
    'inspection',
    'special_request'
);

CREATE TYPE room_status AS ENUM (
    'clean',
    'dirty',
    'cleaning_in_progress',
    'out_of_order',
    'inspection_needed',
    'do_not_disturb'
);

-- Create housekeeping_tasks table
CREATE TABLE housekeeping_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_number TEXT NOT NULL,
    task_type task_type NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES housekeeping_staff(id),
    description TEXT,
    notes TEXT,
    estimated_duration INTEGER, -- in minutes
    actual_duration INTEGER, -- in minutes
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create task history table
CREATE TABLE housekeeping_task_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES housekeeping_tasks(id),
    previous_status TEXT,
    new_status TEXT,
    previous_assigned_to UUID REFERENCES housekeeping_staff(id),
    new_assigned_to UUID REFERENCES housekeeping_staff(id),
    changed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX housekeeping_tasks_room_number_idx ON housekeeping_tasks(room_number);
CREATE INDEX housekeeping_tasks_status_idx ON housekeeping_tasks(status);
CREATE INDEX housekeeping_tasks_assigned_to_idx ON housekeeping_tasks(assigned_to);
CREATE INDEX housekeeping_tasks_task_type_idx ON housekeeping_tasks(task_type);
CREATE INDEX housekeeping_task_history_task_id_idx ON housekeeping_task_history(task_id);

-- Enable RLS
ALTER TABLE housekeeping_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE housekeeping_task_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    -- Tasks policies
    DROP POLICY IF EXISTS "Users can view housekeeping tasks" ON housekeeping_tasks;
    DROP POLICY IF EXISTS "Authenticated users can insert housekeeping tasks" ON housekeeping_tasks;
    DROP POLICY IF EXISTS "Authenticated users can update housekeeping tasks" ON housekeeping_tasks;
    DROP POLICY IF EXISTS "Authenticated users can delete housekeeping tasks" ON housekeeping_tasks;
    
    CREATE POLICY "Users can view housekeeping tasks"
        ON housekeeping_tasks FOR SELECT
        USING (true);

    CREATE POLICY "Authenticated users can insert housekeeping tasks"
        ON housekeeping_tasks FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Authenticated users can update housekeeping tasks"
        ON housekeeping_tasks FOR UPDATE
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Authenticated users can delete housekeeping tasks"
        ON housekeeping_tasks FOR DELETE
        USING (auth.role() = 'authenticated');

    -- History policies
    DROP POLICY IF EXISTS "Users can view task history" ON housekeeping_task_history;
    DROP POLICY IF EXISTS "System can insert task history" ON housekeeping_task_history;
    
    CREATE POLICY "Users can view task history"
        ON housekeeping_task_history FOR SELECT
        USING (true);

    CREATE POLICY "System can insert task history"
        ON housekeeping_task_history FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');
END$$;

-- Create updated_at trigger for tasks
DROP TRIGGER IF EXISTS set_updated_at ON housekeeping_tasks;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON housekeeping_tasks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Create task history trigger
CREATE OR REPLACE FUNCTION log_task_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status != NEW.status) OR (OLD.assigned_to IS DISTINCT FROM NEW.assigned_to) THEN
        INSERT INTO housekeeping_task_history (
            task_id,
            previous_status,
            new_status,
            previous_assigned_to,
            new_assigned_to,
            changed_by,
            notes
        ) VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            OLD.assigned_to,
            NEW.assigned_to,
            auth.uid(),
            CASE 
                WHEN OLD.status != NEW.status AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to 
                THEN format('Status changed from %s to %s and reassigned', OLD.status, NEW.status)
                WHEN OLD.status != NEW.status 
                THEN format('Status changed from %s to %s', OLD.status, NEW.status)
                ELSE format('Task reassigned')
            END
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS task_history_trigger ON housekeeping_tasks;
CREATE TRIGGER task_history_trigger
    AFTER UPDATE ON housekeeping_tasks
    FOR EACH ROW
    EXECUTE FUNCTION log_task_changes();

-- Function to get tasks for a staff member
CREATE OR REPLACE FUNCTION get_staff_tasks(staff_id UUID)
RETURNS TABLE (
    id UUID,
    room_number TEXT,
    task_type task_type,
    status TEXT,
    priority TEXT,
    description TEXT,
    notes TEXT,
    estimated_duration INTEGER,
    actual_duration INTEGER,
    scheduled_start TIMESTAMPTZ,
    scheduled_end TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.room_number,
        t.task_type,
        t.status,
        t.priority,
        t.description,
        t.notes,
        t.estimated_duration,
        t.actual_duration,
        t.scheduled_start,
        t.scheduled_end,
        t.started_at,
        t.completed_at,
        t.created_at,
        t.updated_at
    FROM housekeeping_tasks t
    WHERE t.assigned_to = staff_id
    ORDER BY 
        CASE t.priority
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        t.scheduled_start NULLS LAST,
        t.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_staff_tasks TO authenticated; 