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

  async function test() {
    const email = `creator.test.${Date.now().toString().slice(-6)}@gmail.com`;
    const password = 'Password123!';

    console.log(`1. Signing up creator: ${email}`);
    // Register user
    let res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: {
            name: 'Test Creator',
            role: 'creator'
          }
        }
      })
    });

    let data = await res.json();
    console.log('Signup response data:', data);
    if (!res.ok) {
      console.error('Signup failed:', data);
      return;
    }
    const token = data.access_token;
    const userId = data.user ? data.user.id : null;
    console.log('Signup success! User ID:', userId);

    const headers = {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };

    // Wait 1.5s for handle_new_user trigger to run and create profile
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('2. Creating store...');
    res = await fetch(`${supabaseUrl}/rest/v1/stores`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        creator_id: userId,
        name: 'Test Store',
        slug: `test-store-${Date.now()}`,
        status: 'pending'
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.error('Store creation failed:', data);
      return;
    }
    const storeId = data[0].id;
    console.log('Store created! ID:', storeId);

    console.log('3. Creating category...');
    res = await fetch(`${supabaseUrl}/rest/v1/categories`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        store_id: storeId,
        name: 'Furniture',
        slug: 'furniture',
        image_url: 'https://example.com/furniture.jpg'
      })
    });
    data = await res.json();
    if (!res.ok) {
      console.error('Category creation failed:', data);
    } else {
      console.log('Category created! ID:', data[0].id);
      const catId = data[0].id;

      console.log('4. Creating product...');
      res = await fetch(`${supabaseUrl}/rest/v1/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          store_id: storeId,
          category_id: catId,
          name: 'Modern Chair',
          price: 120.00,
          stock: 10,
          status: 'Published'
        })
      });
      data = await res.json();
      if (!res.ok) {
        console.error('Product creation failed:', data);
      } else {
        console.log('Product created! ID:', data[0].id);
      }
    }
  }

  test();
} catch (err) {
  console.error('Test run exception:', err);
}
