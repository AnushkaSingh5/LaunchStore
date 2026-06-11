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

async function test() {
  try {
    const email = `test_new_creator_${Date.now()}@example.com`;
    const password = 'Password123!';

    console.log(`1. Registering new creator: ${email}`);
    let signUpRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
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
            name: 'New Creator Test',
            role: 'creator'
          }
        }
      })
    });

    let signUpData = await signUpRes.json();
    if (!signUpRes.ok) {
      console.error('Signup failed:', signUpData);
      return;
    }
    const userId = signUpData.user.id;
    const initialToken = signUpData.access_token;
    console.log(`Signup success! User ID: ${userId}`);

    // Wait for auth trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('\n2. Creating store for this creator...');
    let createRes = await fetch(`${supabaseUrl}/rest/v1/stores`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${initialToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        creator_id: userId,
        name: 'New Creator Store',
        slug: `new-creator-store-${Date.now()}`,
        status: 'approved'
      })
    });
    let createData = await createRes.json();
    if (!createRes.ok) {
      console.error('Store creation failed:', createData);
      return;
    }
    console.log('Store created successfully!');

    console.log('\n3. Logging in again to get fresh session token...');
    let loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    let loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginData);
      return;
    }
    const token = loginData.access_token;

    console.log('\n4. Fetching store using fresh session token (like fetchStoreOnly)...');
    let fetchRes = await fetch(`${supabaseUrl}/rest/v1/stores?creator_id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${token}`
      }
    });
    let fetchData = await fetchRes.json();
    console.log('Fetch response status:', fetchRes.status);
    console.log('Fetch response body:', JSON.stringify(fetchData, null, 2));

  } catch (err) {
    console.error('Exception:', err);
  }
}

test();
