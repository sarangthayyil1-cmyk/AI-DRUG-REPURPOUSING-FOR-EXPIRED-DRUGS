const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  process.exit(1);
}

const endpoint = `${url}/rest/v1/keepalive?select=id&limit=1`;

const res = await fetch(endpoint, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

if (!res.ok) {
  console.error(`Keepalive ping failed: ${res.status} ${res.statusText}`);
  console.error(await res.text());
  process.exit(1);
}

const rows = await res.json();
console.log(`Keepalive ping ok — received ${rows.length} row(s)`);
