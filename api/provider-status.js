const crypto = require("crypto");

const BASE_APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 12;
const MAX_BYTES = 2048;
const rateStore = new Map();
let tokenCache = { value: "", expiresAt: 0 };
let tableCache = { items: [], expiresAt: 0 };

const STATUS = {
  待审核: ["等待平台审核", "active", "申请已进入运营后台，平台会核验资料真实性和服务边界。"],
  资料不完整: ["需要补充资料", "active", "当前资料暂不完整，请通过下方资料补充入口完善信息。"],
  初审通过: ["初审已通过", "active", "基础资料已通过初审，平台将继续核验身份和服务能力。"],
  复审通过: ["复审已通过", "complete", "申请已通过复审，具体展示和接单安排以客服通知为准。"],
  拒绝: ["申请未通过", "closed", "当前申请未通过审核，具体原因请通过人工协助入口核验。"],
  黑名单: ["申请已终止", "closed", "当前申请无法继续处理，如有异议请通过投诉或人工协助入口反馈。"]
};

function clean(value) {
  return String(value ?? "").replace(/[<>\u0000-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, "").trim();
}

function ip(req) {
  return clean(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"]).split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function allowedOrigin(req) {
  const origin = clean(req.headers.origin);
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    const production = new Set(["www.dipeikehu.com", "dipeikehu.com", "dipei-web.vercel.app"]);
    const deployment = host.startsWith("dipei-") && host.endsWith("-zuoxintian9-7231s-projects.vercel.app");
    return (url.protocol === "https:" && (production.has(host) || deployment))
      || (url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(host));
  } catch {
    return false;
  }
}

function withinRate(req) {
  const now = Date.now();
  const key = ip(req);
  const recent = (rateStore.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  rateStore.set(key, recent);
  return recent.length <= RATE_MAX;
}

function safeEqual(left, right) {
  const a = Buffer.from(clean(left));
  const b = Buffer.from(clean(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function fieldText(value) {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(fieldText).filter(Boolean).join("、");
  if (typeof value === "object") return fieldText(value.text ?? value.name ?? value.value ?? Object.values(value));
  return clean(value);
}

async function feishuFetch(url, options = {}) {
  const signal = typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined;
  const response = await fetch(url, { ...options, signal });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.code !== 0) throw new Error(body.msg || body.error || response.statusText || "飞书接口请求失败");
  return body;
}

async function tenantToken() {
  if (tokenCache.value && tokenCache.expiresAt > Date.now()) return tokenCache.value;
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  if (!appId || !appSecret || !BASE_APP_TOKEN) return "";
  const body = await feishuFetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  tokenCache = { value: body.tenant_access_token || "", expiresAt: Date.now() + 60 * 60 * 1000 };
  return tokenCache.value;
}

async function providerTableId(token) {
  if (process.env.FEISHU_TABLE_PROVIDER_APPLY) return process.env.FEISHU_TABLE_PROVIDER_APPLY;
  if (!tableCache.items.length || tableCache.expiresAt <= Date.now()) {
    const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables?page_size=100`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    tableCache = { items: body.data?.items || [], expiresAt: Date.now() + 10 * 60 * 1000 };
  }
  return tableCache.items.find((table) => table.name === "服务者入驻申请表")?.table_id || "";
}

async function findApplication(token, tableId, applicationNo) {
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${tableId}/records/search?page_size=2`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      field_names: ["申请编号", "手机号", "所在城市", "服务类型", "提交时间", "审核状态", "身份认证状态"],
      filter: { conjunction: "and", conditions: [{ field_name: "申请编号", operator: "is", value: [applicationNo] }] },
      automatic_fields: false
    })
  });
  return (body.data?.items || []).find((record) => fieldText(record.fields?.申请编号) === applicationNo) || null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, nosnippet");
  if (req.method !== "POST") return res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "仅支持提交查询" });
  if (!allowedOrigin(req)) return res.status(403).json({ ok: false, code: "ORIGIN_REJECTED", message: "请求来源不受支持" });
  if (clean(req.headers["content-type"]).toLowerCase().split(";", 1)[0] !== "application/json") return res.status(415).json({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE", message: "仅支持 JSON 请求" });
  if (Number(req.headers["content-length"] || 0) > MAX_BYTES) return res.status(413).json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "查询内容过长" });
  if (!withinRate(req)) return res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "查询次数过多，请稍后再试" });

  try {
    let payload;
    try {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    } catch {
      return res.status(400).json({ ok: false, code: "INVALID_JSON", message: "查询数据格式不正确" });
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return res.status(400).json({ ok: false, code: "INVALID_PAYLOAD", message: "查询数据格式不正确" });
    if (Buffer.byteLength(JSON.stringify(payload), "utf8") > MAX_BYTES) return res.status(413).json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "查询内容过长" });
    if (Object.keys(payload).some((key) => !["applicationNo", "providerRef", "phone"].includes(key))) return res.status(400).json({ ok: false, code: "INVALID_PAYLOAD", message: "查询数据格式不正确" });
    if (Object.values(payload).some((value) => !["string", "number"].includes(typeof value))) return res.status(400).json({ ok: false, code: "INVALID_PAYLOAD", message: "查询数据格式不正确" });
    const applicationNo = clean(payload.applicationNo || payload.providerRef).toUpperCase();
    const phone = clean(payload.phone).replace(/\D/g, "");
    if (!/^FWZ\d{16}$/.test(applicationNo) || !/^1[3-9]\d{9}$/.test(phone)) return res.status(400).json({ ok: false, code: "INVALID_QUERY", message: "请填写正确的 FWZ 申请编号和 11 位手机号" });

    const token = await tenantToken();
    const tableId = token ? await providerTableId(token) : "";
    if (!token || !tableId) return res.status(503).json({ ok: false, code: "PROVIDER_QUERY_NOT_CONFIGURED", message: "查询服务暂不可用，请稍后重试" });
    const application = await findApplication(token, tableId, applicationNo);
    if (!application || !safeEqual(fieldText(application.fields?.手机号).replace(/\D/g, ""), phone)) return res.status(404).json({ ok: false, code: "APPLICATION_NOT_FOUND", message: "未找到匹配的申请记录，请核对编号和手机号" });

    const status = fieldText(application.fields?.审核状态) || "待审核";
    const [statusLabel, tone, message] = STATUS[status] || STATUS.待审核;
    return res.status(200).json({
      ok: true,
      applicationNo,
      status,
      statusLabel,
      tone,
      message,
      city: fieldText(application.fields?.所在城市) || "待确认",
      serviceType: fieldText(application.fields?.服务类型) || "待确认",
      identityStatus: fieldText(application.fields?.身份认证状态) || "未认证"
    });
  } catch (error) {
    console.error("Provider status failed:", error.message);
    return res.status(500).json({ ok: false, code: "PROVIDER_STATUS_FAILED", message: "查询服务暂时繁忙，请稍后重试" });
  }
};

module.exports._test = { allowedOrigin, safeEqual, fieldText };
