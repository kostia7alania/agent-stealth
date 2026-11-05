# Stealth Playbook: Fixing AI Browser Agent Detection (2026)

This reference covers concrete configurations for Codex, Claude in Chrome / Computer Use, Kimi WebBridge, `agent-browser`, Playwright MCP, Chrome DevTools MCP, and Browser-Use.

## 1. Anatomy of the "Tinder / Cloudflare Instant Logout"

When an AI browser extension or CDP client attaches to an already logged-in tab:
1. **`chrome.debugger.attach` / CDP Attach:** Enables inspector domains (`Runtime.enable`, `DOM.enable`, `Page.enable`, `Overlay.enable`).
2. **Favicon / Title / Overlay Mutation:** Some extensions swap the tab icon, add a status badge node, or inject an active-tab border into the DOM.
3. **Synchronous Console Serialization Leak:** Anti-bot scripts run a periodic heartbeat:
   ```js
   let cdpDetected = false;
   const err = new Error();
   Object.defineProperty(err, 'stack', {
     get() { cdpDetected = true; return ''; }
   });
   console.debug(err);
   ```
   When `Runtime.enable` is active, V8 eagerly reads `err.stack` to serialize the console event for the CDP client. `cdpDetected` flips to `true` within a single microtask.
4. **Session Kill:** The next XHR/fetch request includes the poisoned telemetry payload; the server invalidates the session token and returns `401 Unauthorized`.

## 2. How to Launch a Clean Chrome Session for AI Agents

Instead of letting Playwright or an extension spawn a marked `--enable-automation` instance, launch Chrome natively with a dedicated persistent profile and connect over CDP:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/.chrome-stealth-profile" \
  --disable-blink-features=AutomationControlled \
  --no-first-run \
  --no-default-browser-check
```

Key properties of this launch mode:
- `navigator.webdriver` is natively `false` on `Navigator.prototype` (no tampered getter `toString()` leak and no cross-iframe leak).
- Real GPU hardware acceleration (Apple Metal / ANGLE) is active instead of `SwiftShader`.
- Window chrome (tabs/toolbar) exists, so `window.outerHeight > window.innerHeight`.
- Cookies, IndexedDB, and TLS session tickets persist across runs.

## 3. Eliminating CDP `Runtime.enable` Leaks

### Option A: Patchright (Drop-in Playwright replacement for Python / Node)
Patchright compiles Playwright's driver to execute scripts via `Page.createIsolatedWorld` without ever calling `Runtime.enable`:

```bash
# Node.js
npm install patchright

# Python
pip install patchright
patchright install chromium
```

### Option B: Rebrowser Patches for Playwright & Puppeteer
If you use standard Playwright MCP or Puppeteer:

```bash
npx rebrowser-patches@latest patch --packageName playwright-core
export REBROWSER_PATCHES_RUNTIME_FIX_MODE=addBinding
```

For `@playwright/mcp` in `.mcp.json` or Claude Desktop / Cursor / Codex config:

```json
{
  "mcpServers": {
    "playwright-stealth": {
      "command": "npx",
      "args": ["@playwright/mcp@latest", "--cdp-endpoint", "http://127.0.0.1:9222"],
      "env": {
        "REBROWSER_PATCHES_RUNTIME_FIX_MODE": "addBinding"
      }
    }
  }
}
```

### Option C: Camoufox (C++ Patched Firefox for High-Security Targets)
When Chromium CDP fingerprinting is too aggressive, Camoufox spoofs device properties at the C++ Gecko level and uses Juggler instead of Chromium CDP:

```bash
pip install -U camoufox[geoip]
python3 -m camoufox fetch
```

## 4. Humanized Interaction Helper (JavaScript / CDP)

Use this reference logic when implementing custom agent actions:

```js
export function pickHumanTargetPoint(rect) {
  // Sample inside central 30%..70% region, never exact 50%/50% center
  const rx = 0.3 + Math.random() * 0.4;
  const ry = 0.3 + Math.random() * 0.4;
  return {
    x: Math.round(rect.left + rect.width * rx),
    y: Math.round(rect.top + rect.height * ry)
  };
}

export function generateBezierPath(start, end, steps = 18) {
  const cp1 = {
    x: start.x + (end.x - start.x) * 0.25 + (Math.random() - 0.5) * 60,
    y: start.y + (end.y - start.y) * 0.15 + (Math.random() - 0.5) * 60
  };
  const cp2 = {
    x: start.x + (end.x - start.x) * 0.75 + (Math.random() - 0.5) * 40,
    y: start.y + (end.y - start.y) * 0.85 + (Math.random() - 0.5) * 40
  };
  const points = [];
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    const x = u * u * u * start.x + 3 * u * u * t * cp1.x + 3 * u * t * t * cp2.x + t * t * t * end.x;
    const y = u * u * u * start.y + 3 * u * u * t * cp1.y + 3 * u * t * t * cp2.y + t * t * t * end.y;
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}

export function isVisibleHumanElement(el) {
  if (!el || el.hidden || el.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(el);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    parseFloat(style.opacity) < 0.1 ||
    style.clipPath === 'inset(50%)' ||
    style.clip === 'rect(0px, 0px, 0px, 0px)'
  ) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return (
    rect.width >= 6 &&
    rect.height >= 6 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}
```
