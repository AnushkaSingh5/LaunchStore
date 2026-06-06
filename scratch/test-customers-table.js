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

  async function queryTable(tableName) {
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    if (!res.ok) {
      const errText = await res.text();
      return { success: false, status: res.status, statusText: res.statusText, error: errText };
    }
    const data = await res.json();
    return { success: true, data };
  }

  async function check() {
    console.log('Checking "customers" table...');
    const custCheck = await queryTable('customers');
    console.log('Customers table check:', custCheck);

    console.log('\nChecking "customer_addresses" table...');
    const addrCheck = await queryTable('customer_addresses');
    console.log('Customer addresses check:', addrCheck);
  }

  check();
} catch (err) {
  console.error('Scratch run error:', err);
}
