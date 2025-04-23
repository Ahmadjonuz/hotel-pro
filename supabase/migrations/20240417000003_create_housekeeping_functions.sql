-- Function to get staff with task counts
CREATE OR REPLACE FUNCTION get_housekeeping_staff()
RETURNS TABLE (
    id UUID,
    name TEXT,
    job_position TEXT,
    status TEXT,
    phone TEXT,
    email TEXT,
    shift_start TIME,
    shift_end TIME,
    days_off TEXT[],
    specialization TEXT[],
    max_daily_tasks INTEGER,
    performance_rating DECIMAL(3,2),
    assigned_tasks BIGINT,
    completed_tasks BIGINT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.*,
        COUNT(DISTINCT CASE WHEN t.status IN ('pending', 'in_progress') THEN t.id END) as assigned_tasks,
        COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
    FROM housekeeping_staff s
    LEFT JOIN housekeeping_tasks t ON t.assigned_to = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_housekeeping_staff TO authenticated; 