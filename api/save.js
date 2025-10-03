// api/save.js
const MAX_LENGTH = 5000;
const MIN_LENGTH = 1;
const PROFANITY = ['badword1','badword2'];
const RATE_LIMIT_WINDOW_MS = 10 * 1000;
const RATE_LIMIT_MAX = 5;
const rateMap = new Map();

module.exports = async (req, res) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }
  if (req.method !== 'POST') return res.status(405).end();

  const { content } = req.body || {};
  if (typeof content !== 'string') return res.status(400).json({ error: 'Bad request: content required' });

  const trimmed = content.trim();
  if (trimmed.length < MIN_LENGTH) return res.status(400).json({ error: 'Content too short' });
  if (trimmed.length > MAX_LENGTH) return res.status(413).json({ error: 'Content too large' });

  const lc = trimmed.toLowerCase();
  for (const bad of PROFANITY) if (bad && lc.includes(bad)) return res.status(400).json({ error: 'Content contains disallowed words' });

  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now();
  const entry = rateMap.get(ip) || { ts: now, count: 0 };
  if (now - entry.ts > RATE_LIMIT_WINDOW_MS) { entry.ts = now; entry.count = 0; }
  entry.count += 1;
  rateMap.set(ip, entry);
  if (entry.count > RATE_LIMIT_MAX) return res.status(429).json({ error: 'Too many requests — slow down' });

  try {
    const body = JSON.stringify({ content: trimmed });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/texts`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body
    });

    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text);

    try { return res.status(201).json(JSON.parse(text)); } catch (err) { return res.status(201).send(text); }
  } catch (err) {
    console.error('save error', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
