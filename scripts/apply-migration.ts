import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

async function applyMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  console.log('Using Supabase URL:', supabaseUrl)

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('Starting migration...')

    // Read and execute migration
    console.log('Applying user roles migration...')
    const migrationSQL = readFileSync(join(process.cwd(), 'supabase', 'migrations', '20240308000000_add_user_roles.sql'), 'utf8')
    
    // Split SQL into individual statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim())
    
    for (const statement of statements) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement.trim() + ';' })
      if (error) {
        console.error('Error executing statement:', statement.trim())
        console.error('Error details:', error)
        throw error
      }
    }
    
    console.log('Migration applied successfully')

    // Create initial admin user if none exists
    const { data: existingUsers, error: usersError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('role', 'admin')
      .limit(1)

    if (usersError) {
      console.error('Error checking for existing admin:', usersError)
      throw usersError
    }

    if (!existingUsers?.length) {
      console.log('Creating initial admin user...')
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@hotel.com',
        password: 'admin123',
        email_confirm: true
      })

      if (authError) {
        console.error('Error creating admin auth user:', authError)
        throw authError
      }

      // Create admin profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authData.user.id,
          role: 'admin',
          full_name: 'System Admin',
          phone: '+998900000000'
        }])

      if (profileError) {
        console.error('Error creating admin profile:', profileError)
        throw profileError
      }

      console.log('Initial admin user created successfully')
      console.log('Email: admin@hotel.com')
      console.log('Password: admin123')
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

applyMigration() 