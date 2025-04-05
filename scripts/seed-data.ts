import { supabase } from "@/lib/supabase"

// Sample room data
const rooms = [
  {
    room_number: "101",
    type: "standard",
    status: "available",
    price_per_night: 99.99,
    capacity: 2,
    amenities: ["wifi", "tv", "coffee"],
    description: "Comfortable room with a queen-sized bed and city view.",
  },
  {
    room_number: "102",
    type: "standard",
    status: "occupied",
    price_per_night: 99.99,
    capacity: 2,
    amenities: ["wifi", "tv", "coffee"],
    description: "Comfortable room with a queen-sized bed and garden view.",
  },
  {
    room_number: "201",
    type: "deluxe",
    status: "available",
    price_per_night: 149.99,
    capacity: 3,
    amenities: ["wifi", "tv", "coffee", "minibar"],
    description: "Spacious room with a king-sized bed and premium amenities.",
  },
  {
    room_number: "202",
    type: "deluxe",
    status: "cleaning",
    price_per_night: 149.99,
    capacity: 3,
    amenities: ["wifi", "tv", "coffee", "minibar"],
    description: "Spacious room with a king-sized bed and premium amenities.",
  },
  {
    room_number: "301",
    type: "suite",
    status: "maintenance",
    price_per_night: 249.99,
    capacity: 4,
    amenities: ["wifi", "tv", "coffee", "minibar", "jacuzzi"],
    description: "Luxury suite with separate living area and panoramic views.",
  },
  {
    room_number: "302",
    type: "suite",
    status: "available",
    price_per_night: 249.99,
    capacity: 4,
    amenities: ["wifi", "tv", "coffee", "minibar", "jacuzzi"],
    description: "Luxury suite with separate living area and panoramic views.",
  },
]

// Sample guest data
const guests = [
  {
    first_name: "John",
    last_name: "Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, New York, NY 10001",
    is_vip: true,
    loyalty_points: 1250,
    notes: "Prefers rooms on higher floors with city view. Allergic to feather pillows.",
  },
  {
    first_name: "Sarah",
    last_name: "Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 987-6543",
    address: "456 Park Avenue, Boston, MA 02108",
    is_vip: false,
    loyalty_points: 450,
    notes: "Prefers quiet rooms away from elevator.",
  },
  {
    first_name: "Michael",
    last_name: "Brown",
    email: "michael.b@example.com",
    phone: "+1 (555) 456-7890",
    address: "789 Oak Street, Chicago, IL 60601",
    is_vip: true,
    loyalty_points: 2100,
    notes: "Frequent business traveler. Prefers early check-in when available.",
  },
]

async function seedData() {
  try {
    console.log("Starting data seeding...")

    // Insert rooms
    console.log("Inserting rooms...")
    const { data: roomsData, error: roomsError } = await supabase.from("rooms").insert(rooms).select()

    if (roomsError) {
      throw roomsError
    }

    console.log(`Successfully inserted ${roomsData.length} rooms`)

    // Insert guests
    console.log("Inserting guests...")
    const { data: guestsData, error: guestsError } = await supabase.from("guests").insert(guests).select()

    if (guestsError) {
      throw guestsError
    }

    console.log(`Successfully inserted ${guestsData.length} guests`)

    // Create some bookings
    if (roomsData && guestsData && roomsData.length > 0 && guestsData.length > 0) {
      console.log("Creating bookings...")

      const bookings = [
        {
          guest_id: guestsData[0].id,
          room_id: roomsData[1].id, // Room 102 (occupied)
          check_in: "2023-04-15",
          check_out: "2023-04-18",
          status: "checked-in",
          total_amount: 349.99,
          payment_status: "paid",
          special_requests: "Extra pillows please.",
        },
        {
          guest_id: guestsData[1].id,
          room_id: roomsData[0].id, // Room 101 (will be set to confirmed but not checked in)
          check_in: "2023-04-20",
          check_out: "2023-04-25",
          status: "confirmed",
          total_amount: 599.99,
          payment_status: "pending",
          special_requests: "Late check-in expected.",
        },
      ]

      const { data: bookingsData, error: bookingsError } = await supabase.from("bookings").insert(bookings).select()

      if (bookingsError) {
        throw bookingsError
      }

      console.log(`Successfully inserted ${bookingsData.length} bookings`)

      // Create housekeeping tasks
      console.log("Creating housekeeping tasks...")

      const housekeepingTasks = [
        {
          room_id: roomsData[3].id, // Room 202 (cleaning)
          status: "in-progress",
          priority: "normal",
          assigned_to: "Maria Garcia",
          notes: "Regular cleaning",
        },
        {
          room_id: roomsData[2].id, // Room 201
          status: "pending",
          priority: "high",
          assigned_to: "James Wilson",
          notes: "Deep cleaning required",
        },
      ]

      const { data: tasksData, error: tasksError } = await supabase
        .from("housekeeping_tasks")
        .insert(housekeepingTasks)
        .select()

      if (tasksError) {
        throw tasksError
      }

      console.log(`Successfully inserted ${tasksData.length} housekeeping tasks`)

      // Create maintenance requests
      console.log("Creating maintenance requests...")

      const maintenanceRequests = [
        {
          room_id: roomsData[4].id, // Room 301 (maintenance)
          issue: "Air conditioning not working",
          status: "in-progress",
          priority: "high",
          reported_by: "Front Desk",
          assigned_to: "John Technician",
          notes: "Guest complained about room being too warm",
        },
        {
          room_id: roomsData[5].id, // Room 302
          issue: "Leaking faucet in bathroom",
          status: "pending",
          priority: "medium",
          reported_by: "Housekeeping",
          assigned_to: "Mike Plumber",
          notes: "Minor leak, not urgent",
        },
      ]

      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_requests")
        .insert(maintenanceRequests)
        .select()

      if (maintenanceError) {
        throw maintenanceError
      }

      console.log(`Successfully inserted ${maintenanceData.length} maintenance requests`)
    }

    console.log("Data seeding completed successfully!")
  } catch (error) {
    console.error("Error seeding data:", error)
  }
}

// Uncomment the line below to run the seeding function
// seedData()

export { seedData }

