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
    console.error('Error: Missing env credentials.');
    process.exit(1);
  }

  async function updateSlug() {
    console.log('Updating store slug in database...');
    const url = `${supabaseUrl}/rest/v1/stores?creator_id=eq.963553ea-21ba-41c8-af00-0cdc3e3a7c51`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ slug: 'aestheticstore' })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to update store slug: ${res.statusText} - ${errText}`);
    }
    const data = await res.json();
    console.log('Update Success! Current Store Record:', JSON.stringify(data, null, 2));
  }

  updateSlug();
} catch (err) {
  console.error('Scratch run error:', err);
}
