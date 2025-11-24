// server.js
const express = require('express');
const fetch = require('node-fetch');
const os = require('os');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve frontend folder
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// /whoami endpoint for load balancer demo
app.get('/whoami', (req, res) => {
  res.json({
    hostname: os.hostname(),
    port: PORT,
    pid: process.pid
  });
});

// /api/search endpoint for OpenLibrary + arXiv
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Missing search query' });

  try {
    // OpenLibrary API
    const olResp = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const olData = await olResp.json();

    // arXiv API
    const arxivResp = await fetch(`http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`);
    const arxivText = await arxivResp.text();

    res.json({
      openLibrary: olData.docs.slice(0, 5), // top 5 results
      arxiv: arxivText
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching data from APIs' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

