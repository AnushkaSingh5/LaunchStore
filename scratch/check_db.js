const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1];
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    } else if (val.startsWith("'") && val.endsWith("'")) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Connecting to Supabase REST endpoint:', supabaseUrl);

async function run() {
  try {
    // Let's request the table structure or query store_shipping_settings
    const url = `${supabaseUrl}/rest/v1/store_shipping_settings?limit=1`;
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    const bodyText = await response.text();
    console.log('Response body:', bodyText);

    // Let's query one that we know might fail if country doesn't exist
    const urlWithCountry = `${supabaseUrl}/rest/v1/store_shipping_settings?select=country&limit=1`;
    const resCountry = await fetch(urlWithCountry, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    console.log('Country select status:', resCountry.status);
    console.log('Country select response:', await resCountry.text());

  } catch (err) {
    console.error('Exception:', err);
  }
}

run();
