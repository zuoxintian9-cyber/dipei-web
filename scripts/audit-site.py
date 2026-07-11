from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {".git", ".vercel", ".agents", "00_项目工作台"}
EXPECTED_LANDINGS = {
    "beijing.html", "shanghai.html", "guangzhou.html", "shenzhen.html",
    "chengdu.html", "hangzhou.html", "xian.html", "chongqing.html",
    "business.html", "city-companion.html", "travel-guide.html",
    "errands.html", "expo.html", "airport.html",
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.attrs: list[tuple[str, dict[str, str]]] = []
        self.ids: list[str] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.tag_counts: dict[str, int] = {}
        self.forms: list[dict[str, object]] = []
        self.current_form: dict[str, object] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        self.attrs.append((tag, values))
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        if values.get("id"):
            self.ids.append(values["id"])
        if tag == "title":
            self.in_title = True
        if tag == "form":
            self.current_form = {"attrs": values, "controls": []}
        elif self.current_form is not None and tag in {"input", "select", "textarea", "button"}:
            self.current_form["controls"].append((tag, values))

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self.in_title = False
        if tag == "form" and self.current_form is not None:
            self.forms.append(self.current_form)
            self.current_form = None

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)


def resolve_local(page: Path, value: str) -> tuple[Path, str] | None:
    if not value or value.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parsed = urlsplit(value)
    if parsed.scheme or parsed.netloc:
        return None
    raw_path = unquote(parsed.path)
    if not raw_path:
        target = page
    elif raw_path.startswith("/"):
        target = ROOT / raw_path.lstrip("/")
    else:
        target = page.parent / raw_path
    if raw_path.endswith("/") or target == ROOT:
        target = target / "index.html"
    return target.resolve(), parsed.fragment


def main() -> int:
    errors: list[str] = []
    html_files = sorted(ROOT.glob("*.html"))
    parsed_pages: dict[Path, PageParser] = {}

    for page in html_files:
        text = page.read_text(encoding="utf-8")
        parser = PageParser()
        parser.feed(text)
        parsed_pages[page.resolve()] = parser

        title = "".join(parser.title_parts).strip()
        if not title:
            errors.append(f"{page.name}: 缺少 title")
        expected_h1 = 0 if page.name == "provider.html" else 1
        if parser.tag_counts.get("h1", 0) != expected_h1:
            errors.append(f"{page.name}: h1 数量不正确")
        if len(parser.ids) != len(set(parser.ids)):
            duplicates = sorted({item for item in parser.ids if parser.ids.count(item) > 1})
            errors.append(f"{page.name}: 重复 id {duplicates}")

        metas = [attrs for tag, attrs in parser.attrs if tag == "meta"]
        if not any(meta.get("name") == "viewport" for meta in metas):
            errors.append(f"{page.name}: 缺少 viewport")
        if page.name != "404.html" and not any(
            tag == "link" and attrs.get("rel") == "canonical" for tag, attrs in parser.attrs
        ):
            errors.append(f"{page.name}: 缺少 canonical")
        if not any(meta.get("name") == "description" and meta.get("content") for meta in metas):
            errors.append(f"{page.name}: 缺少 description")

        canonical_links = [attrs.get("href", "") for tag, attrs in parser.attrs if tag == "link" and attrs.get("rel") == "canonical"]
        if len(canonical_links) > 1:
            errors.append(f"{page.name}: canonical 重复")
        if canonical_links and page.name != "index.html" and urlsplit(canonical_links[0]).path != f"/{page.name}":
            errors.append(f"{page.name}: canonical 与文件路径不一致")

        for tag, attrs in parser.attrs:
            if tag == "img" and "alt" not in attrs:
                errors.append(f"{page.name}: 图片缺少 alt")
            if any(name.lower().startswith("on") for name in attrs):
                errors.append(f"{page.name}: 存在内联事件处理器")
            if tag == "script" and not attrs.get("src"):
                errors.append(f"{page.name}: 存在内联脚本，不符合 CSP")
            if attrs.get("target") == "_blank" and "noopener" not in attrs.get("rel", ""):
                errors.append(f"{page.name}: 新窗口链接缺少 noopener")

        for form in parser.forms:
            attrs = form["attrs"]
            controls = form["controls"]
            if "data-lead-form" not in attrs:
                continue
            if attrs.get("data-lead-type") not in {"用户预约需求表", "服务者入驻申请表", "投诉举报表", "客户咨询线索表"}:
                errors.append(f"{page.name}: 表单类型不受支持")
            if "novalidate" not in attrs:
                errors.append(f"{page.name}: 线索表单缺少统一校验标记")
            names = [control_attrs.get("name", "") for _, control_attrs in controls]
            if "website" not in names or "consent" not in names:
                errors.append(f"{page.name}: 线索表单缺少蜜罐或协议勾选")
            submit_buttons = [control_attrs for tag, control_attrs in controls if tag == "button" and control_attrs.get("type") == "submit"]
            if len(submit_buttons) != 1:
                errors.append(f"{page.name}: 线索表单应只有一个提交按钮")

        for tag, attrs in parser.attrs:
            for attr in ("href", "src"):
                resolved = resolve_local(page, attrs.get(attr, ""))
                if not resolved:
                    continue
                target, fragment = resolved
                if not target.exists():
                    errors.append(f"{page.name}: {attr} 指向不存在文件 {attrs[attr]}")
                    continue
                if fragment and target.suffix.lower() == ".html":
                    target_parser = parsed_pages.get(target)
                    if target_parser is None:
                        target_parser = PageParser()
                        target_parser.feed(target.read_text(encoding="utf-8"))
                        parsed_pages[target] = target_parser
                    if fragment not in target_parser.ids:
                        errors.append(f"{page.name}: 锚点不存在 {attrs[attr]}")

    for filename in ("site.webmanifest", "vercel.json"):
        try:
            json.loads((ROOT / filename).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            errors.append(f"{filename}: JSON 无效 ({exc})")

    sitemap = ET.parse(ROOT / "sitemap.xml")
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemap_urls = [node.text or "" for node in sitemap.findall("sm:url/sm:loc", namespace)]
    sitemap_names = {urlsplit(url).path.lstrip("/") or "index.html" for url in sitemap_urls}
    missing_landings = sorted(EXPECTED_LANDINGS - sitemap_names)
    if missing_landings:
        errors.append(f"sitemap.xml: 缺少落地页 {missing_landings}")
    if any("?" in url or "/provider.html" in url for url in sitemap_urls):
        errors.append("sitemap.xml: 包含动态服务能力详情 URL")

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    if "Disallow: /api/" not in robots or "Sitemap: https://www.dipeikehu.com/sitemap.xml" not in robots:
        errors.append("robots.txt: API 屏蔽或站点地图声明缺失")

    public_claim_files = html_files + [ROOT / "app.js", ROOT / "providers.js"]
    public_text = "\n".join(path.read_text(encoding="utf-8") for path in public_claim_files)
    for claim in ("已认证服务者", "已审核｜3 年", "已审核｜4 年", "已审核｜5 年"):
        if claim in public_text:
            errors.append(f"公开内容仍包含无记录支撑的声明：{claim}")

    secret_file = ROOT / "111.txt"
    if secret_file.exists():
        secret_values: set[str] = set()
        for line in secret_file.read_text(encoding="utf-8", errors="ignore").splitlines():
            parts = re.split(r"[:=]", line, maxsplit=1)
            candidate = (parts[1] if len(parts) == 2 else parts[0]).strip().strip('"\'')
            if len(candidate) >= 16:
                secret_values.add(candidate)
        deployable_parts: list[str] = []
        for path in ROOT.rglob("*"):
            if not path.is_file() or path == secret_file or any(part in SKIP_DIRS for part in path.parts):
                continue
            if path.suffix.lower() in {".html", ".js", ".css", ".json", ".xml", ".txt"}:
                deployable_parts.append(path.read_text(encoding="utf-8", errors="ignore"))
        deployable_text = "\n".join(deployable_parts)
        if any(value in deployable_text for value in secret_values):
            errors.append("部署文件中检测到 111.txt 的敏感值")

    if errors:
        print("Site audit failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(
        f"Site audit passed: {len(html_files)} HTML pages, "
        f"{len(sitemap_urls)} sitemap URLs, {len(EXPECTED_LANDINGS)} SEO landing pages."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
