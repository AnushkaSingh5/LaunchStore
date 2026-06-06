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
    const storesRes = await fetch(`${supabaseUrl}/rest/v1/stores?select=*`, { headers });
    const stores = await storesRes.json();
    console.log('--- STORES ---');
    stores.forEach(s => console.log(`ID: ${s.id}, Creator: ${s.creator_id}, Slug: ${s.slug}, Name: ${s.name}, Status: ${s.status}`));

    const catsRes = await fetch(`${supabaseUrl}/rest/v1/categories?select=*`, { headers });
    const cats = await catsRes.json();
    console.log('\n--- CATEGORIES ---');
    cats.forEach(c => console.log(`ID: ${c.id}, StoreID: ${c.store_id}, Name: ${c.name}, Slug: ${c.slug}`));
  }

  check();
} catch (e) {
  console.error(e);
}
