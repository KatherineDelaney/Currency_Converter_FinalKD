// Import the function used to create a Supabase client
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client using environment variables
// SUPABASE_URL and SUPABASE_KEY are stored in the .env file for security
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Export the Supabase client so it can be used in other files
export default supabase;
