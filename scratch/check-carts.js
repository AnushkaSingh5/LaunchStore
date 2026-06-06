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
    const url = `${supabaseUrl}/rest/v1/${tableName}?select=*`;
    const res = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    return { ok: res.ok, status: res.status, statusText: res.statusText };
  }

  async function callRpc(rpcName, params = {}) {
    const url = `${supabaseUrl}/rest/v1/rpc/${rpcName}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return { ok: res.ok, status: res.status, statusText: res.statusText, text: await res.text() };
  }

  async function check() {
    console.log('Checking tables...');
    
    const customerCarts = await queryTable('customer_carts');
    console.log('customer_carts:', customerCarts);

    const cartItems = await queryTable('cart_items');
    console.log('cart_items:', cartItems);

    const adminUsers = await queryTable('admin_users');
    console.log('admin_users:', adminUsers);

    console.log('\nTesting RPC verify_admin_credentials...');
    const rpcRes = await callRpc('verify_admin_credentials', { p_email: 'admin@launchcart.com', p_password: 'admin123' });
    console.log('verify_admin_credentials RPC result:', rpcRes);
  }

  check();
} catch (err) {
  console.error('Scratch run error:', err);
}
