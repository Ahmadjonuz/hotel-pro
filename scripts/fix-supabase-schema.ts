import { createClient } from '@supabase/supabase-js'

// Use environment variables
const supabaseUrl = 'https://rbcnywfmmpeavdmfcrdm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiY255d2ZtbXBlYXZkbWZjcmRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzg0Nzg5NCwiZXhwIjoyMDU5NDIzODk0fQ.yHEZs0Ck4Bkf5RZQanTE3KqRZcliljDDkEeFbm2gaH0'

// Create Supabase client with service role (admin) privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixSchema() {
  console.log('Starting schema fix...')

  try {
    // 1. Ensure the document fields exist in guests table
    console.log('Step 1: Ensuring document fields exist...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE guests
        ADD COLUMN IF NOT EXISTS document_type TEXT,
        ADD COLUMN IF NOT EXISTS document_number TEXT;
      `
    })

    if (alterError) {
      console.error('Error adding columns:', alterError)
      return
    }

    // 2. Force cache refresh with admin privileges
    console.log('Step 2: Forcing schema cache refresh...')
    const { error: notifyError } = await supabase.rpc('exec_sql', {
      sql_query: `SELECT pg_notify('pgrst', 'reload schema');`
    })

    if (notifyError) {
      console.error('Error refreshing schema cache:', notifyError)
      return
    }

    console.log('Schema fix completed successfully!')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the function
fixSchema() 