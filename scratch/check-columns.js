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
    // Get one category
    const catsRes = await fetch(`${supabaseUrl}/rest/v1/categories?select=*&limit=1`, { headers });
    const cats = await catsRes.json();
    console.log('Category Columns:', cats.length > 0 ? Object.keys(cats[0]) : 'No data');

    // Get one product
    const prodsRes = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=1`, { headers });
    const prods = await prodsRes.json();
    console.log('Product Columns:', prods.length > 0 ? Object.keys(prods[0]) : 'No data');
  }

  check();
} catch (e) {
  console.error(e);
}
