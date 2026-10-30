import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const base = process.argv[2] || "http://127.0.0.1:4321";
const output = process.argv[3] || "../../work/qa";
await mkdir(output, { recursive: true });
const codes = [
  "en",
  "zh-hans",
  "zh-hant",
  "ja",
  "ko",
  "fr",
  "de",
  "es",
  "pt-br",
  "ru",
  "ar",
  "id",
  "th",
  "vi",
];
const browser = await chromium.launch({ headless: true });
const report = {
  base,
  checkedAt: new Date().toISOString(),
  pages: [],
  accessibility: [],
  interaction: {},
  screenshots: [],
};
try {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const code of codes) {
      const copy = JSON.parse(await readFile(`src/data/${code}.json`, "utf8"));
      for (const kind of ["", "privacy/", "support/"]) {
        const path = (code === "en" ? "/" : `/${code}/`) + kind;
        const response = await page.goto(base + path, {
          waitUntil: "networkidle",
        });
        assert.equal(response.status(), 200, path + " HTTP");
        await page.evaluate(async () => {
          for (const image of document.images) {
            image.loading = "eager";
            await image.decode().catch(() => {});
          }
        });
        const details = await page.evaluate(() => ({
          lang: document.documentElement.lang,
          dir: document.documentElement.dir,
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          images: [...document.images]
            .filter((i) => !i.complete || !i.naturalWidth)
            .map((i) => i.src),
          canonical: document
            .querySelector("link[rel=canonical]")
            ?.getAttribute("href"),
        }));
        assert.equal(details.lang, copy.lang, path + " lang");
        assert.equal(details.dir, copy.dir, path + " dir");
        assert(
          details.scrollWidth <= details.width + 1,
          `${path}: overflow at ${viewport.width}, scroll width ${details.scrollWidth}`,
        );
        assert.deepEqual(
          await page
            .locator("img")
            .evaluateAll((imgs) =>
              imgs.filter((i) => !i.naturalWidth).map((i) => i.src),
            ),
          [],
          path + " images",
        );
        const expected = (code === "en" ? "/" : `/${code}/`) + kind;
        assert.equal(
          await page.locator("#language").inputValue(),
          expected,
          path + " selected language",
        );
        report.pages.push({
          path,
          viewport: viewport.width,
          status: response.status(),
          ...details,
        });
      }
    }
    for (const [path, name] of [
      ["/", "en-home"],
      ["/zh-hans/", "zh-home"],
      ["/ar/", "ar-home"],
      ["/privacy/", "en-privacy"],
      ["/ar/support/", "ar-support"],
    ]) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(async () => {
        for (const i of document.images) {
          i.loading = "eager";
          await i.decode().catch(() => {});
        }
      });
      const file = `${name}-${viewport.width}.png`;
      await page.screenshot({ path: `${output}/${file}`, fullPage: true });
      report.screenshots.push(file);
    }
    for (const path of [
      "/",
      "/privacy/",
      "/support/",
      "/ar/",
      "/ar/privacy/",
      "/ar/support/",
    ]) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      report.accessibility.push({
        path,
        viewport: viewport.width,
        violations: result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
    }
    assert.deepEqual(errors, [], "browser errors");
    await context.close();
  }
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.goto(base + "/", { waitUntil: "networkidle" });
  assert.equal(
    await page.locator("[data-demo]").getAttribute("data-paused"),
    "true",
  );
  assert(await page.locator("[data-burst]").isDisabled());
  assert.equal(
    await page.locator("[data-toggle]").getAttribute("aria-pressed"),
    "true",
  );
  await page.locator("[data-toggle]").focus();
  await page.keyboard.press("Enter");
  assert.equal(
    await page.locator("[data-demo]").getAttribute("data-paused"),
    "false",
  );
  await page.locator("[data-burst]").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(100);
  const painted = await page.locator("canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    return d.some((v, i) => i % 4 === 3 && v > 0);
  });
  assert(painted, "keyboard burst must draw");
  await page.locator("[data-toggle]").click();
  const cleared = await page.locator("canvas").evaluate((c) => {
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    return !d.some((v, i) => i % 4 === 3 && v > 0);
  });
  assert(cleared, "pause clears canvas");
  await page.screenshot({
    path: `${output}/en-reduced-motion.png`,
    fullPage: true,
  });
  await page.goto(base + "/zh-hans/support/");
  await page.locator("#language").selectOption("/ar/support/");
  await page.waitForURL("**/ar/support/");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.locator("#language").selectOption("/fr/support/");
  await page.waitForURL("**/fr/support/");
  const missing = await page.goto(base + "/this-page-does-not-exist/");
  assert.equal(missing.status(), 404);
  assert(await page.locator("main").innerText());
  report.interaction = {
    reducedMotionStartsPaused: true,
    keyboardPlayAndBurst: true,
    pauseClearsCanvas: true,
    languagePreservesSupportPage: true,
    arabicRTL: true,
    custom404: true,
  };
  const violations = report.accessibility.flatMap((x) =>
    x.violations.map((v) => ({ ...v, path: x.path, viewport: x.viewport })),
  );
  report.summary = {
    pageChecks: report.pages.length,
    uniquePages: 42,
    viewports: [1440, 390],
    axeChecks: report.accessibility.length,
    axeViolations: violations.length,
  };
  await writeFile(
    `${output}/report.json`,
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report.summary));
  if (violations.length) {
    console.log(JSON.stringify(violations, null, 2));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
