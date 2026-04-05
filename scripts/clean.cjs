/**
 * Removes Next / Turbopack output so `npm run dev` cannot serve stale chunks
 * (fixes phantom errors like "useThree is not defined at ToneMappingSetup").
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
for (const name of [".next", ".turbo"]) {
  const p = path.join(root, name);
  try {
    fs.rmSync(p, { recursive: true, force: true });
    process.stdout.write(`removed ${name}\n`);
  } catch {
    /* ignore */
  }
}
