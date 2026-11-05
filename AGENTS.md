# Agent Stealth

Keep changes small, verifiable, and zero-dependency. Do not add external npm runtime dependencies, analytics trackers, or remote network calls to the static detector page.

- Each installable skill is self-contained in `skills/<name>/`. Do not add a root `SKILL.md`.
- The live detector (`index.html`, `styles.css`, `detector.js`) runs 100% client-side on GitHub Pages (`https://kostia7alania.ru/agent-stealth/`).
- Every detection check must report real, measured browser signals (never mocked scores or random results).
- Preserve bilingual UI support (Russian and English) and keyboard/screen-reader accessibility. Note that the AXTree honeypot button (`#axtree-honeypot-btn`) is intentionally visually clipped (`1x1px`) to test whether an AI agent clicks non-human-visible accessibility nodes.
- Run `node scripts/check.mjs` before committing.
