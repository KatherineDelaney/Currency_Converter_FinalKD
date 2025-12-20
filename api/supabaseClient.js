import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Supabase environment variables are missing!");
  console.error("SUPABASE_URL:", supabaseUrl ? "Set" : "NOT SET");
  console.error("SUPABASE_KEY:", supabaseKey ? "Set" : "NOT SET");
}

// Validate URL format before creating client
let supabase;
try {
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    // Create a mock client that will fail gracefully
    supabase = {
      from: () => ({
        insert: () => Promise.resolve({ error: { message: "Supabase not configured - missing environment variables" } }),
        select: () => ({
          order: () => Promise.resolve({ data: [], error: { message: "Supabase not configured - missing environment variables" } })
        })
      })
    };
  }
} catch (error) {
  console.error("Failed to create Supabase client:", error.message);
  supabase = {
    from: () => ({
      insert: () => Promise.resolve({ error: { message: `Supabase client error: ${error.message}` } }),
      select: () => ({
        order: () => Promise.resolve({ data: [], error: { message: `Supabase client error: ${error.message}` } })
      })
    })
  };
}

export default supabase;
