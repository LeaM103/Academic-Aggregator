const searchForm = document.getElementById("searchForm");
const resultsContainer = document.getElementById("results");

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultsContainer.innerHTML = "Searching...";

  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    resultsContainer.innerHTML = ""; // Clear previous results

    // ---- Open Library results ----
    if (data.openLibrary && data.openLibrary.length > 0) {
      const olHeader = document.createElement("h2");
      olHeader.textContent = "Open Library Results";
      resultsContainer.appendChild(olHeader);

      data.openLibrary.forEach(book => {
        const div = document.createElement("div");
        div.className = "book";

        const title = document.createElement("h3");
        title.textContent = book.title;
        div.appendChild(title);

        const authors = document.createElement("p");
        authors.textContent = book.author_name ? book.author_name.join(", ") : "Unknown author";
        div.appendChild(authors);

        resultsContainer.appendChild(div);
      });
    } else {
      resultsContainer.innerHTML += "<p>No Open Library results found.</p>";
    }

    // ---- arXiv results (XML string) ----
    if (data.arxiv) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data.arxiv, "text/xml");
      const entries = xmlDoc.getElementsByTagName("entry");

      if (entries.length > 0) {
        const arxivHeader = document.createElement("h2");
        arxivHeader.textContent = "arXiv Results";
        resultsContainer.appendChild(arxivHeader);

        Array.from(entries).forEach(entry => {
          const title = entry.getElementsByTagName("title")[0]?.textContent || "No title";
          const link = entry.getElementsByTagName("link")[0]?.getAttribute("href") || "#";

          const div = document.createElement("div");
          div.className = "arxiv-entry";

          const a = document.createElement("a");
          a.href = link;
          a.textContent = title;
          a.target = "_blank";

          div.appendChild(a);
          resultsContainer.appendChild(div);
        });
      } else {
        resultsContainer.innerHTML += "<p>No arXiv results found.</p>";
      }
    }

  } catch (err) {
    console.error("Search error:", err);
    resultsContainer.innerHTML = "<p>Search error: Could not fetch data from APIs</p>";
  }
});
