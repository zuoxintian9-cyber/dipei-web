const crypto = require("crypto");

const BASE_APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const MAX_REQUEST_BYTES = 2048;
const rateStore = new Map();
let tokenCache = { value: "", expiresAt: 0 };
let tableCache = { items: [], expiresAt: 0 };

const BOOKING_STATUS = {
  新线索: ["预约已提交", 1, "active", "预约已经进入运营后台，客服会在工作时间内核对。"],
  已联系: ["客服已联系", 2, "active", "客服已开始核对时间、区域和具体服务边界。"],
  待匹配: ["正在匹配服务者", 3, "active", "需求已通过初步核对，平台正在匹配可服务人员。"],
  已报价: ["服务方案待确认", 3, "active", "客服已整理服务方案，请留意原手机号或微信的联系信息。"],
  已成交: ["服务安排已确认", 4, "active", "服务安排已经确认，请按客服发送的时间和地点执行。"],
  服务完成: ["服务已完成", 5, "complete", "服务记录已完成，可通过服务反馈或投诉举报入口继续反馈。"],
  无效: ["预约未能受理", 1, "closed", "当前预约无法继续推进，具体原因请通过人工协助入口核验。"]
};

const ORDER_STATUS = {
  待确认: ["客服确认中", 2, "active", "客服正在确认服务安排和具体执行信息。"],
  已报价: ["服务方案待确认", 3, "active", "服务方案已整理，请留意客服通过原联系方式发送的信息。"],
  客户已确认: ["服务安排已确认", 4, "active", "你已确认服务方案，平台正在完成执行安排。"],
  已收定金: ["服务安排已确认", 4, "active", "服务安排已经确认，请按客服发送的注意事项准备。"],
  已分配服务者: ["已匹配服务者", 4, "active", "平台已经完成服务者匹配，请留意客服发送的集合信息。"],
  服务中: ["服务进行中", 4, "active", "当前服务正在进行，如遇异常请及时进入投诉举报页面。"],
  服务完成: ["服务已完成", 5, "complete", "服务已经完成，欢迎提交服务反馈。"],
  已回访: ["服务已完成并回访", 5, "complete", "服务和回访均已完成，感谢你的反馈。"],
  已取消: ["预约已取消", 2, "closed", "该服务安排已取消，如需重新预约请再次提交需求。"]
};

function clean(value) {
  return String(value ?? "")
    .replace(/[<>\u0000-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, "")
    .trim();
}

function normalizePhone(value) {
  return clean(value).replace(/[^\d]/g, "");
}

function requestIp(req) {
  return clean(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"]).split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function hasJsonContentType(req) {
  return clean(req.headers["content-type"]).toLowerCase().split(";", 1)[0] === "application/json";
}

function requestTooLarge(req) {
  const length = Number(req.headers["content-length"] || 0);
  return Number.isFinite(length) && length > MAX_REQUEST_BYTES;
}

function bodyTooLarge(req) {
  try {
    const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    return Buffer.byteLength(raw, "utf8") > MAX_REQUEST_BYTES;
  } catch {
    return true;
  }
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasAllowedOrigin(req) {
  const origin = clean(req.headers.origin);
  if (!origin) return true;
  try {
    const url = new URL(origin);
    const host = url.hostname.toLowerCase();
    const productionHosts = new Set(["www.dipeikehu.com", "dipeikehu.com", "dipei-web.vercel.app"]);
    const isProjectDeployment = host.startsWith("dipei-")
      && host.endsWith("-zuoxintian9-7231s-projects.vercel.app");
    return (url.protocol === "https:" && (productionHosts.has(host) || isProjectDeployment))
      || (url.protocol === "http:" && (host === "127.0.0.1" || host === "localhost"));
  } catch {
    return false;
  }
}

function withinRateLimit(req) {
  const now = Date.now();
  const key = requestIp(req);
  const recent = (rateStore.get(key) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateStore.set(key, recent);
  if (rateStore.size > 5000) {
    for (const [storedKey, times] of rateStore) {
      if (!times.some((time) => now - time < RATE_LIMIT_WINDOW_MS)) rateStore.delete(storedKey);
    }
    while (rateStore.size > 5000) rateStore.delete(rateStore.keys().next().value);
  }
  return recent.length <= RATE_LIMIT_MAX;
}

function safeEqual(left, right) {
  const a = Buffer.from(clean(left));
  const b = Buffer.from(clean(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function fieldText(value) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map(fieldText).filter(Boolean).join("、");
  if (typeof value === "object") {
    if ("text" in value) return fieldText(value.text);
    if ("name" in value) return fieldText(value.name);
    if ("value" in value) return fieldText(value.value);
    return Object.values(value).map(fieldText).filter(Boolean).join("、");
  }
  return clean(value);
}

function dateText(value) {
  if (!value) return "待客服确认";
  const number = Number(value);
  const date = Number.isFinite(number) ? new Date(number < 10_000_000_000 ? number * 1000 : number) : new Date(value);
  if (Number.isNaN(date.getTime())) return clean(value) || "待客服确认";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const signal = options.signal || (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(timeoutMs) : undefined);
  return fetch(url, { ...options, signal });
}

async function feishuFetch(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.code !== 0) {
    throw new Error(body.msg || body.error || response.statusText || "飞书接口请求失败");
  }
  return body;
}

async function getTenantToken() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  if (!appId || !appSecret || !BASE_APP_TOKEN) return "";
  if (tokenCache.value && tokenCache.expiresAt > Date.now()) return tokenCache.value;
  const body = await feishuFetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  tokenCache = { value: body.tenant_access_token || "", expiresAt: Date.now() + 60 * 60 * 1000 };
  return tokenCache.value;
}

async function listTables(token) {
  if (tableCache.items.length && tableCache.expiresAt > Date.now()) return tableCache.items;
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  tableCache = { items: body.data?.items || [], expiresAt: Date.now() + 10 * 60 * 1000 };
  return tableCache.items;
}

async function searchRecords(token, tableId, fieldNames, filter, pageSize = 20) {
  const body = await feishuFetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${tableId}/records/search?page_size=${pageSize}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ field_names: fieldNames, filter, automatic_fields: false })
    }
  );
  return body.data?.items || [];
}

async function findBookingByTrackingNo(token, tableId, trackingNo) {
  const records = await searchRecords(
    token,
    tableId,
    ["预约编号", "手机号", "所在城市", "服务类型", "预约日期", "跟进状态"],
    { conjunction: "and", conditions: [{ field_name: "预约编号", operator: "is", value: [trackingNo] }] },
    2
  );
  return records.find((record) => fieldText(record.fields?.预约编号) === trackingNo) || null;
}

async function findOrderByBooking(token, tableId, booking) {
  try {
    const records = await searchRecords(
      token,
      tableId,
      ["订单编号", "关联预约需求", "订单状态", "服务城市", "服务类型", "服务日期"],
      { conjunction: "and", conditions: [{ field_name: "关联预约需求", operator: "contains", value: [booking.record_id] }] },
      5
    );
    return records[0] || null;
  } catch (error) {
    console.warn("Order relation lookup skipped:", error.message);
    return null;
  }
}

function statusData(booking, order) {
  const orderStatus = fieldText(order?.fields?.订单状态);
  const bookingStatus = fieldText(booking.fields?.跟进状态) || "新线索";
  const [label, step, tone, message] = (orderStatus && ORDER_STATUS[orderStatus]) || BOOKING_STATUS[bookingStatus] || BOOKING_STATUS.新线索;
  return { label, step, tone, message };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, nosnippet");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "仅支持提交查询" });
    return;
  }

  if (!hasAllowedOrigin(req)) {
    res.status(403).json({ ok: false, code: "ORIGIN_REJECTED", message: "请求来源不受支持" });
    return;
  }
  if (!hasJsonContentType(req)) {
    res.status(415).json({ ok: false, code: "UNSUPPORTED_MEDIA_TYPE", message: "仅支持 JSON 请求" });
    return;
  }
  if (requestTooLarge(req) || ((typeof req.body === "string" || Buffer.isBuffer(req.body)) && bodyTooLarge(req))) {
    res.status(413).json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "查询内容过长。" });
    return;
  }

  if (!withinRateLimit(req)) {
    res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "查询次数过多，请稍后再试。" });
    return;
  }

  try {
    let payload;
    try {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    } catch {
      res.status(400).json({ ok: false, code: "INVALID_JSON", message: "查询数据格式不正确。" });
      return;
    }
    if (!isPlainObject(payload)) {
      res.status(400).json({ ok: false, code: "INVALID_PAYLOAD", message: "查询数据格式不正确。" });
      return;
    }
    if (bodyTooLarge({ body: payload })) {
      res.status(413).json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "查询内容过长。" });
      return;
    }
    const allowedKeys = new Set(["trackingNo", "orderRef", "phone"]);
    if (Object.keys(payload).some((key) => !allowedKeys.has(key)) || Object.values(payload).some((value) => !["string", "number"].includes(typeof value))) {
      res.status(400).json({ ok: false, code: "INVALID_PAYLOAD", message: "查询数据格式不正确。" });
      return;
    }
    const trackingNo = clean(payload.trackingNo || payload.orderRef).toUpperCase();
    const phone = normalizePhone(payload.phone);
    if (!/^DP\d{12,16}$/.test(trackingNo) || !/^1[3-9]\d{9}$/.test(phone)) {
      res.status(400).json({ ok: false, code: "INVALID_QUERY", message: "请填写正确的 DP 预约编号和 11 位手机号。" });
      return;
    }

    const token = await getTenantToken();
    if (!token) {
      res.status(503).json({ ok: false, code: "FEISHU_NOT_CONFIGURED", message: "查询服务暂不可用，请稍后重试。" });
      return;
    }

    let bookingTableId = process.env.FEISHU_TABLE_BOOKING || "";
    let orderTableId = process.env.FEISHU_TABLE_ORDER || "";
    if (!bookingTableId || !orderTableId) {
      const tables = await listTables(token);
      const tableMap = new Map(tables.map((table) => [table.name, table.table_id]));
      bookingTableId ||= tableMap.get("用户预约需求表") || "";
      orderTableId ||= tableMap.get("订单跟进表") || "";
    }
    if (!bookingTableId) {
      res.status(503).json({ ok: false, code: "BOOKING_TABLE_NOT_FOUND", message: "查询服务暂不可用，请稍后重试。" });
      return;
    }

    const booking = await findBookingByTrackingNo(token, bookingTableId, trackingNo);
    const bookingPhone = normalizePhone(fieldText(booking?.fields?.手机号));
    if (!booking || !safeEqual(bookingPhone, phone)) {
      res.status(404).json({ ok: false, code: "BOOKING_NOT_FOUND", message: "未找到匹配的预约，请检查预约编号和提交手机号。" });
      return;
    }

    const order = orderTableId ? await findOrderByBooking(token, orderTableId, booking) : null;
    const status = statusData(booking, order);
    res.status(200).json({
      ok: true,
      trackingNo,
      orderNo: fieldText(order?.fields?.订单编号),
      statusLabel: status.label,
      progressStep: status.step,
      statusTone: status.tone,
      message: status.message,
      city: fieldText(booking.fields?.所在城市) || "待客服确认",
      service: fieldText(booking.fields?.服务类型) || "待客服确认",
      serviceDate: dateText(booking.fields?.预约日期),
      supportNeeded: status.tone === "closed"
    });
  } catch (error) {
    console.error("Order status lookup failed:", error.message);
    res.status(500).json({ ok: false, code: "ORDER_STATUS_FAILED", message: "查询服务暂时繁忙，请稍后重试。" });
  }
};

module.exports._test = { normalizePhone, safeEqual, statusData, hasAllowedOrigin, hasJsonContentType, requestTooLarge, bodyTooLarge };
