const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split(/\r?\n/).forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const eqIdx = trimmed.indexOf('=');
  if (eqIdx === -1) return;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
  env[key] = val;
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function test() {
  const email = 'creator.test.372154@gmail.com';
  const password = 'Password123!';

  let res = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });

  let data = await res.json();
  const token = data.access_token;
  const userId = data.user.id;

  console.log('Fetching store with custom X-Cache-Buster header...');
  let storeRes = await fetch(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'X-Cache-Buster': Date.now().toString()
    }
  });
  let storeData = await storeRes.json();
  console.log('Store response status:', storeRes.status);
  console.log('Store data fetched length:', storeData.length);
}

test();
