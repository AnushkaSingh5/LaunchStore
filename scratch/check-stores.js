const fs = require('fs');
const path = require('path');

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

async function test() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/stores?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const data = await response.json();
    console.log('Stores list:');
    data.forEach(s => {
      console.log(`ID: ${s.id}, Creator: ${s.creator_id}, Name: ${s.name}, Slug: ${s.slug}, Status: ${s.status}`);
    });
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();
