const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read env variables
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Found' : 'Not Found');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    console.log('\n--- Testing connection ---');
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('*')
      .limit(1);
    
    if (storesError) {
      console.error('Error fetching stores:', storesError);
    } else {
      console.log('Successfully fetched stores. Count:', stores.length);
      console.log('Store sample:', stores[0]);
    }

    console.log('\n--- Testing storage buckets ---');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError.message || bucketsError);
    } else {
      console.log('Buckets found:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('Test script exception:', err);
  }
}

test();
