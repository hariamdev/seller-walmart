import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables exist and are not placeholder values
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

if (supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Please update your .env file with actual Supabase credentials. The current values are placeholders.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(`Invalid Supabase URL format: ${supabaseUrl}. Please check your VITE_SUPABASE_URL in the .env file.`);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);