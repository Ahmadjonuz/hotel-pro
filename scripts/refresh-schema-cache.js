// This script manually executes the SQL to add document_number column and refresh schema cache
const { supabase } = require('../lib/supabase');

async function refreshSchemaCache() {
  console.log('Ensuring document_number column exists and refreshing schema cache...');

  const sql = `
    -- Ensure document fields exist on guests table
    ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS document_type TEXT,
    ADD COLUMN IF NOT EXISTS document_number TEXT;

    -- Refresh Supabase's schema cache
    NOTIFY pgrst, 'reload schema';
  `;

  try {
    // Execute the SQL directly
    const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('Error executing SQL:', error);
      return;
    }

    console.log('Schema cache refreshed successfully!');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

refreshSchemaCache(); 