// api/save.js
const fetch = require('node-fetch');


module.exports = async (req, res) => {
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;


if (!SUPABASE_URL || !SUPABASE_KEY) {
return res.status(500).json({ error: 'Supabase env vars missing' });
}


if (req.method !== 'POST') return res.status(405).end();


const { content } = req.body;
if (!content || typeof content !== 'string') return res.status(400).json({ error: 'bad request' });


try {
const body = JSON.stringify({ content });
const r = await fetch(`${SUPABASE_URL}/rest/v1/texts`, {
method: 'POST',
headers: {
apikey: SUPABASE_KEY,
Authorization: `Bearer ${SUPABASE_KEY}`,
'Content-Type': 'application/json'
},
body
});


if (!r.ok) {
const text = await r.text();
return res.status(r.status).send(text);
}


const rows = await r.json();
return res.status(201).json(rows);
} catch (err) {
console.error(err);
return res.status(500).json({ error: 'internal error' });
}
};
