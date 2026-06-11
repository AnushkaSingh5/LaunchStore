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

const creatorIds = [
  '963553ea-21ba-41c8-af00-0cdc3e3a7c51', // AestheticStore / EasyTech
  '534b82be-4401-472a-8504-d24b4a40ed53', // store2
  '2b409fd5-a862-4c3c-acb6-5caa23201f5c'  // Test Store
];

async function test() {
  for (const creatorId of creatorIds) {
    console.log(`\nQuerying store for creator ID: ${creatorId}`);
    const url = `${supabaseUrl}/rest/v1/stores?creator_id=eq.${creatorId}&select=*`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Result:', JSON.stringify(data, null, 2));
  }
}

test();
