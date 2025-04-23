-- Add booking_source column to bookings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'booking_source'
    ) THEN
        ALTER TABLE bookings ADD COLUMN booking_source TEXT DEFAULT 'website';
        UPDATE bookings SET booking_source = 'website' WHERE booking_source IS NULL;
        RAISE NOTICE 'Added booking_source column to bookings table';
    END IF;
END $$; 