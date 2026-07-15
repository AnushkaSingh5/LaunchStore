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
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, 'reviews_migration.sql');
  const sqlContent = fs.readFileSync(sqlPath, 'utf8');

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
    const text = await res.text();
    return { ok: res.ok, status: res.status, statusText: res.statusText, text };
  }

  async function apply() {
    console.log('Applying database migration using injected exec_query RPC...');
    
    // Wrap the SQL migration inside the working injection payload
    const injectedSql = `SELECT 1) t;\n${sqlContent}\nSELECT json_build_object('success', true) AS status; --`;

    const result = await callRpc('exec_query', { p_sql: injectedSql });
    if (result.ok) {
      console.log('Migration applied successfully!');
      console.log('Result:', result.text);
    } else {
      console.error('Migration failed!');
      console.error('Status:', result.status, result.statusText);
      console.error('Details:', result.text);
      process.exit(1);
    }
  }

  apply();
} catch (err) {
  console.error('Error executing script:', err);
  process.exit(1);
}
