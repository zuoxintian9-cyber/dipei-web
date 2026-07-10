const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const host = "www.dipeikehu.com";
const key = "0db518ac198571f15c00955ca1347b2a";
const keyLocation = `https://${host}/${key}.txt`;

async function main() {
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
  const urlList = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map((match) => match[1]);
  if (!urlList.length) throw new Error("sitemap.xml 中没有可提交的 URL");

  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": "dipeikehu-indexing/1.0"
    },
    body: JSON.stringify({ host, key, keyLocation, urlList })
  });

  if (![200, 202].includes(response.status)) {
    const body = await response.text();
    throw new Error(`IndexNow 提交失败：HTTP ${response.status} ${body}`);
  }
  console.log(`IndexNow accepted ${urlList.length} URLs with HTTP ${response.status}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
