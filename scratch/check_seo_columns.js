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
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  };

  async function checkColumns() {
    console.log('Fetching stores columns...');
    const resStores = await fetch(`${supabaseUrl}/rest/v1/stores?select=*&limit=1`, {
      method: 'GET',
      headers
    });
    const stores = await resStores.json();
    console.log('Stores sample record keys:', stores.length > 0 ? Object.keys(stores[0]) : 'No records');

    console.log('Fetching products columns...');
    const resProducts = await fetch(`${supabaseUrl}/rest/v1/products?select=*&limit=1`, {
      method: 'GET',
      headers
    });
    const products = await resProducts.json();
    console.log('Products sample record keys:', products.length > 0 ? Object.keys(products[0]) : 'No records');
  }

  checkColumns();
} catch (e) {
  console.error(e);
}
