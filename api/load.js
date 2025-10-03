// api/load.js
module.exports = async (req, res) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  try {
    const url = `${SUPABASE_URL}/rest/v1/texts?select=id,content,created_at&order=created_at.desc&limit=50`;
    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);

    const json = JSON.parse(text || '[]');
    return res.status(200).json(json);
  } catch (err) {
    console.error('load error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
