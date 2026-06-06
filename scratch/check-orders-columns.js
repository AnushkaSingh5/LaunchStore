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
    // Attempt to fetch one order or check columns via REST API
    const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&limit=1`, { headers });
    const data = await res.json();
    if (res.ok) {
      console.log('Orders Columns:', data.length > 0 ? Object.keys(data[0]) : 'No data in table');
    } else {
      console.error('REST failed:', data);
    }
  }

  check();
} catch (e) {
  console.error(e);
}
