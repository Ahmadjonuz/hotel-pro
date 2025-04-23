-- Drop existing function
DROP FUNCTION IF EXISTS get_booking_sources();

-- Create new function
CREATE OR REPLACE FUNCTION get_booking_sources()
RETURNS jsonb AS $$
DECLARE
    v_total_bookings integer;
    v_has_booking_source boolean;
BEGIN
    -- Check if booking_source column exists
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'booking_source'
    ) INTO v_has_booking_source;

    -- Get total bookings
    SELECT COUNT(*) INTO v_total_bookings 
    FROM bookings 
    WHERE status != 'cancelled';

    IF v_has_booking_source THEN
        RETURN (
            SELECT jsonb_build_object(
                'data',
                COALESCE(
                    jsonb_agg(
                        jsonb_build_object(
                            'source', COALESCE(booking_source, 'Other'),
                            'count', COUNT(*),
                            'percentage', 
                            CASE 
                                WHEN v_total_bookings > 0 THEN 
                                    ROUND((COUNT(*)::float / v_total_bookings * 100)::numeric, 2)
                                ELSE 0
                            END
                        )
                    ),
                    '[]'::jsonb
                )
            )
            FROM bookings
            WHERE status != 'cancelled'
            GROUP BY booking_source
            ORDER BY COUNT(*) DESC
        );
    ELSE
        RETURN jsonb_build_object(
            'data',
            jsonb_build_array(
                jsonb_build_object(
                    'source', 'Website',
                    'count', v_total_bookings,
                    'percentage', 100
                )
            )
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_booking_sources() TO authenticated; 