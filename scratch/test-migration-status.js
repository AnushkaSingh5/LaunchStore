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
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  async function testInsert() {
    const payload = {
      store_id: '020ad177-30de-4afa-adbc-047db82f4a3c', // AestheticStore ID from db-check
      customer_name: 'Test Constraint',
      customer_email: 'test@constraint.com',
      total_amount: 10.00,
      status: 'Pending'
    };

    console.log('Testing insert of Pending status...');
    const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('Response Status:', res.status);
    console.log('Response Data:', data);
  }

  testInsert();
} catch (e) {
  console.error(e);
}
