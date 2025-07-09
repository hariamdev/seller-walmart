# Fix Missing walmart_tokens Table

The `walmart_tokens` table doesn't exist in your Supabase database. Since we can't use the Supabase CLI in this environment, you need to manually run the migration.

## Steps to Fix:

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the Migration SQL**
   - Copy the entire contents of `supabase/migrations/20250709161623_cold_salad.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

4. **Verify the Table was Created**
   - Go to "Table Editor" in the left sidebar
   - You should see the `walmart_tokens` table listed

## What this migration creates:

- `walmart_tokens` table with proper structure
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamp updates
- Function to calculate token expiration times

After running this migration, the Walmart connection component will work properly.