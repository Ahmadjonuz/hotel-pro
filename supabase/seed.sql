-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS housekeeping_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    notes TEXT,
    scheduled_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id),
    issue TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    reported_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clear existing data
DELETE FROM maintenance_requests;
DELETE FROM housekeeping_tasks;
DELETE FROM bookings;
DELETE FROM rooms;
DELETE FROM guests;
DELETE FROM room_types;

-- Insert room types
INSERT INTO room_types (id, name, base_price, description) VALUES
    (uuid_generate_v4(), 'Standard', 100.00, 'Comfortable room with basic amenities'),
    (uuid_generate_v4(), 'Deluxe', 150.00, 'Spacious room with premium amenities'),
    (uuid_generate_v4(), 'Suite', 250.00, 'Luxury suite with separate living area'),
    (uuid_generate_v4(), 'Family', 200.00, 'Large room suitable for families');

-- Add floor column to rooms table if it doesn't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor INTEGER;

-- Add room_type_id column to rooms table if it doesn't exist
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_type_id UUID REFERENCES room_types(id);

-- Insert rooms
WITH room_type_ids AS (
    SELECT id, name FROM room_types
)
INSERT INTO rooms (room_number, type, status, price_per_night, capacity, floor, amenities, description, room_type_id)
SELECT
    CONCAT(floor, LPAD(CAST(room_num AS TEXT), 2, '0')),
    rt.name,
    'available',
    CASE 
        WHEN rt.name = 'Standard' THEN 1300000
        WHEN rt.name = 'Deluxe' THEN 1950000
        WHEN rt.name = 'Suite' THEN 3250000
        ELSE 2000000
    END,
    CASE 
        WHEN rt.name = 'Standard' THEN 2
        WHEN rt.name = 'Deluxe' THEN 3
        WHEN rt.name = 'Suite' THEN 4
        ELSE 4
    END,
    floor,
    CASE 
        WHEN rt.name = 'Standard' THEN ARRAY['WiFi', 'TV', 'Air Conditioning']
        WHEN rt.name = 'Deluxe' THEN ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe']
        WHEN rt.name = 'Suite' THEN ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Jacuzzi', 'Kitchen']
        ELSE ARRAY['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Safe', 'Extra Beds']
    END,
    CONCAT(rt.name, ' room with modern amenities'),
    rt.id
FROM 
    generate_series(1, 5) AS floor,
    generate_series(1, 10) AS room_num,
    room_type_ids rt
WHERE 
    CASE 
        WHEN floor = 1 AND rt.name = 'Standard' THEN true
        WHEN floor = 2 AND rt.name = 'Deluxe' THEN true
        WHEN floor = 3 AND rt.name = 'Suite' THEN true
        WHEN floor IN (4,5) AND rt.name = 'Family' THEN true
        ELSE false
    END;

-- Insert sample guests
INSERT INTO guests (first_name, last_name, email, phone, address, is_vip, loyalty_points) VALUES
    ('Aziz', 'Rahimov', 'aziz.rahimov@example.com', '+998901234567', 'Tashkent, Uzbekistan', true, 1000),
    ('Malika', 'Umarova', 'malika.umarova@example.com', '+998902345678', 'Samarkand, Uzbekistan', false, 500),
    ('Jamshid', 'Karimov', 'jamshid.karimov@example.com', '+998903456789', 'Bukhara, Uzbekistan', false, 250);

-- Insert sample bookings
WITH available_rooms AS (
    SELECT id, price_per_night 
    FROM rooms 
    WHERE status = 'available' 
    LIMIT 3
),
guest_bookings AS (
    SELECT 
        g.id as guest_id,
        r.id as room_id,
        r.price_per_night,
        ROW_NUMBER() OVER (ORDER BY g.id) as row_num
    FROM guests g
    CROSS JOIN available_rooms r
)
INSERT INTO bookings (guest_id, room_id, check_in, check_out, status, total_amount, payment_status, special_requests)
SELECT
    guest_id,
    room_id,
    CURRENT_DATE + ((row_num - 1) || ' days')::INTERVAL,
    CURRENT_DATE + ((row_num + 2) || ' days')::INTERVAL,
    'confirmed',
    price_per_night * 3,
    'paid',
    'Extra pillows please.'
FROM guest_bookings;

-- Insert sample housekeeping tasks
INSERT INTO housekeeping_tasks (room_id, status, priority, notes, scheduled_date)
SELECT
    id,
    'pending',
    'medium',
    'Regular cleaning and maintenance check',
    CURRENT_DATE + INTERVAL '1 day'
FROM rooms
WHERE status = 'available'
LIMIT 5;

-- Insert sample maintenance requests
INSERT INTO maintenance_requests (room_id, issue, status, priority, reported_by)
SELECT
    id,
    'Air conditioning maintenance required',
    'pending',
    'medium',
    'System'
FROM rooms
WHERE status = 'available'
LIMIT 3; 