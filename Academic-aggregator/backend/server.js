// backend/server.js
const express = require('express');
const fetch = require('node-fetch');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Allow simple CORS (proxy will serve frontend, but safe)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Serve static frontend when available (so / works if frontend is present)
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// /whoami to show which backend served the request (for LB demo)
app.get('/whoami', (req, res) => {
  res.json({ hostname: os.hostname(), port: PORT, pid: process.pid });
});

// /api/search?q=term — uses OpenLibrary for reliable responses
app.get('/api/search', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
    const olResp = await fetch(olUrl, { headers: { 'User-Agent': 'Academic-Aggregator/1.0' } });
    if (!olResp.ok) throw new Error('OpenLibrary response not ok: ' + olResp.status);
    const olData = await olResp.json();

    // normalize result to only required fields
    const books = (olData.docs || []).map(b => ({
      title: b.title || 'No title',
      authors: b.author_name || [],
      year: b.first_publish_year || null,
      key: b.key || null,
      cover_i: b.cover_i || null
    }));

    res.json({ openLibrary: books });
  } catch (err) {
    console.error('API fetch error:', err && err.message ? err.message : err);
    res.status(500).json({ error: 'Error fetching data from OpenLibrary' });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
