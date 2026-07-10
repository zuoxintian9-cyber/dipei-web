const crypto = require("crypto");

const BASE_APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const BASE_APP_URL = process.env.FEISHU_BASE_URL || `https://my.feishu.cn/base/${BASE_APP_TOKEN}`;

const RISK_WORDS = [
  "色情",
  "特殊服务",
  "陪睡",
  "裸聊",
  "私下交易",
  "加微信绕平台",
  "绕开平台",
  "违法交易",
  "代办违法证件",
  "查别人隐私",
  "偷拍",
  "赌博",
  "约炮",
  "援交",
  "包养",
  "嫖",
  "卖淫",
  "夜陪",
  "小姐",
  "包夜"
];

const REQUIRED_FIELDS = {
  "用户预约需求表": ["customerName", "phone", "city", "service", "date", "detail"],
  "服务者入驻申请表": ["name", "phone", "wechat", "city", "serviceArea", "serviceType", "availableTime", "price", "billingType", "intro"],
  "投诉举报表": ["complainantName", "contact", "target", "detail"],
  "客户咨询线索表": ["name", "contact", "city", "detail"]
};

const TABLE_CONFIG = {
  "用户预约需求表": {
    env: "FEISHU_TABLE_BOOKING",
    name: "用户预约需求表",
    idPrefix: "DP",
    idField: "预约编号",
    notifyEnv: "FEISHU_NOTIFY_BOOKING_WEBHOOK",
    notifySecretEnv: "FEISHU_NOTIFY_BOOKING_SECRET",
    buildFields: buildBookingFields
  },
  "服务者入驻申请表": {
    env: "FEISHU_TABLE_PROVIDER_APPLY",
    name: "服务者入驻申请表",
    idPrefix: "FWZ",
    idField: "申请编号",
    notifyEnv: "FEISHU_NOTIFY_PROVIDER_WEBHOOK",
    notifySecretEnv: "FEISHU_NOTIFY_PROVIDER_SECRET",
    buildFields: buildProviderFields
  },
  "投诉举报表": {
    env: "FEISHU_TABLE_REPORT",
    name: "投诉举报表",
    idPrefix: "TS",
    idField: "投诉编号",
    notifyEnv: "FEISHU_NOTIFY_REPORT_WEBHOOK",
    notifySecretEnv: "FEISHU_NOTIFY_REPORT_SECRET",
    buildFields: buildReportFields
  },
  "客户咨询线索表": {
    env: "FEISHU_TABLE_CONSULT",
    name: "客户咨询线索表",
    idPrefix: "ZX",
    idField: "线索编号",
    notifyEnv: "FEISHU_NOTIFY_CONSULT_WEBHOOK",
    notifySecretEnv: "FEISHU_NOTIFY_CONSULT_SECRET",
    buildFields: buildConsultFields
  }
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateStore = new Map();

function clean(value, fallback = "") {
  return String(value ?? fallback).replace(/[<>]/g, "").trim();
}

function localSubmitTime() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    })
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function submitTime(payload) {
  return clean(payload.提交时间) || localSubmitTime();
}

function localDateStamp() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}${parts.month}${parts.day}`;
}

function todayInputValue() {
  const stamp = localDateStamp();
  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
}

function publicId(prefix) {
  const timePart = Date.now().toString().slice(-4);
  const randomPart = crypto.randomInt(0, 100).toString().padStart(2, "0");
  return `${prefix}${localDateStamp()}${timePart}${randomPart}`;
}

function requestKey(req, payload) {
  const forwardedFor = clean(req.headers["x-forwarded-for"]).split(",")[0].trim();
  const ip = forwardedFor || req.socket?.remoteAddress || "unknown";
  const contact = clean(payload.phone || payload.contact || payload.wechat || payload.customerName || payload.name || payload.complainantName);
  return `${ip}:${contact}`;
}

function checkRateLimit(req, payload) {
  const now = Date.now();
  const key = requestKey(req, payload);
  const recent = (rateStore.get(key) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateStore.set(key, recent);
  return recent.length <= RATE_LIMIT_MAX;
}

function hasRiskContent(value) {
  const text = clean(value).toLowerCase();
  return RISK_WORDS.some((word) => text.includes(word.toLowerCase()));
}

function riskyValues(payload) {
  const ignore = new Set([
    "表单类型",
    "formType",
    "type",
    "来源页面",
    "sourcePage",
    "source",
    "提交时间",
    "处理状态",
    "website",
    "companyWebsite",
    "phone",
    "contact",
    "wechat",
    "customerName",
    "name",
    "complainantName",
    "consent"
  ]);
  return Object.entries(payload)
    .filter(([key]) => !ignore.has(key))
    .map(([, value]) => value);
}

function validatePayload(formType, payload) {
  if (clean(payload.website || payload.companyWebsite)) {
    return { ok: false, status: 400, code: "SPAM_REJECTED", message: "提交异常，请刷新页面后重试" };
  }

  const required = REQUIRED_FIELDS[formType] || [];
  const missing = required.filter((key) => !clean(payload[key]));
  if (missing.length) {
    return { ok: false, status: 400, code: "MISSING_REQUIRED_FIELDS", message: "请完整填写必填项", missing };
  }

  const phone = clean(payload.phone || payload.contact);
  if (payload.phone && !/^1[3-9]\d{9}$/.test(phone)) {
    return { ok: false, status: 400, code: "INVALID_PHONE", message: "手机号格式不正确" };
  }

  if (formType === "用户预约需求表" && clean(payload.date) && clean(payload.date) < todayInputValue()) {
    return { ok: false, status: 400, code: "INVALID_DATE", message: "预约日期不能早于今天" };
  }

  if (formType !== "投诉举报表" && riskyValues(payload).some(hasRiskContent)) {
    return { ok: false, status: 422, code: "RISK_CONTENT_REJECTED", message: "当前内容可能涉及违规服务，请修改后再提交。" };
  }

  return { ok: true };
}

function splitTags(value) {
  return clean(value)
    .split(/[、,，/;\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value) {
  const parsed = Number(String(value ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFeishuDate(value) {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00+08:00`);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

function compactFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    })
  );
}

function withSource(payload, fields) {
  return compactFields({
    ...fields,
    提交时间: submitTime(payload),
    来源页面: clean(payload.来源页面 || payload.sourcePage || payload.source || payload.来源页)
  });
}

function buildBookingFields(payload) {
  return withSource(payload, {
    预约编号: clean(payload.publicId),
    "客户姓名/称呼": clean(payload.customerName),
    手机号: clean(payload.phone),
    微信号: clean(payload.wechat),
    所在城市: clean(payload.city),
    服务区域: clean(payload.area),
    服务类型: clean(payload.service),
    预约日期: toFeishuDate(payload.date),
    预约时间段: clean(payload.timeSlot),
    服务时长: clean(payload.duration),
    人数: toNumber(payload.people),
    预算范围: clean(payload.budgetRange),
    具体需求: clean(payload.detail),
    是否需要外语: clean(payload.languageNeed, "不需要"),
    是否需要接送: clean(payload.pickupNeed, "不需要"),
    跟进状态: "新线索"
  });
}

function buildProviderFields(payload) {
  return compactFields({
    申请编号: clean(payload.publicId),
    提交时间: submitTime(payload),
    "姓名/昵称": clean(payload.name),
    手机号: clean(payload.phone),
    微信号: clean(payload.wechat),
    性别: clean(payload.gender),
    年龄段: clean(payload.ageRange),
    所在城市: clean(payload.city),
    可服务区域: splitTags(payload.serviceArea),
    服务类型: splitTags(payload.serviceType),
    可服务时间: splitTags(payload.availableTime),
    起步价格: toNumber(payload.price),
    计费方式: clean(payload.billingType),
    个人介绍: clean(payload.intro),
    擅长内容: splitTags(payload.strengths),
    语言能力: splitTags(payload.languages),
    身份认证状态: "未认证",
    审核状态: "待审核",
    是否进入服务者库: false
  });
}

function buildReportFields(payload) {
  const complaintDetail = [clean(payload.detail), clean(payload.needCallback) ? `回访需求：${clean(payload.needCallback)}` : ""].filter(Boolean).join("\n");
  return compactFields({
    投诉编号: clean(payload.publicId),
    提交时间: submitTime(payload),
    "投诉人姓名/称呼": clean(payload.complainantName),
    联系方式: clean(payload.contact || payload.phone),
    关联订单: clean(payload.orderRef),
    被投诉对象: clean(payload.target),
    投诉类型: clean(payload.topic || payload.reportType),
    相关城市: clean(payload.city),
    投诉内容: complaintDetail,
    "证据附件说明/链接": clean(payload.evidenceNote),
    处理状态: "待处理",
    风险等级: clean(payload.riskLevel, "中")
  });
}

function normalizeConsultTopic(topic) {
  const rawTopic = clean(topic);
  const topicMap = {
    订单进度: "预约咨询",
    紧急预约: "预约咨询",
    服务者资料补充: "入驻合作",
    服务者中心: "入驻合作",
    服务反馈: "其他",
    投诉处理: "其他",
    用户注册: "其他",
    登录帮助: "其他",
    账号中心: "其他",
    订单列表协助: "预约咨询"
  };
  return topicMap[rawTopic] || rawTopic || "其他";
}

function buildConsultFields(payload) {
  const rawTopic = clean(payload.topic);
  const normalizedTopic = normalizeConsultTopic(rawTopic);
  const refs = [
    rawTopic && rawTopic !== normalizedTopic ? `入口类型：${rawTopic}` : "",
    clean(payload.orderRef) ? `关联订单：${clean(payload.orderRef)}` : "",
    clean(payload.providerRef) ? `服务者/申请编号：${clean(payload.providerRef)}` : "",
    clean(payload.serviceType) ? `服务类型：${clean(payload.serviceType)}` : "",
    clean(payload.serviceDate) ? `服务日期：${clean(payload.serviceDate)}` : "",
    clean(payload.rating) ? `体验评分：${clean(payload.rating)}` : "",
    clean(payload.wouldRecommend) ? `是否愿意推荐：${clean(payload.wouldRecommend)}` : "",
    clean(payload.accountRole) ? `账号类型：${clean(payload.accountRole)}` : "",
    clean(payload.accountAction) ? `账号事项：${clean(payload.accountAction)}` : "",
    clean(payload.preferredTime) ? `期望联系时间：${clean(payload.preferredTime)}` : ""
  ].filter(Boolean);
  const detail = clean(payload.detail || rawTopic);
  return compactFields({
    线索编号: clean(payload.publicId),
    提交时间: submitTime(payload),
    客户称呼: clean(payload.name),
    联系方式: clean(payload.contact),
    咨询城市: clean(payload.city),
    咨询类型: normalizedTopic,
    咨询内容: rawTopic && rawTopic !== normalizedTopic ? `【${rawTopic}】${detail}` : detail,
    来源页面: clean(payload.来源页面 || payload.sourcePage || payload.source),
    跟进状态: "待联系",
    备注: refs.join("\n")
  });
}

function field(fields, name, fallback = "未填写") {
  return clean(fields[name], fallback);
}

function formatDate(value) {
  if (!value) return "未填写";
  const date = new Date(Number(value));
  if (Number.isNaN(date.getTime())) return clean(value, "未填写");
  return date.toLocaleDateString("zh-CN", { timeZone: "Asia/Shanghai" });
}

function truncate(value, maxLength = 160) {
  const text = clean(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function buildNotificationText(config, fields, recordId) {
  const header = `【地陪客户网】${config.name}新增记录`;
  const trackingId = config.idField ? clean(fields[config.idField]) : "";
  const common = [trackingId ? `编号：${trackingId}` : "", `记录ID：${recordId || "未返回"}`, `后台：${BASE_APP_URL}`].filter(Boolean);

  if (config.name === "用户预约需求表") {
    return [
      header,
      `城市：${field(fields, "所在城市")}`,
      `服务类型：${field(fields, "服务类型")}`,
      `预约日期：${formatDate(fields.预约日期)}`,
      `客户：${field(fields, "客户姓名/称呼")}`,
      `手机：${field(fields, "手机号")}`,
      `微信：${field(fields, "微信号")}`,
      `需求：${truncate(fields.具体需求)}`,
      ...common
    ].join("\n");
  }

  if (config.name === "服务者入驻申请表") {
    return [
      header,
      `城市：${field(fields, "所在城市")}`,
      `服务类型：${Array.isArray(fields.服务类型) ? fields.服务类型.join("、") : field(fields, "服务类型")}`,
      `姓名：${field(fields, "姓名/昵称")}`,
      `手机：${field(fields, "手机号")}`,
      `微信：${field(fields, "微信号")}`,
      `介绍：${truncate(fields.个人介绍)}`,
      ...common
    ].join("\n");
  }

  if (config.name === "投诉举报表") {
    return [
      header,
      `风险等级：${field(fields, "风险等级")}`,
      `投诉类型：${field(fields, "投诉类型")}`,
      `投诉人：${field(fields, "投诉人姓名/称呼")}`,
      `联系方式：${field(fields, "联系方式")}`,
      `被投诉对象：${field(fields, "被投诉对象")}`,
      `内容：${truncate(fields.投诉内容)}`,
      ...common
    ].join("\n");
  }

  const notes = clean(fields.备注);
  return [
    header,
    `城市：${field(fields, "咨询城市")}`,
    `咨询类型：${field(fields, "咨询类型")}`,
    `客户：${field(fields, "客户称呼")}`,
    `联系方式：${field(fields, "联系方式")}`,
    `内容：${truncate(fields.咨询内容)}`,
    notes ? `备注：${notes}` : "",
    ...common
  ].filter(Boolean).join("\n");
}

function signFeishuBot(timestamp, secret) {
  const stringToSign = `${timestamp}\n${secret}`;
  return crypto.createHmac("sha256", stringToSign).update("").digest("base64");
}

async function sendNotification(config, fields, recordId) {
  const webhook = clean(process.env[config.notifyEnv] || process.env.FEISHU_NOTIFY_WEBHOOK || process.env.FEISHU_BOT_WEBHOOK);
  if (!webhook) return false;

  const secret = clean(process.env[config.notifySecretEnv] || process.env.FEISHU_NOTIFY_SECRET || process.env.FEISHU_BOT_SECRET);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const body = {
    msg_type: "text",
    content: {
      text: buildNotificationText(config, fields, recordId)
    }
  };
  if (secret) {
    body.timestamp = timestamp;
    body.sign = signFeishuBot(timestamp, secret);
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const result = await response.json().catch(() => ({}));
  const okCode = result.code === 0 || result.StatusCode === 0 || result.status_code === 0;
  if (!response.ok || !okCode) {
    throw new Error(result.msg || result.StatusMessage || response.statusText || "飞书机器人通知失败");
  }
  return true;
}

async function feishuFetch(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.code !== 0) {
    const message = body.msg || body.error || response.statusText;
    throw new Error(message);
  }
  return body;
}

async function getTenantToken() {
  const appId = process.env.FEISHU_APP_ID;
  const appSecret = process.env.FEISHU_APP_SECRET;
  if (!appId || !appSecret || !BASE_APP_TOKEN) {
    return null;
  }

  const body = await feishuFetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret
    })
  });
  return body.tenant_access_token;
}

async function listTables(token) {
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function listFields(token, tableId) {
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${tableId}/fields?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function filterKnownFields(token, tableId, fields) {
  const existingFields = await listFields(token, tableId);
  const existingNames = new Set(existingFields.map((item) => item.field_name || item.name));
  return Object.fromEntries(Object.entries(fields).filter(([name]) => existingNames.has(name)));
}

async function resolveTableId(token, config) {
  const envTableId = process.env[config.env];
  if (envTableId) return envTableId;

  const tables = await listTables(token);
  const table = tables.find((item) => item.name === config.name);
  return table?.table_id || "";
}

async function createRecord(token, tableId, fields) {
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${tableId}/records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });
  return body.data?.record;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED" });
    return;
  }

  try {
    const payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const formType = payload["表单类型"] || payload.formType || payload.type;
    const config = TABLE_CONFIG[formType];
    if (!config) {
      res.status(400).json({ ok: false, code: "UNKNOWN_FORM_TYPE", message: "未知表单类型" });
      return;
    }
    const validation = validatePayload(formType, payload);
    if (!validation.ok) {
      res.status(validation.status).json(validation);
      return;
    }
    if (!checkRateLimit(req, payload)) {
      res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "提交过于频繁，请稍后再试。" });
      return;
    }

    const token = await getTenantToken();
    if (!token) {
      res.status(503).json({
        ok: false,
        code: "FEISHU_NOT_CONFIGURED",
        message: "飞书应用凭证未配置",
        requiredEnv: ["FEISHU_APP_ID", "FEISHU_APP_SECRET", "FEISHU_BASE_APP_TOKEN", config.env]
      });
      return;
    }

    const tableId = await resolveTableId(token, config);
    if (!tableId) {
      res.status(503).json({
        ok: false,
        code: "FEISHU_TABLE_NOT_FOUND",
        message: `未找到飞书表：${config.name}`,
        requiredEnv: [config.env]
      });
      return;
    }

    payload.publicId = publicId(config.idPrefix);
    const fields = config.buildFields(payload);
    const writableFields = await filterKnownFields(token, tableId, fields);
    const record = await createRecord(token, tableId, writableFields);
    const recordId = record?.record_id || "";
    let notified = false;
    try {
      notified = await sendNotification(config, fields, recordId);
    } catch (notifyError) {
      console.error("Feishu notification failed:", notifyError.message);
    }
    res.status(200).json({ ok: true, table: config.name, recordId, publicId: payload.publicId, trackingNo: payload.publicId, notified });
  } catch (error) {
    res.status(500).json({ ok: false, code: "FEISHU_SUBMIT_FAILED", message: error.message });
  }
};
