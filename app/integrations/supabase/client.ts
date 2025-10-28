import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://ctymgbwdvasdghxxhhvo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0eW1nYndkdmFzZGdoeHhoaHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTc2MzEsImV4cCI6MjA3Njk5MzYzMX0.gWY48uk3W9yLYXiCx8wLdG9OVoRSBR7zi07-7pjP9Fk";

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
