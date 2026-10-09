// Regenerates the PNG icons and the social preview image.
// Requires Node.js and Playwright:  npm i -D playwright && npx playwright install chromium
// Run from the repository root:      node tools/render-images.mjs
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const browser = await chromium.launch();
const page = await browser.newPage();

// Social preview image (1200×630)
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto("file://" + resolve(root, "tools/og-image.html"));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "assets/img/og-image.png" });

// PNG favicons from the SVG favicon
const svg = readFileSync(resolve(root, "assets/img/favicon.svg"), "utf8");
for (const [size, file] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`
  );
  await page.screenshot({ path: `assets/img/${file}`, omitBackground: true });
}

await browser.close();
console.log("Wrote assets/img/og-image.png, favicon-32.png, apple-touch-icon.png");
