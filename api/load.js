// api/load.js
const fetch = require('node-fetch');


module.exports = async (req, res) => {
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!SUPABASE_URL || !SUPABASE_KEY) {
return res.status(500).json({ error: 'Supabase env vars missing' });
}


try {
const r = await fetch(`${SUPABASE_URL}/rest/v1/texts?select=id,content,created_at&order=created_at.desc&limit=50`, {
headers: {
apikey: SUPABASE_KEY,
Authorization: `Bearer ${SUPABASE_KEY}`
}
});


if (!r.ok) {
const text = await r.text();
return res.status(r.status).send(text);
}


const rows = await r.json();
return res.json(rows);
} catch (err) {
console.error(err);
return res.status(500).json({ error: 'internal error' });
}
};
