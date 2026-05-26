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
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[key] = val;
  });

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env.');
    process.exit(1);
  }

  async function queryTable(tableName) {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to query ${tableName}: ${res.statusText} - ${errText}`);
    }
    return res.json();
  }

  async function check() {
    try {
      console.log('--- Stores ---');
      const stores = await queryTable('stores');
      console.log(JSON.stringify(stores, null, 2));

      console.log('\n--- Categories ---');
      const categories = await queryTable('categories');
      console.log(JSON.stringify(categories, null, 2));

      console.log('\n--- Products ---');
      const products = await queryTable('products');
      console.log(JSON.stringify(products, null, 2));

      console.log('\n--- Orders ---');
      const orders = await queryTable('orders');
      console.log(JSON.stringify(orders, null, 2));

      console.log('\n--- Profiles ---');
      const profiles = await queryTable('profiles');
      console.log(JSON.stringify(profiles, null, 2));
    } catch (e) {
      console.error('Query error:', e);
    }
  }

  check();
} catch (err) {
  console.error('Scratch run error:', err);
}
