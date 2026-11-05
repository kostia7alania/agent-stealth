# Agent Stealth

Open-source **AI Browser Agent Detector & Stealth Benchmark** plus installable [Agent Skills](https://agentskills.io/) for **Codex**, **Claude in Chrome / Computer Use**, **Kimi (WebBridge / Kimi-CU)**, **Playwright MCP**, **Chrome DevTools MCP**, **`agent-browser`**, and **Browser-Use / Stagehand**.

Открытый детектор браузерных ИИ-агентов и набор навыков беспалевности (`SKILL.md`). Проверяет 16 клиентских сигналов (10 пассивных проверок CDP/DOM/среды + 6 интерактивных проверок физики клика, печати и AXTree-ловушек) и объясняет, почему защищённые сайты (Tinder, Cloudflare, DataDome) мгновенно разлогинивают сессию при подключении ИИ-расширения или MCP.

[Live Detector / Живой стенд](https://kostia7alania.ru/agent-stealth/) · [SKILL.md](skills/agent-stealth/SKILL.md) · [Stealth Playbook](skills/agent-stealth/references/stealth-playbook.md) · [Промпт подключения (RU)](universal-install-prompt.ru.md) · [Install Prompt (EN)](universal-install-prompt.en.md)

## Quick Install / Быстрая установка навыка

Install interactively via the Skills CLI:

```sh
npx skills add kostia7alania/agent-stealth
```

Install `agent-stealth` directly into the current project:

```sh
npx skills add kostia7alania/agent-stealth --skill agent-stealth
```

Install globally for Codex or Claude Code:

```sh
npx skills add kostia7alania/agent-stealth --skill agent-stealth -a codex -g
npx skills add kostia7alania/agent-stealth --skill agent-stealth -a claude-code -g
```

## Why Tinder / Cloudflare / DataDome Log You Out When an AI Agent Attaches

When an AI browser agent or extension (such as Codex browser attach, Claude in Chrome, Playwright MCP, or Chrome DevTools MCP) attaches to an active tab:

1. **`chrome.debugger.attach` & `Runtime.enable`:** Enabling the CDP `Runtime` domain causes V8 to serialize objects passed to `console.debug()` and `console.table()`. Anti-bot heartbeats pass a trap `Error` object with a custom `.stack` getter or a `Proxy` object every 1-3 seconds. When `Runtime.enable` is active, the getter triggers synchronously inside the page context.
2. **Favicon & DOM Mutations:** Extensions that change the tab icon or inject bounding-box overlays (`[data-browser-use]`, `[data-stagehand]`, agent status badges) trip `MutationObserver` watches on `<head>` and `<body>`.
3. **Robotic Input Telemetry:** Clicking the exact geometric center `(left + width/2, top + height/2)` via `@eN` accessibility refs, zero prior `pointermove` events, `<8ms` click dwell time, or `screenY === clientY` under `Input.dispatchMouseEvent`.
4. **AXTree Honeypot Traps:** Visually hidden `1x1px` clipped buttons with enticing `aria-label` instructions that humans never see, but LLMs parsing accessibility snapshots click automatically.

Once tripped, the client-side anti-bot script flags the next API request, the server revokes the session token (`401 Unauthorized`), and the web app immediately logs the user out.

## 16 Real-Time Checks in the Benchmark

### Passive Scan (10 Vectors + 2.5s Heartbeat)
1. **CDP `Runtime.enable` (`Error.stack` Getter Trap):** Catches V8 inspector serialization on `console.debug(err)`.
2. **CDP Inspector (`Proxy` `console.table` Trap):** Catches deep preview inspection on `console.table([proxy])`.
3. **`navigator.webdriver` & Clean Iframe Integrity:** Audits `Navigator.prototype.webdriver` getter `toString()` tampering and cross-iframe leaks.
4. **Automation Globals & `cdc_*` Artifacts:** Scans `window` for `__playwright__binding__`, `__pwInitScripts`, `domAutomation`, `sourceURL`, and ChromeDriver `cdc_*` keys.
5. **DOM & Tab Favicon Mutation:** Live `MutationObserver` watching for extension icon swaps and injected AI overlays.
6. **Headless User-Agent & Client Hints:** Audits `navigator.userAgent` and `navigator.userAgentData.brands`.
7. **WebGL Hardware vs Software Renderer:** Flags `SwiftShader`, `llvmpipe`, and virtualized software renderers.
8. **Window Geometry (`outerHeight` vs `innerHeight`):** Detects zero outer dimensions or frameless headless viewports where `outerHeight === innerHeight`.
9. **Browser Surface (`plugins`, `pdfViewerEnabled`, `window.chrome`):** Verifies standard desktop browser surface APIs.
10. **Tab Focus & Permissions Consistency:** Checks `document.hasFocus()`, `document.visibilityState`, and `Notification.permission` vs `navigator.permissions.query`.

### Interactive Action Sandbox (6 Vectors)
11. **Hardware Event Authenticity (`event.isTrusted`):** Rejects synthetic `.click()` and `.dispatchEvent()`.
12. **CDP `Input.dispatchMouseEvent` Coordinate Leak:** Detects `screenY === clientY` despite browser toolbar offset or static `pressure === 0.5`.
13. **Bounding-Box Dead-Center Click (`@eN` Ref Signature):** Flags clicks within `<0.8px` of exact mathematical center `(left + width/2, top + height/2)`.
14. **Mouse Pre-Click Trail & Press Dwell Time:** Flags cursor teleportation (`<2` prior `pointermove` events) and `<8ms` press duration.
15. **Keystroke Cadence & Input Chain:** Detects direct `.value` injection without `keydown` events or zero-variance robotic typing intervals.
16. **AXTree Honeypot Trap:** Detects when an AI agent clicks an off-screen/clipped accessibility node invisible to humans.

## Verification

Run the built-in repository check:

```sh
node scripts/check.mjs
```

## License

[MIT](LICENSE)
