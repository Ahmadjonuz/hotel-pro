-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_revenue_stats(text);
DROP FUNCTION IF EXISTS get_occupancy_stats();
DROP FUNCTION IF EXISTS get_booking_sources();

-- Revenue statistics function
CREATE OR REPLACE FUNCTION get_revenue_stats(timeframe_param text)
RETURNS json AS $$
BEGIN
    RETURN json_build_object(
        'total_revenue', (
            SELECT COALESCE(SUM(total_amount), 0)
            FROM bookings
            WHERE status != 'cancelled'
        ),
        'daily_revenue', (
            SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
            FROM (
                SELECT 
                    to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
                    COALESCE(SUM(total_amount), 0) as amount
                FROM bookings
                WHERE status != 'cancelled'
                AND created_at >= CURRENT_DATE - interval '30 days'
                GROUP BY date_trunc('day', created_at)
                ORDER BY date_trunc('day', created_at) DESC
                LIMIT 30
            ) t
        ),
        'monthly_revenue', (
            SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
            FROM (
                SELECT 
                    to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
                    COALESCE(SUM(total_amount), 0) as amount
                FROM bookings
                WHERE status != 'cancelled'
                AND created_at >= CURRENT_DATE - interval '12 months'
                GROUP BY date_trunc('month', created_at)
                ORDER BY date_trunc('month', created_at) DESC
                LIMIT 12
            ) t
        ),
        'yearly_revenue', (
            SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
            FROM (
                SELECT 
                    to_char(date_trunc('year', created_at), 'YYYY') as year,
                    COALESCE(SUM(total_amount), 0) as amount
                FROM bookings
                WHERE status != 'cancelled'
                GROUP BY date_trunc('year', created_at)
                ORDER BY date_trunc('year', created_at) DESC
                LIMIT 5
            ) t
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Occupancy statistics function
CREATE OR REPLACE FUNCTION get_occupancy_stats()
RETURNS json AS $$
DECLARE
    v_total_rooms integer;
    v_occupied_rooms integer;
BEGIN
    -- Get total rooms
    SELECT COUNT(*) INTO v_total_rooms FROM rooms;
    
    -- Get occupied rooms
    SELECT COUNT(DISTINCT room_id) INTO v_occupied_rooms
    FROM bookings
    WHERE status = 'active'
    AND check_in <= CURRENT_DATE
    AND check_out > CURRENT_DATE;

    RETURN json_build_object(
        'total_rooms', v_total_rooms,
        'occupied_rooms', v_occupied_rooms,
        'available_rooms', v_total_rooms - v_occupied_rooms,
        'occupancy_rate', 
            CASE 
                WHEN v_total_rooms > 0 THEN 
                    ROUND((v_occupied_rooms::float / v_total_rooms * 100)::numeric, 2)
                ELSE 0
            END,
        'daily_occupancy', (
            SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
            FROM (
                SELECT 
                    to_char(d.date, 'YYYY-MM-DD') as date,
                    COALESCE(ROUND((COUNT(DISTINCT b.room_id)::float / v_total_rooms * 100)::numeric, 2), 0) as rate
                FROM generate_series(
                    CURRENT_DATE - interval '30 days',
                    CURRENT_DATE,
                    interval '1 day'
                ) d(date)
                LEFT JOIN bookings b ON 
                    d.date >= b.check_in 
                    AND d.date < b.check_out
                    AND b.status = 'active'
                GROUP BY d.date
                ORDER BY d.date DESC
            ) t
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Booking sources function
CREATE OR REPLACE FUNCTION get_booking_sources()
RETURNS json AS $$
DECLARE
    v_total_bookings integer;
BEGIN
    SELECT COUNT(*) INTO v_total_bookings FROM bookings WHERE status != 'cancelled';

    RETURN (
        SELECT COALESCE(json_agg(row_to_json(t)), '[{"source": "No bookings", "count": 0, "percentage": 0}]'::json)
        FROM (
            SELECT 
                COALESCE(booking_source, 'Other') as source,
                COUNT(*) as count,
                CASE 
                    WHEN v_total_bookings > 0 THEN 
                        ROUND((COUNT(*)::float / v_total_bookings * 100)::numeric, 2)
                    ELSE 0
                END as percentage
            FROM bookings
            WHERE status != 'cancelled'
            GROUP BY booking_source
            ORDER BY count DESC
        ) t
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_revenue_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupancy_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_sources() TO authenticated; 