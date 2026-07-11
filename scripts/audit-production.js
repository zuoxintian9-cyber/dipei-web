const assert = require("assert");

const origin = "https://www.dipeikehu.com";

async function checkPublicPages() {
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const urls = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(urls.length, 31);

  const failures = [];
  for (let index = 0; index < urls.length; index += 5) {
    const batch = urls.slice(index, index + 5);
    const results = await Promise.all(batch.map(async (url) => {
      const response = await fetch(url);
      const html = await response.text();
      return { url, response, html };
    }));
    for (const { url, response, html } of results) {
      if (response.status !== 200) failures.push(`${url}: HTTP ${response.status}`);
      if (!response.headers.get("content-type")?.includes("text/html")) failures.push(`${url}: content-type`);
      if (!/<title>[^<]+<\/title>/.test(html)) failures.push(`${url}: title`);
      if (!html.includes('rel="canonical"')) failures.push(`${url}: canonical`);
      if (/已认证服务者|已审核｜[345] 年|service@dipeikehu\.com|gmail\.com/.test(html)) failures.push(`${url}: stale claim/contact`);
    }
  }
  assert.deepEqual(failures, []);
  return urls.length;
}

async function checkHeadersAndErrors() {
  const home = await fetch(`${origin}/`);
  assert.equal(home.status, 200);
  const csp = home.headers.get("content-security-policy") || "";
  assert.ok(csp.includes("script-src-attr 'none'"));
  assert.ok(csp.includes("frame-ancestors 'none'"));
  assert.ok(home.headers.get("strict-transport-security")?.includes("includeSubDomains"));
  assert.equal(home.headers.get("x-frame-options"), "DENY");
  assert.equal(home.headers.get("x-xss-protection"), "0");
  assert.equal(home.headers.get("x-content-type-options"), "nosniff");

  const missing = await fetch(`${origin}/deep/missing/page-audit`);
  const missingHtml = await missing.text();
  assert.equal(missing.status, 404);
  assert.ok(missingHtml.includes("这个页面不存在或已经调整"));
  assert.ok(missingHtml.includes('href="/styles.css"'));

  const key = await fetch(`${origin}/0db518ac198571f15c00955ca1347b2a.txt`);
  assert.equal(key.status, 200);
  const security = await fetch(`${origin}/.well-known/security.txt`);
  assert.equal(security.status, 200);
}

async function post(path, options = {}) {
  return fetch(`${origin}${path}`, { method: "POST", redirect: "manual", ...options });
}

async function checkApiGuards() {
  const noType = await post("/api/feishu-submit", { body: "{}" });
  assert.equal(noType.status, 415);

  const badOrigin = await post("/api/feishu-submit", {
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: "{}"
  });
  assert.equal(badOrigin.status, 403);

  const malformed = await post("/api/feishu-submit", {
    headers: { "Content-Type": "application/json" },
    body: "{bad-json"
  });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.headers.get("cache-control"), "no-store, max-age=0");
  assert.equal(malformed.headers.get("x-robots-tag"), "noindex, nofollow, nosnippet");

  const orderNoType = await post("/api/order-status", { body: "{}" });
  assert.equal(orderNoType.status, 415);
  const orderBadOrigin = await post("/api/order-status", {
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: "{}"
  });
  assert.equal(orderBadOrigin.status, 403);
}

async function main() {
  const pageCount = await checkPublicPages();
  await checkHeadersAndErrors();
  await checkApiGuards();
  console.log(`Production audit passed: ${pageCount} public URLs, nested 404, security headers and API guards.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
