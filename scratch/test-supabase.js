const fs = require('fs');
const path = require('path');

// Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined in .env.local');
  process.exit(1);
}

async function testREST() {
  const headers = {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Fetch store
    const storeUrl = `${supabaseUrl}/rest/v1/stores?slug=eq.aestheticstore&select=*`;
    console.log('Fetching store:', storeUrl);
    const storeRes = await fetch(storeUrl, { headers });
    const storeData = await storeRes.json();
    console.log('Store response count:', storeData.length);
    if (storeData.length === 0) {
      console.log('No store found');
      return;
    }
    const store = storeData[0];
    console.log('Store ID:', store.id);

    // 2. Fetch products
    const productsUrl = `${supabaseUrl}/rest/v1/products?store_id=eq.${store.id}&status=eq.Published&select=*`;
    console.log('Fetching products:', productsUrl);
    const productsRes = await fetch(productsUrl, { headers });
    const productsData = await productsRes.json();
    console.log('Products response ok:', productsRes.ok, 'count:', productsData.length);
    console.log('Products:', productsData);

    // 3. Fetch categories
    const categoriesUrl = `${supabaseUrl}/rest/v1/categories?store_id=eq.${store.id}&select=*`;
    console.log('Fetching categories:', categoriesUrl);
    const categoriesRes = await fetch(categoriesUrl, { headers });
    const categoriesData = await categoriesRes.json();
    console.log('Categories response ok:', categoriesRes.ok, 'count:', categoriesData.length);
    console.log('Categories:', categoriesData);

  } catch (e) {
    console.error('Exception thrown during REST requests:', e.message);
  }
}

testREST();
