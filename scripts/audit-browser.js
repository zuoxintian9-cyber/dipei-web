const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium, firefox, webkit } = require("playwright");
const { PNG } = require("pngjs");

const root = path.resolve(__dirname, "..");
const baseUrl = process.env.SITE_URL || "http://127.0.0.1:4173";
const allPages = fs.readdirSync(root).filter((name) => name.endsWith(".html")).sort();
const representativePages = ["index.html", "providers.html", "provider.html?id=beijing-business", "order.html", "report.html", "chongqing.html", "404.html"];
const seoLandingPages = new Set(["beijing.html", "shanghai.html", "guangzhou.html", "shenzhen.html", "chengdu.html", "hangzhou.html", "xian.html", "chongqing.html", "business.html", "city-companion.html", "travel-guide.html", "errands.html", "expo.html", "airport.html"]);
const artifactDir = path.join(os.tmpdir(), "dipei-browser-audit");
const chromePath = process.env.CHROME_PATH || path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe");
const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
fs.mkdirSync(artifactDir, { recursive: true });

async function inspectPage(page, pathname, viewport) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
  const onPageError = (error) => pageErrors.push(error.message);
  const onRequestFailed = (request) => failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText || "failed"}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);

  const response = await page.goto(`${baseUrl}/${pathname === "index.html" ? "" : pathname}`, { waitUntil: "load", timeout: 20000 });
  assert.equal(response?.status(), 200, `${pathname}: HTTP ${response?.status()}`);
  await page.waitForTimeout(pathname === "index.html" ? 450 : 50);

  const result = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const overflowElements = [...document.querySelectorAll("main input:not(.hp-field), main select, main textarea, main button, main article")]
      .filter(visible)
      .filter((element) => {
        if (element.closest(".city-rail")) return false;
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1;
      })
      .slice(0, 10)
      .map((element) => `${element.tagName.toLowerCase()}.${element.className || ""}`);
    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      duplicateIds: [...document.querySelectorAll("[id]")].map((element) => element.id).filter((id, index, values) => values.indexOf(id) !== index),
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src),
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      overflowElements,
      leadFormsWithoutResultRegion: [...document.querySelectorAll("[data-lead-form]")].filter((form) => !form.querySelector(".form-result")).length,
      dateRanges: [...document.querySelectorAll('input[type="date"]:not([data-allow-past="true"])')].map((input) => ({ min: input.min, max: input.max })),
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      robots: document.querySelector('meta[name="robots"]')?.content || "",
      ogImage: document.querySelector('meta[property="og:image"]')?.content || "",
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => node.textContent)
    };
  });

  assert.ok(result.title, `${pathname}: empty title`);
  assert.equal(result.h1Count, 1, `${pathname}: h1 count`);
  assert.deepEqual(result.duplicateIds, [], `${pathname}: duplicate IDs`);
  assert.deepEqual(result.brokenImages, [], `${pathname}: broken images`);
  assert.equal(result.horizontalOverflow, false, `${pathname}: document overflow at ${viewport.width}px`);
  assert.equal(result.overflowElements.length, 0, `${pathname}: visible control overflow at ${viewport.width}px ${JSON.stringify(result.overflowElements)}`);
  assert.ok(result.dateRanges.every((range) => range.min && range.max), `${pathname}: booking date min/max missing`);
  const baseFile = pathname.split("?", 1)[0];
  if (baseFile !== "404.html") assert.ok(result.canonical.startsWith("https://www.dipeikehu.com/"), `${pathname}: canonical missing`);
  if (["404.html", "provider.html"].includes(baseFile)) assert.ok(result.robots.includes("noindex"), `${pathname}: noindex missing`);
  const expectsSchema = baseFile === "index.html" || seoLandingPages.has(baseFile);
  assert.equal(result.jsonLd.length, expectsSchema ? 1 : 0, `${pathname}: structured data count`);
  for (const json of result.jsonLd) assert.doesNotThrow(() => JSON.parse(json), `${pathname}: invalid structured data`);
  if (seoLandingPages.has(baseFile) || baseFile === "index.html") assert.ok(result.ogImage.startsWith("https://"), `${pathname}: og:image missing`);
  if (baseFile === "index.html") {
    const activeScene = page.locator(".city-image-layer.is-active");
    assert.equal(await activeScene.count(), 1, `${pathname}: active city image count`);
    const canvasPng = PNG.sync.read(await activeScene.screenshot({ animations: "disabled" }));
    let minimum = 255;
    let maximum = 0;
    for (let index = 0; index < canvasPng.data.length; index += 64) {
      const luminance = (canvasPng.data[index] + canvasPng.data[index + 1] + canvasPng.data[index + 2]) / 3;
      minimum = Math.min(minimum, luminance);
      maximum = Math.max(maximum, luminance);
    }
    assert.ok(maximum > 24 && maximum - minimum > 18, `${pathname}: city image pixels are blank at ${viewport.width}px`);
  }
  assert.equal(consoleErrors.length, 0, `${pathname}: console errors ${JSON.stringify(consoleErrors)}`);
  assert.equal(pageErrors.length, 0, `${pathname}: page errors ${JSON.stringify(pageErrors)}`);
  assert.equal(failedRequests.length, 0, `${pathname}: failed requests ${JSON.stringify(failedRequests)}`);

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
}

async function testInteractions(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/`, { waitUntil: "load" });

  const arrivalIntro = page.locator("#worldIntro:not([hidden])");
  if (await arrivalIntro.count()) {
    await page.getByRole("button", { name: "跳过动画" }).click();
    await arrivalIntro.waitFor({ state: "hidden" });
  }

  const menu = page.getByRole("button", { name: "展开导航" });
  await menu.click();
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await menu.click();
  assert.equal(await menu.getAttribute("aria-expanded"), "false");

  await page.locator('[data-world-city-step="-1"]').click();
  assert.equal(await page.locator("#worldLocationCityName").textContent(), "长沙");
  assert.equal(await page.locator(".world-district-axis").isVisible(), false);
  assert.ok((await page.locator("#worldConfirmLocation").textContent()).includes("长沙"));
  await page.locator("#worldConfirmLocation").click();
  const cityOnlyForm = page.locator("#bookingForm");
  assert.equal(await cityOnlyForm.locator('select[name="city"]').inputValue(), "长沙");
  assert.equal(await cityOnlyForm.locator('input[name="area"]').inputValue(), "");
  await page.locator("#home").scrollIntoViewIfNeeded();
  await page.locator('[data-world-city-step="1"]').click();

  await page.locator('[data-world-city-step="1"]').click();
  assert.equal(await page.locator("#worldLocationCityName").textContent(), "上海");
  await page.locator('[data-world-district-step="1"]').click();
  assert.ok((await page.locator("#worldConfirmLocation").textContent()).includes("黄浦区"));
  await page.locator("#worldConfirmLocation").click();

  const form = page.locator("#bookingForm");
  assert.deepEqual(
    await form.locator("input:not(.hp-field), select, textarea").evaluateAll((elements) => elements.map((element) => element.name)),
    ["area", "customerName", "phone", "city", "service", "date", "detail", "consent"]
  );
  assert.equal(await form.locator('select[name="city"]').inputValue(), "上海");
  assert.equal(await form.locator('input[name="area"]').inputValue(), "黄浦区");
  await form.locator('select[name="city"]').selectOption("武汉");
  assert.equal(await form.locator('input[name="area"]').inputValue(), "");
  const date = form.locator('input[name="date"]');
  assert.ok(await date.getAttribute("max"));

  let apiCalls = 0;
  const countApiCall = (request) => { if (request.url().includes("/api/feishu-submit")) apiCalls += 1; };
  page.on("request", countApiCall);
  await form.locator('input[name="customerName"]').fill("测试客户");
  await form.locator('input[name="phone"]').fill("13800138000");
  await form.locator('select[name="city"]').selectOption("北京");
  await form.locator('select[name="service"]').selectOption("商务接待");
  await date.fill(futureDate);
  await form.locator('textarea[name="detail"]').fill("明确要求私下交易并加微信绕开平台完成服务");
  const consent = form.locator('input[name="consent"]');
  await consent.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await consent.check();
  const submit = form.getByRole("button", { name: "提交预约需求" });
  await submit.evaluate((element) => element.scrollIntoView({ block: "center" }));
  await submit.click();
  assert.equal(apiCalls, 0, "risk content should not reach API");
  assert.ok((await page.locator("#toast").textContent()).includes("违规服务"));
  page.off("request", countApiCall);

  await page.goto(`${baseUrl}/order.html`, { waitUntil: "load" });
  const lookup = page.locator("#orderLookupForm");
  let lookupCalls = 0;
  const countLookup = (request) => { if (request.url().includes("/api/order-status")) lookupCalls += 1; };
  page.on("request", countLookup);
  await lookup.locator('input[name="trackingNo"]').fill("DP123");
  await lookup.locator('input[name="phone"]').fill("123");
  await lookup.getByRole("button", { name: "查询预约进度" }).click();
  assert.equal(lookupCalls, 0, "malformed lookup should not reach API");
  page.off("request", countLookup);
}

async function runBrowser(browserType, name, pages, viewports, launchOptions = {}) {
  let browser;
  try {
    browser = await browserType.launch({ headless: true, ...launchOptions });
  } catch (error) {
    console.log(`${name} skipped: ${error.message.split("\n")[0]}`);
    return { name, skipped: true, checks: 0 };
  }

  let checks = 0;
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      for (const pathname of pages) {
        await inspectPage(page, pathname, viewport);
        checks += 1;
      }
    }
    if (name === "chromium") {
      await testInteractions(page);
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`${baseUrl}/`, { waitUntil: "load" });
      await page.evaluate(() => sessionStorage.removeItem("dipei:world-intro"));
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(1250);
      await page.screenshot({ path: path.join(artifactDir, "home-intro.png"), fullPage: false });
      const skip = page.locator("#worldSkip");
      if (await skip.isVisible()) await skip.click();
      await page.locator("#worldIntro").waitFor({ state: "hidden" });
      await page.goto(`${baseUrl}/`, { waitUntil: "load" });
      await page.screenshot({ path: path.join(artifactDir, "home-desktop.png"), fullPage: false });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.reload({ waitUntil: "load" });
      await page.screenshot({ path: path.join(artifactDir, "home-mobile.png"), fullPage: false });
    }
    await context.close();
  } finally {
    await browser.close();
  }
  return { name, skipped: false, checks };
}

async function main() {
  const results = [];
  results.push(await runBrowser(chromium, "chromium", allPages, [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 430, height: 932 }], fs.existsSync(chromePath) ? { executablePath: chromePath } : {}));
  results.push(await runBrowser(firefox, "firefox", representativePages, [{ width: 1440, height: 900 }, { width: 390, height: 844 }]));
  results.push(await runBrowser(webkit, "webkit", representativePages, [{ width: 1440, height: 900 }, { width: 390, height: 844 }]));
  const completed = results.filter((result) => !result.skipped);
  assert.ok(completed.length >= 1, "No browser engine was available");
  console.log(`Browser audit passed: ${completed.map((result) => `${result.name} ${result.checks}`).join(", ")} page/viewport checks.`);
  console.log(`Screenshots: ${artifactDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
