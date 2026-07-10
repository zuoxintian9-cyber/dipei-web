const crypto = require("crypto");

const BASE_APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const rateStore = new Map();

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
  return String(value ?? "").replace(/[<>]/g, "").trim();
}

function normalizePhone(value) {
  return clean(value).replace(/[^\d]/g, "");
}

function requestIp(req) {
  return clean(req.headers["x-forwarded-for"]).split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function withinRateLimit(req) {
  const now = Date.now();
  const key = requestIp(req);
  const recent = (rateStore.get(key) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateStore.set(key, recent);
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

async function feishuFetch(url, options = {}) {
  const response = await fetch(url, options);
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
  const body = await feishuFetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret })
  });
  return body.tenant_access_token || "";
}

async function listTables(token) {
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function findRecord(token, tableId, predicate) {
  let pageToken = "";
  for (let page = 0; page < 20; page += 1) {
    const query = new URLSearchParams({ page_size: "100" });
    if (pageToken) query.set("page_token", pageToken);
    const body = await feishuFetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${tableId}/records?${query}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const items = body.data?.items || [];
    const match = items.find(predicate);
    if (match) return match;
    if (!body.data?.has_more || !body.data?.page_token) break;
    pageToken = body.data.page_token;
  }
  return null;
}

function statusData(booking, order) {
  const orderStatus = fieldText(order?.fields?.订单状态);
  const bookingStatus = fieldText(booking.fields?.跟进状态) || "新线索";
  const [label, step, tone, message] = (orderStatus && ORDER_STATUS[orderStatus]) || BOOKING_STATUS[bookingStatus] || BOOKING_STATUS.新线索;
  return { label, step, tone, message };
}

function orderMatches(order, booking, trackingNo, phone) {
  const fields = order.fields || {};
  const reference = fieldText(fields.关联预约需求);
  if (reference.includes(trackingNo) || reference.includes(booking.record_id)) return true;

  const samePhone = safeEqual(normalizePhone(fieldText(fields.客户手机号)), phone);
  const sameCity = fieldText(fields.服务城市) === fieldText(booking.fields?.所在城市);
  const sameService = fieldText(fields.服务类型) === fieldText(booking.fields?.服务类型);
  const sameDate = dateText(fields.服务日期) === dateText(booking.fields?.预约日期);
  return samePhone && sameCity && sameService && sameDate;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED", message: "仅支持提交查询" });
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
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
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

    const tables = await listTables(token);
    const tableMap = new Map(tables.map((table) => [table.name, table.table_id]));
    const bookingTableId = process.env.FEISHU_TABLE_BOOKING || tableMap.get("用户预约需求表");
    const orderTableId = process.env.FEISHU_TABLE_ORDER || tableMap.get("订单跟进表");
    if (!bookingTableId) {
      res.status(503).json({ ok: false, code: "BOOKING_TABLE_NOT_FOUND", message: "查询服务暂不可用，请稍后重试。" });
      return;
    }

    const booking = await findRecord(token, bookingTableId, (record) => fieldText(record.fields?.预约编号) === trackingNo);
    const bookingPhone = normalizePhone(fieldText(booking?.fields?.手机号));
    if (!booking || !safeEqual(bookingPhone, phone)) {
      res.status(404).json({ ok: false, code: "BOOKING_NOT_FOUND", message: "未找到匹配的预约，请检查预约编号和提交手机号。" });
      return;
    }

    const order = orderTableId
      ? await findRecord(token, orderTableId, (record) => orderMatches(record, booking, trackingNo, phone))
      : null;
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
