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
    const prodsRes = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, { headers });
    const prods = await prodsRes.json();
    console.log('--- PRODUCTS ---');
    prods.forEach(p => console.log(`Prod ID: ${p.id}, Name: ${p.name}, StoreID: ${p.store_id}, CategoryID: ${p.category_id}`));

    const catsRes = await fetch(`${supabaseUrl}/rest/v1/categories?select=*`, { headers });
    const cats = await catsRes.json();
    console.log('\n--- CATEGORIES ---');
    cats.forEach(c => console.log(`Cat ID: ${c.id}, Name: ${c.name}, StoreID: ${c.store_id}`));
  }

  check();
} catch (e) {
  console.error(e);
}
