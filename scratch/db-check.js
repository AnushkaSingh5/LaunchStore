async function checkEndpoint(path) {
  const url = `https://cijmdfhimlfarefpjhsm.supabase.co/rest/v1/${path}`;
  const apiKey = 'sb_publishable_KFvHxTlXz3gLZ5IU4Q1aCg_EWEk50SB';

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'Authorization': `Bearer ${apiKey}`
      }
    });
    const text = await res.text();
    return JSON.parse(text);
  } catch (err) {
    console.error('Fetch error:', err);
    return null;
  }
}

async function run() {
  const profiles = await checkEndpoint('profiles?select=*');
  console.log('--- Profiles ---');
  if (Array.isArray(profiles)) {
    profiles.forEach(p => {
      console.log(`ID: ${p.id} | Email: ${p.email} | Name: ${p.name} | Role: ${p.role}`);
    });
  } else {
    console.log('Profiles response:', profiles);
  }

  const stores = await checkEndpoint('stores?select=*');
  console.log('\n--- Stores ---');
  if (Array.isArray(stores)) {
    stores.forEach(s => {
      console.log(`ID: ${s.id} | Creator: ${s.creator_id} | Name: ${s.name} | Slug: ${s.slug} | Status: ${s.status}`);
    });
  } else {
    console.log('Stores response:', stores);
  }
}

run();
