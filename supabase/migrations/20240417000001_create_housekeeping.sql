-- Drop existing tables and functions if they exist
DROP FUNCTION IF EXISTS get_housekeeping_staff();
DROP TABLE IF EXISTS housekeeping_staff CASCADE;

-- Create housekeeping_staff table
CREATE TABLE housekeeping_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    job_position TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'off', 'on_break')),
    phone TEXT,
    email TEXT,
    shift_start TIME,
    shift_end TIME,
    days_off TEXT[],
    specialization TEXT[],
    max_daily_tasks INTEGER DEFAULT 10,
    performance_rating DECIMAL(3,2) CHECK (performance_rating >= 0 AND performance_rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX housekeeping_staff_status_idx ON housekeeping_staff(status);
CREATE INDEX housekeeping_staff_job_position_idx ON housekeeping_staff(job_position);

-- Enable RLS
ALTER TABLE housekeeping_staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view housekeeping staff" ON housekeeping_staff;
    DROP POLICY IF EXISTS "Authenticated users can insert housekeeping staff" ON housekeeping_staff;
    DROP POLICY IF EXISTS "Authenticated users can update housekeeping staff" ON housekeeping_staff;
    DROP POLICY IF EXISTS "Authenticated users can delete housekeeping staff" ON housekeeping_staff;
    
    CREATE POLICY "Users can view housekeeping staff"
        ON housekeeping_staff FOR SELECT
        USING (true);

    CREATE POLICY "Authenticated users can insert housekeeping staff"
        ON housekeeping_staff FOR INSERT
        WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Authenticated users can update housekeeping staff"
        ON housekeeping_staff FOR UPDATE
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Authenticated users can delete housekeeping staff"
        ON housekeeping_staff FOR DELETE
        USING (auth.role() = 'authenticated');
END$$;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS set_updated_at ON housekeeping_staff;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON housekeeping_staff
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at(); 