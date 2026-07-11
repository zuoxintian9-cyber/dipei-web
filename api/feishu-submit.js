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
  "用户预约需求表": ["customerName", "phone", "city", "service", "date", "detail", "协议同意"],
  "服务者入驻申请表": ["name", "phone", "wechat", "city", "serviceArea", "serviceType", "availableTime", "price", "billingType", "intro", "协议同意"],
  "投诉举报表": ["complainantName", "contact", "topic", "target", "city", "riskLevel", "detail", "协议同意"],
  "客户咨询线索表": ["name", "contact", "topic", "city", "detail", "协议同意"]
};

const OPEN_CITIES = new Set(["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"]);
const SERVICE_TYPES = new Set(["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"]);
const BILLING_TYPES = new Set(["小时", "半天", "全天", "按次沟通"]);
const REPORT_RISK_LEVELS = new Set(["低", "中", "高", "严重"]);
const PROVIDER_GENDERS = new Set(["", "男", "女", "不便透露"]);
const PROVIDER_AGE_RANGES = new Set(["", "18-24", "25-30", "31-40", "41以上"]);
const FEEDBACK_RATINGS = new Set(["5 分 - 很满意", "4 分 - 满意", "3 分 - 一般", "2 分 - 不满意", "1 分 - 很不满意"]);
const RECOMMEND_OPTIONS = new Set(["愿意推荐", "暂不确定", "不愿意推荐"]);
const MAX_REQUEST_BYTES = 16 * 1024;

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
const RATE_LIMIT_MAX_PER_IP = 12;
const RATE_LIMIT_MAX_PER_CONTACT = 5;
const rateStore = new Map();
let tokenCache = { value: "", expiresAt: 0 };
let tableCache = { items: [], expiresAt: 0 };
const fieldCache = new Map();

const FIELD_MAX_LENGTHS = {
  表单类型: 30,
  formType: 30,
  type: 30,
  website: 200,
  companyWebsite: 200,
  consent: 20,
  customerName: 30,
  name: 30,
  complainantName: 30,
  phone: 20,
  contact: 80,
  wechat: 50,
  city: 30,
  area: 80,
  service: 40,
  serviceArea: 120,
  serviceType: 120,
  availableTime: 120,
  billingType: 30,
  price: 30,
  date: 20,
  timeSlot: 40,
  duration: 40,
  people: 20,
  budgetRange: 50,
  languageNeed: 80,
  pickupNeed: 80,
  target: 120,
  needCallback: 30,
  orderRef: 40,
  providerRef: 40,
  preferredTime: 40,
  topic: 60,
  reportType: 60,
  accountRole: 40,
  accountAction: 40,
  evidenceNote: 500,
  strengths: 120,
  languages: 120,
  detail: 800,
  intro: 1000,
  source: 200,
  sourcePage: 200,
  来源页面: 200,
  提交时间: 40,
  处理状态: 20,
  协议同意: 20,
  gender: 20,
  ageRange: 20,
  riskLevel: 20,
  rating: 20,
  wouldRecommend: 20,
  serviceDate: 20
};

const ALLOWED_PAYLOAD_FIELDS = new Set([
  ...Object.keys(FIELD_MAX_LENGTHS),
  "表单类型", "formType", "type", "website", "companyWebsite", "consent"
]);
const MULTILINE_FIELDS = new Set(["detail", "intro", "evidenceNote"]);

function clean(value, fallback = "") {
  return String(value ?? fallback)
    .replace(/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

function requestIp(req) {
  return clean(req.headers["x-vercel-forwarded-for"] || req.headers["x-forwarded-for"])
    .split(",")[0]
    .trim() || req.socket?.remoteAddress || "unknown";
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

function hasOnlyScalarValues(payload) {
  return Object.values(payload).every((value) => value === null || ["string", "number", "boolean"].includes(typeof value));
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
  return localSubmitTime();
}

function localDateStamp(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}${parts.month}${parts.day}`;
}

function todayInputValue() {
  const stamp = localDateStamp();
  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
}

function maxBookingDateInput() {
  const date = new Date(Date.now() + 366 * 24 * 60 * 60 * 1000);
  const stamp = localDateStamp(date);
  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
}

function isValidDateInput(value) {
  const text = clean(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function publicId(prefix) {
  const randomValue = BigInt(`0x${crypto.randomBytes(8).toString("hex")}`) % 10000000000000000n;
  return `${prefix}${randomValue.toString().padStart(16, "0")}`;
}

function requestKeys(req, payload) {
  const contact = clean(payload.phone || payload.contact || payload.wechat || payload.customerName || payload.name || payload.complainantName);
  const contactHash = crypto.createHash("sha256").update(contact || "unknown").digest("hex");
  return { ip: `ip:${requestIp(req)}`, contact: `contact:${contactHash}` };
}

function checkRateBucket(key, max, now) {
  const recent = (rateStore.get(key) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateStore.set(key, recent);
  if (rateStore.size > 5000) {
    for (const [storedKey, times] of rateStore) {
      if (!times.some((time) => now - time < RATE_LIMIT_WINDOW_MS)) rateStore.delete(storedKey);
    }
    while (rateStore.size > 5000) rateStore.delete(rateStore.keys().next().value);
  }
  return recent.length <= max;
}

function checkIpRateLimit(req) {
  return checkRateBucket(`ip:${requestIp(req)}`, RATE_LIMIT_MAX_PER_IP, Date.now());
}

function checkContactRateLimit(payload) {
  const contact = clean(payload.phone || payload.contact || payload.wechat || payload.customerName || payload.name || payload.complainantName);
  const hash = crypto.createHash("sha256").update(contact || "unknown").digest("hex");
  return checkRateBucket(`contact:${hash}`, RATE_LIMIT_MAX_PER_CONTACT, Date.now());
}

function checkRateLimit(req, payload) {
  const now = Date.now();
  const keys = requestKeys(req, payload);
  return checkRateBucket(keys.ip, RATE_LIMIT_MAX_PER_IP, now)
    && checkRateBucket(keys.contact, RATE_LIMIT_MAX_PER_CONTACT, now);
}

function hasRiskContent(value) {
  const text = clean(value).toLowerCase();
  return RISK_WORDS.some((word) => text.includes(word.toLowerCase()));
}

function isContactValueValid(value) {
  const contact = clean(value);
  return /^1[3-9]\d{9}$/.test(contact)
    || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
    || /^[a-zA-Z0-9][-_a-zA-Z0-9]{4,29}$/.test(contact);
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
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, status: 400, code: "INVALID_PAYLOAD", message: "提交数据格式不正确" };
  }

  if (clean(payload.website || payload.companyWebsite)) {
    return { ok: false, status: 400, code: "SPAM_REJECTED", message: "提交异常，请刷新页面后重试" };
  }

  if (!hasOnlyScalarValues(payload)) {
    return { ok: false, status: 400, code: "INVALID_FIELD_TYPE", message: "提交字段类型不正确" };
  }

  const unexpected = Object.keys(payload).filter((key) => !ALLOWED_PAYLOAD_FIELDS.has(key));
  if (unexpected.length) {
    return { ok: false, status: 400, code: "UNEXPECTED_FIELDS", message: "提交包含未支持的字段" };
  }

  const multilineSingleField = Object.entries(payload).find(([key, value]) => !MULTILINE_FIELDS.has(key) && /[\r\n]/.test(String(value ?? "")));
  if (multilineSingleField) {
    return { ok: false, status: 400, code: "INVALID_LINE_BREAK", message: "单行字段不能包含换行" };
  }

  const required = REQUIRED_FIELDS[formType] || [];
  const missing = required.filter((key) => !clean(payload[key]));
  if (missing.length) {
    return { ok: false, status: 400, code: "MISSING_REQUIRED_FIELDS", message: "请完整填写必填项", missing };
  }

  if (clean(payload.协议同意) !== "已阅读并同意") {
    return { ok: false, status: 400, code: "CONSENT_REQUIRED", message: "请先阅读并同意相关协议" };
  }

  const phone = clean(payload.phone || payload.contact);
  if (payload.phone && !/^1[3-9]\d{9}$/.test(phone)) {
    return { ok: false, status: 400, code: "INVALID_PHONE", message: "手机号格式不正确" };
  }
  if (payload.contact && !isContactValueValid(payload.contact)) {
    return { ok: false, status: 400, code: "INVALID_CONTACT", message: "联系方式格式不正确" };
  }
  if (payload.wechat && !isContactValueValid(payload.wechat)) {
    return { ok: false, status: 400, code: "INVALID_WECHAT", message: "微信号格式不正确" };
  }

  if (payload.serviceType && !SERVICE_TYPES.has(clean(payload.serviceType))) {
    return { ok: false, status: 400, code: "INVALID_SERVICE_TYPE", message: "服务类型不正确" };
  }
  if (payload.serviceDate && !isValidDateInput(payload.serviceDate)) {
    return { ok: false, status: 400, code: "INVALID_SERVICE_DATE", message: "服务日期格式不正确" };
  }
  if (payload.rating && !FEEDBACK_RATINGS.has(clean(payload.rating))) {
    return { ok: false, status: 400, code: "INVALID_RATING", message: "评分选项不正确" };
  }
  if (payload.wouldRecommend && !RECOMMEND_OPTIONS.has(clean(payload.wouldRecommend))) {
    return { ok: false, status: 400, code: "INVALID_RECOMMEND_OPTION", message: "推荐选项不正确" };
  }
  if (payload.people !== undefined && clean(payload.people) !== "") {
    const people = Number(clean(payload.people));
    if (!Number.isInteger(people) || people < 1 || people > 99) {
      return { ok: false, status: 400, code: "INVALID_PEOPLE", message: "人数应为 1 到 99 之间的整数" };
    }
  }

  const oversized = Object.entries(FIELD_MAX_LENGTHS).find(([key, max]) => clean(payload[key]).length > max);
  if (oversized) {
    return { ok: false, status: 400, code: "FIELD_TOO_LONG", message: "部分内容超过长度限制，请精简后重试", field: oversized[0] };
  }

  const totalLength = Object.values(payload).reduce((sum, value) => sum + clean(Array.isArray(value) ? value.join(",") : value).length, 0);
  if (totalLength > 5000) {
    return { ok: false, status: 413, code: "PAYLOAD_TOO_LARGE", message: "提交内容过长，请精简后重试" };
  }

  const detailLength = clean(payload.detail).length;
  if (formType !== "服务者入驻申请表" && detailLength < 12) {
    return { ok: false, status: 400, code: "DETAIL_TOO_SHORT", message: "具体说明至少需要 12 个字" };
  }

  if (formType === "用户预约需求表") {
    if (!OPEN_CITIES.has(clean(payload.city)) || !SERVICE_TYPES.has(clean(payload.service))) {
      return { ok: false, status: 400, code: "INVALID_BOOKING_OPTION", message: "请选择当前支持的城市和服务类型" };
    }
    const date = clean(payload.date);
    if (!isValidDateInput(date) || date < todayInputValue() || date > maxBookingDateInput()) {
      return { ok: false, status: 400, code: "INVALID_DATE", message: "请选择今天起一年内的有效预约日期" };
    }
  }

  if (formType === "服务者入驻申请表") {
    if (!OPEN_CITIES.has(clean(payload.city)) || !SERVICE_TYPES.has(clean(payload.serviceType)) || !BILLING_TYPES.has(clean(payload.billingType))) {
      return { ok: false, status: 400, code: "INVALID_PROVIDER_OPTION", message: "请选择当前支持的城市、服务类型和计费方式" };
    }
    const price = Number(clean(payload.price));
    if (!Number.isInteger(price) || price < 1 || price > 100000) {
      return { ok: false, status: 400, code: "INVALID_PRICE", message: "起步价格应为 1 到 100000 之间的整数" };
    }
    if (clean(payload.intro).length < 20) {
      return { ok: false, status: 400, code: "INTRO_TOO_SHORT", message: "服务介绍至少需要 20 个字" };
    }
    if (!PROVIDER_GENDERS.has(clean(payload.gender)) || !PROVIDER_AGE_RANGES.has(clean(payload.ageRange))) {
      return { ok: false, status: 400, code: "INVALID_PROVIDER_PROFILE", message: "性别或年龄段选项不正确" };
    }
  }

  if (formType === "投诉举报表" && payload.riskLevel && !REPORT_RISK_LEVELS.has(clean(payload.riskLevel))) {
    return { ok: false, status: 400, code: "INVALID_RISK_LEVEL", message: "风险等级不正确" };
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

function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const signal = options.signal || (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(timeoutMs) : undefined);
  return fetch(url, { ...options, signal });
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

  const response = await fetchWithTimeout(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  }, 5000);
  const result = await response.json().catch(() => ({}));
  const okCode = result.code === 0 || result.StatusCode === 0 || result.status_code === 0;
  if (!response.ok || !okCode) {
    throw new Error(result.msg || result.StatusMessage || response.statusText || "飞书机器人通知失败");
  }
  return true;
}

async function feishuFetch(url, options = {}) {
  const response = await fetchWithTimeout(url, options);
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
  if (tokenCache.value && tokenCache.expiresAt > Date.now()) return tokenCache.value;

  const body = await feishuFetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret
    })
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

async function listFields(token, tableId) {
  const cached = fieldCache.get(tableId);
  if (cached?.expiresAt > Date.now()) return cached.items;
  const body = await feishuFetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${BASE_APP_TOKEN}/tables/${tableId}/fields?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const items = body.data?.items || [];
  fieldCache.set(tableId, { items, expiresAt: Date.now() + 10 * 60 * 1000 });
  return items;
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
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ fields })
  });
  return body.data?.record;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, nosnippet");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED" });
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
  if (requestTooLarge(req) || bodyTooLarge(req)) {
    res.status(413).json({ ok: false, code: "PAYLOAD_TOO_LARGE", message: "提交内容过长，请精简后重试" });
    return;
  }
  if (!checkIpRateLimit(req)) {
    res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "提交过于频繁，请稍后再试。" });
    return;
  }

  try {
    let payload;
    try {
      payload = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    } catch {
      res.status(400).json({ ok: false, code: "INVALID_JSON", message: "提交数据格式不正确" });
      return;
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      res.status(400).json({ ok: false, code: "INVALID_PAYLOAD", message: "提交数据格式不正确" });
      return;
    }
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
    if (!checkContactRateLimit(payload)) {
      res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "提交过于频繁，请稍后再试。" });
      return;
    }

    const token = await getTenantToken();
    if (!token) {
      res.status(503).json({
        ok: false,
        code: "FEISHU_NOT_CONFIGURED",
        message: "提交服务暂时不可用，请稍后重试"
      });
      return;
    }

    const tableId = await resolveTableId(token, config);
    if (!tableId) {
      res.status(503).json({
        ok: false,
        code: "FEISHU_TABLE_NOT_FOUND",
        message: "提交服务暂时不可用，请稍后重试"
      });
      return;
    }

    payload.publicId = publicId(config.idPrefix);
    const fields = config.buildFields(payload);
    const writableFields = await filterKnownFields(token, tableId, fields);
    if (!writableFields[config.idField] || Object.keys(writableFields).length < 3) {
      throw new Error("飞书数据表字段配置不完整");
    }
    const record = await createRecord(token, tableId, writableFields);
    const recordId = record?.record_id || "";
    if (!recordId) throw new Error("飞书未返回记录 ID");
    let notified = false;
    try {
      notified = await sendNotification(config, fields, recordId);
    } catch (notifyError) {
      console.error("Feishu notification failed:", notifyError.message);
    }
    res.status(200).json({ ok: true, publicId: payload.publicId, trackingNo: payload.publicId });
  } catch (error) {
    console.error("Feishu submission failed:", error.message);
    res.status(500).json({ ok: false, code: "FEISHU_SUBMIT_FAILED", message: "提交服务暂时繁忙，请稍后重试" });
  }
};

module.exports._test = {
  validatePayload,
  publicId,
  checkRateLimit,
  hasAllowedOrigin,
  hasJsonContentType,
  requestTooLarge,
  bodyTooLarge,
  submitTime
};
