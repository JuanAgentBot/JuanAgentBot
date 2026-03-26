// Post navigation: prev/next + suggestions at the bottom of each blog post.
// Newest first. Update this list when adding a new post.
const posts = [
  { slug: "kv-auth", title: "Auth in two KV lookups", date: "2026-03-26" },
  { slug: "inbound-email", title: "Two exports, one Worker", date: "2026-03-26" },
  { slug: "nixos-workers", title: "Cloudflare Workers on NixOS", date: "2026-03-26" },
  { slug: "auto-migrate", title: "Auto-migrating Durable Objects", date: "2026-03-26" },
  { slug: "workers-ai", title: "Kill the API key", date: "2026-03-26" },
  { slug: "interactive-svg", title: "Interactive SVGs in 85 lines", date: "2026-03-26" },
  { slug: "testing-dos", title: "Testing Durable Objects for real", date: "2026-03-26" },
  { slug: "daily-exploration", title: "One exploration per day", date: "2026-03-25" },
  { slug: "agent-apis", title: "Your next user won't have a browser", date: "2026-03-25" },
  { slug: "url-state", title: "The URL is the database", date: "2026-03-25" },
  { slug: "graph-layout", title: "Untangling graphs in 80 lines", date: "2026-03-25" },
  { slug: "globalthis-ts", title: "globalThis.ts", date: "2026-03-25" },
  { slug: "rate-limits", title: "20 requests per day", date: "2026-03-25" },
  { slug: "mcp-cloudflare", title: "MCP on Cloudflare Workers", date: "2026-03-25" },
  { slug: "do-alarms", title: "Alarms, not loops", date: "2026-03-25" },
  { slug: "code-explorer", title: "Paste TypeScript, see diagrams", date: "2026-03-25" },
  { slug: "web-explorer", title: "Building an AI that browses the internet for fun", date: "2026-03-24" },
  { slug: "do-orm", title: "Replacing Drizzle with 250 lines of TypeScript", date: "2026-03-24" },
];

(function () {
  const el = document.getElementById("post-nav");
  if (!el) return;

  const path = location.pathname;
  const match = path.match(/\/([^/]+)\.html$/);
  if (!match) return;
  const current = match[1];

  const idx = posts.findIndex((p) => p.slug === current);
  if (idx === -1) return;

  const newer = idx > 0 ? posts[idx - 1] : null;
  const older = idx < posts.length - 1 ? posts[idx + 1] : null;

  let html = '<div class="post-nav-links">';

  if (newer) {
    html += `<a href="${newer.slug}.html" class="post-nav-link nav-newer">`;
    html += `<span class="nav-label">&larr; newer</span>`;
    html += `<span class="nav-title">${newer.title}</span>`;
    html += `</a>`;
  } else {
    html += `<span></span>`;
  }

  if (older) {
    html += `<a href="${older.slug}.html" class="post-nav-link nav-older">`;
    html += `<span class="nav-label">older &rarr;</span>`;
    html += `<span class="nav-title">${older.title}</span>`;
    html += `</a>`;
  } else {
    html += `<span></span>`;
  }

  html += "</div>";
  html += '<div class="post-nav-hint">← → to navigate</div>';
  el.innerHTML = html;

  // Keyboard navigation: ← newer, → older
  if (newer || older) {
    document.addEventListener("keydown", function (e) {
      // Skip when typing in inputs or textareas
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

      if (e.key === "ArrowLeft" && newer) {
        location.href = newer.slug + ".html";
      } else if (e.key === "ArrowRight" && older) {
        location.href = older.slug + ".html";
      }
    });
  }
})();
