-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking', 'reminder', 'maintenance', 'payment', 'housekeeping', 'system')),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read BOOLEAN NOT NULL DEFAULT false,
    data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at DESC);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Function to get notifications with filtering
CREATE OR REPLACE FUNCTION get_notifications(
    p_type text DEFAULT NULL,
    p_read boolean DEFAULT NULL,
    p_from_date timestamptz DEFAULT NULL,
    p_to_date timestamptz DEFAULT NULL,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE (
    id uuid,
    title text,
    message text,
    type text,
    user_id uuid,
    read boolean,
    data jsonb,
    created_at timestamptz,
    read_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT n.*
    FROM notifications n
    WHERE (p_type IS NULL OR n.type = p_type)
    AND (p_read IS NULL OR n.read = p_read)
    AND (p_from_date IS NULL OR n.created_at >= p_from_date)
    AND (p_to_date IS NULL OR n.created_at <= p_to_date)
    AND n.user_id = auth.uid()
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notification stats
CREATE OR REPLACE FUNCTION get_notification_stats()
RETURNS jsonb AS $$
DECLARE
    v_total integer;
    v_unread integer;
    v_by_type jsonb;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO v_total
    FROM notifications
    WHERE user_id = auth.uid();

    -- Get unread count
    SELECT COUNT(*) INTO v_unread
    FROM notifications
    WHERE user_id = auth.uid()
    AND read = false;

    -- Get counts by type
    SELECT jsonb_object_agg(type, count)
    INTO v_by_type
    FROM (
        SELECT type, COUNT(*) as count
        FROM notifications
        WHERE user_id = auth.uid()
        GROUP BY type
    ) t;

    RETURN jsonb_build_object(
        'total', v_total,
        'unread', v_unread,
        'by_type', COALESCE(v_by_type, '{}'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_as_read(p_notification_ids uuid[] DEFAULT NULL)
RETURNS void AS $$
BEGIN
    UPDATE notifications
    SET read = true,
        read_at = NOW()
    WHERE user_id = auth.uid()
    AND (p_notification_ids IS NULL OR id = ANY(p_notification_ids));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_notification_stats TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notifications_as_read TO authenticated; 