// Simple frontend to call /api/search and render results
async function search(q) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) {
    const body = await res.json().catch(()=>null);
    throw new Error(body && body.error ? body.error : 'Search failed');
  }
  return res.json();
}

function render(results) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  const showBooks = document.getElementById('showBooks').checked;
  const showPapers = document.getElementById('showPapers').checked;

  if (showBooks) {
    results.books.forEach(b => {
      const div = document.createElement('div');
      div.className = 'result';
      div.innerHTML = `<strong>${escapeHtml(b.title)}</strong> <span class="badge">Book</span><br>
        ${b.authors ? escapeHtml(b.authors) + ' — ' : ''}${b.year || ''}`;
      container.appendChild(div);
    });
  }
  if (showPapers) {
    results.papers.forEach(p => {
      const div = document.createElement('div');
      div.className = 'result';
      div.innerHTML = `<strong>${escapeHtml(p.title)}</strong> <span class="badge">Paper</span><br>
        ${p.published ? p.published.split('T')[0] : ''}<p>${escapeHtml(p.summary ? p.summary.slice(0,200) + '...' : '')}</p>
        ${p.pdf ? `<a href="${p.pdf}" target="_blank">Open PDF</a>` : ''}`;
      container.appendChild(div);
    });
  }
}

function escapeHtml(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

document.getElementById('searchBtn').addEventListener('click', async () => {
  const q = document.getElementById('q').value.trim();
  if (!q) { document.getElementById('results').innerText = 'Please enter a search term.'; return; }
  document.getElementById('results').innerText = 'Searching...';
  try {
    const r = await search(q);
    render(r);
  } catch (err) {
    document.getElementById('results').innerText = 'Search error: ' + err.message;
  }
});

// Enter to search
document.getElementById('q').addEventListener('keypress', (e) => { if (e.key === 'Enter') document.getElementById('searchBtn').click(); });
