import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rbcnywfmmpeavdmfcrdm.supabase.co'
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiY255d2ZtbXBlYXZkbWZjcmRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzg0Nzg5NCwiZXhwIjoyMDU5NDIzODk0fQ.yHEZs0Ck4Bkf5RZQanTE3KqRZcliljDDkEeFbm2gaH0'

// Create a Supabase client with the service role key
const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function createAdminUser() {
  const email = 'admin@hotel.com'
  const password = 'admin2125'
  
  try {
    // Create the user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error('Error creating user:', authError.message)
      return
    }

    if (!authData.user) {
      console.error('No user was created')
      return
    }

    // Insert into user_profiles with admin role
    const { error: profileError } = await adminSupabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin',
        full_name: 'Admin User',
        phone: '+1234567890'
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError.message)
      return
    }

    console.log('Admin user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createAdminUser() 