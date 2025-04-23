-- Drop existing functions
DROP FUNCTION IF EXISTS get_revenue_stats(text);
DROP FUNCTION IF EXISTS get_occupancy_stats();
DROP FUNCTION IF EXISTS get_booking_sources();

-- Revenue statistics function
CREATE OR REPLACE FUNCTION get_revenue_stats(timeframe_param text)
RETURNS jsonb AS $$
DECLARE
    v_start_date timestamp;
    v_result jsonb;
BEGIN
    -- Set start date based on timeframe
    CASE timeframe_param
        WHEN 'daily' THEN
            v_start_date := CURRENT_DATE - interval '30 days';
        WHEN 'monthly' THEN
            v_start_date := CURRENT_DATE - interval '12 months';
        WHEN 'yearly' THEN
            v_start_date := CURRENT_DATE - interval '5 years';
        ELSE
            v_start_date := CURRENT_DATE - interval '30 days';
    END CASE;

    WITH revenue_data AS (
        SELECT
            COALESCE(SUM(total_amount), 0) as total_revenue,
            (
                SELECT jsonb_agg(row_to_json(d)::jsonb)
                FROM (
                    SELECT 
                        to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as date,
                        COALESCE(SUM(total_amount), 0) as amount
                    FROM bookings b2
                    WHERE status != 'cancelled'
                    AND created_at >= v_start_date
                    GROUP BY date_trunc('day', created_at)
                    ORDER BY date_trunc('day', created_at) DESC
                    LIMIT 30
                ) d
            ) as daily_revenue,
            (
                SELECT jsonb_agg(row_to_json(m)::jsonb)
                FROM (
                    SELECT 
                        to_char(date_trunc('month', created_at), 'YYYY-MM') as month,
                        COALESCE(SUM(total_amount), 0) as amount
                    FROM bookings b3
                    WHERE status != 'cancelled'
                    AND created_at >= v_start_date
                    GROUP BY date_trunc('month', created_at)
                    ORDER BY date_trunc('month', created_at) DESC
                    LIMIT 12
                ) m
            ) as monthly_revenue,
            (
                SELECT jsonb_agg(row_to_json(y)::jsonb)
                FROM (
                    SELECT 
                        to_char(date_trunc('year', created_at), 'YYYY') as year,
                        COALESCE(SUM(total_amount), 0) as amount
                    FROM bookings b4
                    WHERE status != 'cancelled'
                    AND created_at >= v_start_date
                    GROUP BY date_trunc('year', created_at)
                    ORDER BY date_trunc('year', created_at) DESC
                    LIMIT 5
                ) y
            ) as yearly_revenue
        FROM bookings b1
        WHERE status != 'cancelled'
        AND created_at >= v_start_date
    )
    SELECT jsonb_build_object(
        'total_revenue', total_revenue,
        'daily_revenue', COALESCE(daily_revenue, '[]'::jsonb),
        'monthly_revenue', COALESCE(monthly_revenue, '[]'::jsonb),
        'yearly_revenue', COALESCE(yearly_revenue, '[]'::jsonb)
    ) INTO v_result
    FROM revenue_data;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Occupancy statistics function
CREATE OR REPLACE FUNCTION get_occupancy_stats()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
BEGIN
    WITH occupancy_data AS (
        SELECT
            COUNT(*) as total_rooms,
            (
                SELECT COUNT(DISTINCT room_id)
                FROM bookings
                WHERE status = 'active'
                AND check_in <= CURRENT_DATE
                AND check_out > CURRENT_DATE
            ) as occupied_rooms,
            (
                SELECT jsonb_agg(row_to_json(d)::jsonb)
                FROM (
                    SELECT 
                        to_char(d.date, 'YYYY-MM-DD') as date,
                        COALESCE(
                            ROUND(
                                (COUNT(DISTINCT b.room_id)::float / COUNT(*) OVER () * 100)::numeric,
                                2
                            ),
                            0
                        ) as rate
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
                ) d
            ) as daily_occupancy
        FROM rooms
    )
    SELECT jsonb_build_object(
        'total_rooms', total_rooms,
        'occupied_rooms', occupied_rooms,
        'available_rooms', total_rooms - occupied_rooms,
        'occupancy_rate', 
            CASE 
                WHEN total_rooms > 0 THEN 
                    ROUND((occupied_rooms::float / total_rooms * 100)::numeric, 2)
                ELSE 0
            END,
        'daily_occupancy', COALESCE(daily_occupancy, '[]'::jsonb)
    ) INTO v_result
    FROM occupancy_data;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Booking sources function
CREATE OR REPLACE FUNCTION get_booking_sources()
RETURNS jsonb AS $$
DECLARE
    v_result jsonb;
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

    IF v_has_booking_source THEN
        WITH booking_stats AS (
            SELECT
                COUNT(*) as total_bookings,
                (
                    SELECT jsonb_agg(row_to_json(s)::jsonb)
                    FROM (
                        SELECT 
                            COALESCE(booking_source, 'Other') as source,
                            COUNT(*) as count,
                            ROUND((COUNT(*)::float / SUM(COUNT(*)) OVER () * 100)::numeric, 2) as percentage
                        FROM bookings
                        WHERE status != 'cancelled'
                        GROUP BY booking_source
                        ORDER BY count DESC
                    ) s
                ) as sources
            FROM bookings
            WHERE status != 'cancelled'
        )
        SELECT jsonb_build_object(
            'sources', COALESCE(sources, '[]'::jsonb)
        ) INTO v_result
        FROM booking_stats;
    ELSE
        WITH booking_stats AS (
            SELECT COUNT(*) as total_bookings
            FROM bookings
            WHERE status != 'cancelled'
        )
        SELECT jsonb_build_object(
            'sources', jsonb_build_array(
                jsonb_build_object(
                    'source', 'Website',
                    'count', total_bookings,
                    'percentage', 100
                )
            )
        ) INTO v_result
        FROM booking_stats;
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_revenue_stats(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupancy_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_booking_sources() TO authenticated; 