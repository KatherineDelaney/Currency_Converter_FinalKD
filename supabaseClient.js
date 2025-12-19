import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Ensure dotenv is configured here as well to be safe
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Log to help you troubleshoot (you can remove this later)
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Supabase environment variables are missing!");
  console.log("Current Directory:", process.cwd());
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
