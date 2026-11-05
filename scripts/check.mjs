import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();

const requiredFiles = [
  "index.html",
  "styles.css",
  "detector.js",
  "README.md",
  "AGENTS.md",
  "LICENSE",
  "universal-install-prompt.ru.md",
  "universal-install-prompt.en.md",
  "skills/agent-stealth/SKILL.md",
  "skills/agent-stealth/references/stealth-playbook.md"
];

for (const rel of requiredFiles) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    throw new Error(`Missing required file: ${rel}`);
  }
}

// Validate detector.js syntax
const jsSource = fs.readFileSync(path.join(root, "detector.js"), "utf8");
new vm.Script(jsSource, { filename: "detector.js" });

// Validate SKILL.md frontmatter
const skillMd = fs.readFileSync(path.join(root, "skills/agent-stealth/SKILL.md"), "utf8");
if (!skillMd.startsWith("---\nname: agent-stealth\ndescription:")) {
  throw new Error("skills/agent-stealth/SKILL.md is missing valid YAML frontmatter");
}

// Validate index.html required landmarks and IDs
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const requiredIds = [
  'id="main-title"',
  'id="passive-grid"',
  'id="interactive-grid"',
  'id="verify-action-btn"',
  'id="verify-input"',
  'id="axtree-honeypot-btn"',
  'id="live-announcer"',
  '<meta name="color-scheme" content="light dark">'
];

for (const token of requiredIds) {
  if (!html.includes(token)) {
    throw new Error(`index.html is missing required token: ${token}`);
  }
}

console.log("OK: All files, JS syntax, skill frontmatter, and HTML landmarks verified.");
