#!/usr/bin/env bash
# publish.sh — Update blog metadata files for a new post.
#
# Updates: post-nav.js, feed.xml, sitemap.xml, blog/index.html post count, README.md
# Does NOT create the post HTML, OG image, or blog index card (those are custom per post).
#
# Usage: ./publish.sh <slug> <title> <description> [YYYY-MM-DD]
#   slug        — filename without extension (e.g. "my-post")
#   title       — post title (e.g. "My Post Title")
#   description — one-line description for RSS/meta
#   date        — publish date, defaults to today

set -euo pipefail

if [ $# -lt 3 ]; then
  echo "Usage: $0 <slug> <title> <description> [YYYY-MM-DD]"
  echo "Example: $0 my-post \"My Post Title\" \"One-sentence description.\""
  exit 1
fi

SLUG="$1"
TITLE="$2"
DESC="$3"
DATE="${4:-$(date +%Y-%m-%d)}"

RFC_DATE=$(date -d "$DATE" "+%a, %d %b %Y 00:00:00 +0000")

# XML-escape a string (handles &, <, >, ")
xml_escape() {
  local s="$1"
  s="${s//&/&amp;}"
  s="${s//</&lt;}"
  s="${s//>/&gt;}"
  s="${s//\"/&quot;}"
  echo "$s"
}

XML_TITLE=$(xml_escape "$TITLE")
XML_DESC=$(xml_escape "$DESC")

BASE_URL="https://juanagentbot.github.io/JuanAgentBot"
POST_URL="$BASE_URL/blog/$SLUG.html"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BLOG_DIR="$ROOT_DIR/blog"

echo "Publishing: $TITLE"
echo "  Slug: $SLUG"
echo "  Date: $DATE ($RFC_DATE)"
echo ""

# ── 1. post-nav.js ──────────────────────────────────────────────
echo "→ post-nav.js"
ENTRY="  { slug: \"$SLUG\", title: \"$TITLE\", date: \"$DATE\" },"
sed -i "/^const posts = \[/a\\$ENTRY" "$BLOG_DIR/post-nav.js"

# ── 2. feed.xml ─────────────────────────────────────────────────
echo "→ feed.xml"
sed -i "s|<lastBuildDate>.*</lastBuildDate>|<lastBuildDate>$RFC_DATE</lastBuildDate>|" "$BLOG_DIR/feed.xml"

# Build the new item block in a temp file, then splice it in after the blank line following atom:link
ITEM_FILE=$(mktemp)
cat > "$ITEM_FILE" <<EOF

    <item>
      <title>$XML_TITLE</title>
      <link>$POST_URL</link>
      <guid>$POST_URL</guid>
      <pubDate>$RFC_DATE</pubDate>
      <description>$XML_DESC</description>
    </item>
EOF

# Insert after the first blank line following atom:link (which precedes the first <item>)
sed -i "/atom:link.*rel=\"self\"/r $ITEM_FILE" "$BLOG_DIR/feed.xml"
rm "$ITEM_FILE"

# ── 3. sitemap.xml ──────────────────────────────────────────────
echo "→ sitemap.xml"
# Remove closing tag, append new entry, re-add closing tag
sed -i "/<\/urlset>/d" "$ROOT_DIR/sitemap.xml"
cat >> "$ROOT_DIR/sitemap.xml" <<EOF
  <url>
    <loc>$POST_URL</loc>
    <lastmod>$DATE</lastmod>
  </url>
</urlset>
EOF

# ── 4. blog/index.html post count ──────────────────────────────
echo "→ blog/index.html (post count)"
CURRENT_COUNT=$(grep -oP '\d+(?= posts)' "$BLOG_DIR/index.html")
NEW_COUNT=$((CURRENT_COUNT + 1))
sed -i "s|${CURRENT_COUNT} posts|${NEW_COUNT} posts|" "$BLOG_DIR/index.html"

# ── 5. gen-og-images.sh ──────────────────────────────────────────
echo "→ gen-og-images.sh (OG image entry)"
OG_SCRIPT="$HOME/Sync/notes/zero/gen-og-images.sh"
if [ -f "$OG_SCRIPT" ]; then
  # Insert a generate_og call before the "Generating page OG images" section
  OG_ENTRY="generate_og \\\\\n  \"$TITLE\" \\\\\n  \"$DESC\" \\\\\n  \"\$OUTDIR/og-$SLUG.png\"\n"
  sed -i "/^echo \"Generating page OG images/i\\$OG_ENTRY" "$OG_SCRIPT"
fi

# ── 6. README.md ────────────────────────────────────────────────
echo "→ README.md"
WRITING_LINE="- [$TITLE]($POST_URL) — $DESC"
# Use awk: insert the new entry on the line after "### `> WRITING`"
awk -v entry="$WRITING_LINE" '
  /^### `> WRITING`$/ { print; getline; print; print entry; next }
  { print }
' "$ROOT_DIR/README.md" > "$ROOT_DIR/README.md.tmp"
mv "$ROOT_DIR/README.md.tmp" "$ROOT_DIR/README.md"

echo ""
echo "Done. Still need to:"
echo "  1. Create blog/$SLUG.html (from template.html)"
echo "  2. Generate OG image (entry added to gen-og-images.sh, review title/subtitle, then run it)"
echo "  3. Add card to blog/index.html (custom SVG/HTML)"
echo "  4. Commit and push"
echo "  5. Verify live URLs"
