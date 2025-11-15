/*
Simple script to test Supabase signUp and print full response for debugging.
Usage:
  1) Install deps: npm install @supabase/supabase-js node-fetch@2
  2) Set env vars or edit below: SUPABASE_URL, SUPABASE_KEY
  3) Run: node scripts/test-signup.js

This script intentionally uses the public (anon) key to mimic client signup.
*/

const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ctymgbwdvasdghxxhhvo.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0eW1nYndkdmFzZGdoeHhoaHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MTc2MzEsImV4cCI6MjA3Njk5MzYzMX0.gWY48uk3W9yLYXiCx8wLdG9OVoRSBR7zi07-7pjP9Fk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { fetch });

async function testSignup() {
  const email = process.argv[2] || `test_${Date.now()}@example.com`;
  const password = process.argv[3] || 'TestPassword123!';

  console.log('Testing signup with', email);

  try {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: {
        // remove data payload for now to isolate server-side trigger issues
        // data: { full_name: 'Test User' },
      },
    });

    console.log('SIGNUP RESPONSE:');
    console.dir(res, { depth: null });
  } catch (err) {
    console.error('SIGNUP EXCEPTION:');
    console.error(err);
  }
}

testSignup();
