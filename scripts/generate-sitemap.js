const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const origin = "https://www.dipeikehu.com";
const lastmod = "2026-07-11";

const pages = [
  ["/", "weekly", "1.0"],
  ["/services.html", "weekly", "0.9"],
  ["/cities.html", "weekly", "0.9"],
  ["/providers.html", "weekly", "0.8"],
  ["/business.html", "weekly", "0.8"],
  ["/city-companion.html", "weekly", "0.8"],
  ["/travel-guide.html", "weekly", "0.8"],
  ["/errands.html", "weekly", "0.8"],
  ["/expo.html", "weekly", "0.8"],
  ["/airport.html", "weekly", "0.8"],
  ["/beijing.html", "weekly", "0.8"],
  ["/shanghai.html", "weekly", "0.8"],
  ["/guangzhou.html", "weekly", "0.8"],
  ["/shenzhen.html", "weekly", "0.8"],
  ["/chengdu.html", "weekly", "0.8"],
  ["/hangzhou.html", "weekly", "0.8"],
  ["/xian.html", "weekly", "0.8"],
  ["/chongqing.html", "weekly", "0.7"],
  ["/booking-rule.html", "monthly", "0.7"],
  ["/order.html", "monthly", "0.7"],
  ["/contact.html", "monthly", "0.7"],
  ["/help.html", "monthly", "0.6"],
  ["/announcements.html", "weekly", "0.6"],
  ["/provider-center.html", "monthly", "0.6"],
  ["/provider-rule.html", "monthly", "0.6"],
  ["/feedback.html", "monthly", "0.5"],
  ["/report.html", "monthly", "0.5"],
  ["/privacy.html", "yearly", "0.4"],
  ["/terms.html", "yearly", "0.4"],
  ["/safety.html", "yearly", "0.4"],
  ["/about.html", "yearly", "0.4"]
];

const entries = pages.map(([pathname, changefreq, priority]) => `  <url>
    <loc>${origin}${pathname}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

fs.writeFileSync(path.join(root, "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap with ${pages.length} URLs.`);
