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
  
  fetch(url, {
    method: 'POST',
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_sql: "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public'"
    })
  })
  .then(r => r.json())
  .then(data => {
    console.log('Database functions found:', data);
  })
  .catch(console.error);

} catch (err) {
  console.error(err);
}
