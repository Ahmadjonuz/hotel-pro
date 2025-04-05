import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Simplified seed data
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
]

export async function POST() {
  try {
    // Insert rooms
    const { error: roomsError } = await supabase.from("rooms").upsert(rooms)

    if (roomsError) {
      throw roomsError
    }

    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error: any) {
    console.error("Error seeding data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}

