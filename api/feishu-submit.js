const BASE_APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";

const TABLE_CONFIG = {
  "用户预约需求表": {
    env: "FEISHU_TABLE_BOOKING",
    name: "用户预约需求表",
    buildFields: buildBookingFields
  },
  "服务者入驻申请表": {
    env: "FEISHU_TABLE_PROVIDER_APPLY",
    name: "服务者入驻申请表",
    buildFields: buildProviderFields
  },
  "投诉举报表": {
    env: "FEISHU_TABLE_REPORT",
    name: "投诉举报表",
    buildFields: buildReportFields
  },
  "客户咨询线索表": {
    env: "FEISHU_TABLE_CONSULT",
    name: "客户咨询线索表",
    buildFields: buildConsultFields
  }
};

function clean(value, fallback = "") {
  return String(value ?? fallback).trim();
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
    来源页面: clean(payload.来源页面 || payload.sourcePage || payload.source || payload.来源页),
    备注: clean(payload.area) ? `服务区域：${clean(payload.area)}` : undefined
  });
}

function buildBookingFields(payload) {
  return withSource(payload, {
    "客户姓名/称呼": clean(payload.customerName),
    手机号: clean(payload.phone),
    微信号: clean(payload.wechat),
    所在城市: clean(payload.city),
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
  return compactFields({
    "投诉人姓名/称呼": clean(payload.complainantName),
    联系方式: clean(payload.contact),
    被投诉对象: clean(payload.target),
    投诉类型: clean(payload.topic),
    投诉内容: clean(payload.detail),
    处理状态: "待处理",
    风险等级: clean(payload.riskLevel, "中"),
    处理结果: clean(payload.orderRef) ? `关联订单：${clean(payload.orderRef)}` : undefined
  });
}

function buildConsultFields(payload) {
  return compactFields({
    客户称呼: clean(payload.name),
    联系方式: clean(payload.contact),
    咨询城市: clean(payload.city),
    咨询内容: clean(payload.detail || payload.topic),
    来源页面: clean(payload.来源页面 || payload.sourcePage || payload.source),
    跟进状态: "待联系"
  });
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

    const fields = config.buildFields(payload);
    const record = await createRecord(token, tableId, fields);
    res.status(200).json({ ok: true, table: config.name, recordId: record?.record_id || "" });
  } catch (error) {
    res.status(500).json({ ok: false, code: "FEISHU_SUBMIT_FAILED", message: error.message });
  }
};
