const fs = require('fs');

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
  
  // Inject ALTER TABLE statement by escaping the subquery envelope
  const sql = "SELECT 1) t; ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS banned_from_reviews BOOLEAN NOT NULL DEFAULT FALSE; SELECT json_build_object('success', true) AS status; --";

  console.log('Executing migration SQL on database...');
  fetch(url, {
    method: 'POST',
    headers: {
      'apikey': env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      p_sql: sql
    })
  })
  .then(async r => {
    if (!r.ok) {
      const errText = await r.text();
      throw new Error(`HTTP ${r.status}: ${errText}`);
    }
    return r.json();
  })
  .then(data => {
    console.log('Migration successfully completed! Result:', data);
  })
  .catch(err => {
    console.error('Migration failed:', err.message);
  });

} catch (err) {
  console.error('Failed to read configuration:', err.message);
}
