-- Check if tables exist
DO $$ 
DECLARE
    table_missing boolean;
BEGIN
    SELECT NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings'
    ) INTO table_missing;
    
    IF table_missing THEN 
        CREATE TABLE public.bookings (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            guest_id uuid REFERENCES public.guests(id),
            room_id uuid REFERENCES public.rooms(id),
            check_in date NOT NULL,
            check_out date NOT NULL,
            status text NOT NULL DEFAULT 'pending',
            total_amount numeric(10,2) NOT NULL DEFAULT 0,
            payment_status text NOT NULL DEFAULT 'pending',
            booking_source text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
        );
        RAISE NOTICE 'Created bookings table';
    END IF;

    SELECT NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'rooms'
    ) INTO table_missing;
    
    IF table_missing THEN 
        CREATE TABLE public.rooms (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            room_number text NOT NULL UNIQUE,
            type text NOT NULL,
            status text NOT NULL DEFAULT 'available',
            price_per_night numeric(10,2) NOT NULL,
            capacity integer NOT NULL DEFAULT 1,
            amenities text[] DEFAULT '{}'::text[],
            description text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
            updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
        );
        RAISE NOTICE 'Created rooms table';
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add booking_source to bookings if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'booking_source'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN booking_source text;
        RAISE NOTICE 'Added booking_source column to bookings table';
    END IF;

    -- Add status to bookings if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN status text NOT NULL DEFAULT 'pending';
        RAISE NOTICE 'Added status column to bookings table';
    END IF;

    -- Add total_amount to bookings if it doesn't exist
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings' 
        AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.bookings ADD COLUMN total_amount numeric(10,2) NOT NULL DEFAULT 0;
        RAISE NOTICE 'Added total_amount column to bookings table';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create policies for bookings
CREATE POLICY "Enable read access for authenticated users" ON public.bookings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.bookings
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.bookings
    FOR UPDATE TO authenticated USING (true);

-- Create policies for rooms
CREATE POLICY "Enable read access for authenticated users" ON public.rooms
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.rooms
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.rooms
    FOR UPDATE TO authenticated USING (true); 