import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://nonilkfjlnqpvvdufumn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbmlsa2ZqbG5xcHZ2ZHVmdW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTkyNTIsImV4cCI6MjA3ODc5NTI1Mn0.P4wBQFkWIbYk_bAjhUWKwUk-Mx78OpnjXnuIRM2fmBo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
