const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '../.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) return;
    env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  };

  async function check() {
    // Exact fetch from orderService.js:
    // select('*, store:store_id(name, slug)')
    const url = `${supabaseUrl}/rest/v1/orders?select=*,store:store_id(name,slug)&customer_email=eq.test1@gmail.com`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    console.log('Status:', res.status, res.statusText);
    console.log('Response:', JSON.stringify(data, null, 2));
  }

  check();
} catch (e) {
  console.error(e);
}
