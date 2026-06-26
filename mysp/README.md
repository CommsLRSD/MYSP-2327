# MYSP — All Strategic Priorities Web App

A standalone, self-contained web app version of `all-strategic-priorities.html`
for the Louis Riel School Division **Multi-Year Strategic Plan 2023–2027**.

This folder is intentionally isolated so it can be **exported and deployed
separately** from the other `.html` files in the repository. It is designed to
be served at the `/mysp` path as a full-page web app, rather than embedded
inside a pagebuilder layout.

## Contents

| File | Purpose |
| --- | --- |
| `index.html` | Full HTML document (doctype, `<head>`, metadata) and page markup |
| `styles.css` | All styles, extracted from the original embed |
| `app.js` | Interactivity (filtering, search, tabs, animations) |
| `README.md` | This file |

## Running it

No build step or dependencies are required — it is plain HTML, CSS, and
vanilla JavaScript. Open `index.html` directly in a browser, or serve the
folder with any static file server, e.g.:

```bash
cd mysp
python3 -m http.server 8000
# then open http://localhost:8000/
```

To deploy, copy the entire `mysp/` folder to any static
host (GitHub Pages, Netlify, an LRSD web server, etc.) so it is served at the
`/mysp` path.

## What changed vs. the original embed

The original was a single CMS-embeddable fragment (a `<style>` block, markup,
and a `<script>` block in one file). This version keeps all of the original
behaviour and adds improvements that a standalone build makes possible:

- **Separation of concerns** — HTML, CSS, and JavaScript live in their own files.
- **A real HTML document** — `<!DOCTYPE html>`, language, charset, viewport, and
  description metadata for correct rendering and SEO/sharing.
- **Keyword search** — free-text search across every action card.
- **Live result count** and an explicit **"no results"** state with a reset link.
- **Expand all / Collapse all** controls for the priority sections.
- **Shareable filter state** — the active status, topic, and search term are
  reflected in the URL query string, so a filtered view can be linked or bookmarked.
- **Accessibility** — filter chips expose `aria-pressed`, and the result count
  is announced via an `aria-live` region.

The underlying content is unchanged.
