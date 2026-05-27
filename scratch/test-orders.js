const url = 'https://cijmdfhimlfarefpjhsm.supabase.co/rest/v1/rpc/admin_get_orders';
const apiKey = 'sb_publishable_KFvHxTlXz3gLZ5IU4Q1aCg_EWEk50SB';

fetch(url, {
  method: 'POST',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    p_admin_email: 'admin@launchcart.com'
  })
})
.then(res => res.json())
.then(data => {
  console.log('--- ALL RPC ORDERS ---');
  console.log(data);
})
.catch(err => console.error(err));
