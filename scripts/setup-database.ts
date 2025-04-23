require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const { readFileSync } = require('fs')
const { join } = require('path')

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  console.log('Using Supabase URL:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'public' }
  })

  try {
    console.log('Starting database setup...')

    // Read and execute schema
    console.log('Applying schema...')
    const schemaSQL = readFileSync(join(process.cwd(), 'scripts', 'schema.sql'), 'utf8')
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql_query: schemaSQL })
    if (schemaError) {
      console.error('Error applying schema:', schemaError)
      throw schemaError
    }
    console.log('Schema applied successfully')

    // Create seed data
    console.log('Seeding database...')
    const seedData = [
      // Rooms
      "INSERT INTO rooms (room_number, type, status, price_per_night, capacity, amenities, description) VALUES",
      "('101', 'Standard', 'available', 100.00, 2, ARRAY['TV', 'WiFi', 'AC'], 'Comfortable standard room'),",
      "('102', 'Deluxe', 'available', 150.00, 3, ARRAY['TV', 'WiFi', 'AC', 'Mini Bar'], 'Spacious deluxe room'),",
      "('201', 'Suite', 'available', 250.00, 4, ARRAY['TV', 'WiFi', 'AC', 'Mini Bar', 'Jacuzzi'], 'Luxury suite');",
      
      // Guests
      "INSERT INTO guests (first_name, last_name, email, phone, address, is_vip, loyalty_points) VALUES",
      "('John', 'Doe', 'john@example.com', '+1234567890', '123 Main St', false, 0),",
      "('Jane', 'Smith', 'jane@example.com', '+0987654321', '456 Oak Ave', true, 100);",
      
      // Bookings
      "WITH",
      "  john_guest AS (SELECT id FROM guests WHERE email = 'john@example.com'),",
      "  jane_guest AS (SELECT id FROM guests WHERE email = 'jane@example.com'),",
      "  room_101 AS (SELECT id FROM rooms WHERE room_number = '101'),",
      "  room_102 AS (SELECT id FROM rooms WHERE room_number = '102')",
      "INSERT INTO bookings (guest_id, room_id, check_in, check_out, status, total_amount, payment_status) VALUES",
      "((SELECT id FROM john_guest), (SELECT id FROM room_101), CURRENT_DATE, CURRENT_DATE + interval '3 days', 'confirmed', 300.00, 'paid'),",
      "((SELECT id FROM jane_guest), (SELECT id FROM room_102), CURRENT_DATE + interval '5 days', CURRENT_DATE + interval '7 days', 'confirmed', 300.00, 'pending');"
    ].join('\n')

    const { error: seedError } = await supabase.rpc('exec_sql', { sql_query: seedData })
    if (seedError) {
      console.error('Error seeding database:', seedError)
      throw seedError
    }
    console.log('Database seeded successfully')

    console.log('Database setup completed successfully!')
  } catch (error) {
    console.error('Error setting up database:', error)
    process.exit(1)
  }
}

setupDatabase() 