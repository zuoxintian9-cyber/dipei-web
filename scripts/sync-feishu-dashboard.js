#!/usr/bin/env node

const APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

const REQUIRED_TABLES = [
  "用户预约需求表",
  "服务者入驻申请表",
  "订单跟进表",
  "投诉举报表",
  "客户咨询线索表",
  "数据看板表"
];

const DEAL_STATUSES = new Set(["客户已确认", "已收定金", "已分配服务者", "服务中", "服务完成", "已回访"]);
const PENDING_BOOKING_STATUSES = new Set(["新线索", "已联系", "待匹配", "待匹配服务者", "已报价"]);
const PENDING_PROVIDER_STATUSES = new Set(["待审核", "资料不完整", "初审通过"]);

function parseDateArg() {
  const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
  if (!dateArg) return todayYmd();
  const value = dateArg.split("=", 2)[1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("日期格式应为 --date=YYYY-MM-DD");
  }
  return value;
}

function todayYmd() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
}

function dateValue(ymd) {
  return new Date(`${ymd}T00:00:00+08:00`).getTime();
}

function ymdFromTimestamp(value) {
  if (!value) return "";
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  const timestamp = number < 10_000_000_000 ? number * 1000 : number;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date(timestamp));
}

function ymdFromText(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function fieldDate(record, fieldName) {
  const value = record.fields?.[fieldName];
  if (typeof value === "number") return ymdFromTimestamp(value);
  return ymdFromText(value) || ymdFromTimestamp(value) || ymdFromTimestamp(record.created_time);
}

function submittedOn(record, fieldName, ymd) {
  return fieldDate(record, fieldName) === ymd;
}

function text(value) {
  return String(value ?? "").trim();
}

function number(value) {
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function topList(items, fallback = "暂无数据") {
  const counts = new Map();
  for (const item of items.map(text).filter(isUsableDimension)) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "zh-CN"))
    .slice(0, 5)
    .map(([name, count]) => `${name} ${count}`);
  return sorted.length ? sorted.join("，") : fallback;
}

function isUsableDimension(value) {
  return Boolean(value) && !/[?？�]/.test(value);
}

async function api(path, options = {}) {
  const response = await fetch(`https://open.feishu.cn/open-apis${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.code !== 0) {
    throw new Error(`${body.code ?? response.status} ${body.msg || body.error || response.statusText}`);
  }
  return body;
}

async function getTenantToken() {
  if (!APP_ID || !APP_SECRET || !APP_TOKEN) {
    throw new Error("Missing FEISHU_APP_ID, FEISHU_APP_SECRET or FEISHU_BASE_APP_TOKEN");
  }
  const body = await api("/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: APP_ID, app_secret: APP_SECRET })
  });
  return body.tenant_access_token;
}

async function listTables(token) {
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function listRecords(token, tableId) {
  const records = [];
  let pageToken = "";
  do {
    const query = new URLSearchParams({ page_size: "500" });
    if (pageToken) query.set("page_token", pageToken);
    const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records?${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    records.push(...(body.data?.items || []));
    pageToken = body.data?.page_token || "";
  } while (pageToken);
  return records;
}

async function createRecord(token, tableId, fields) {
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });
  return body.data?.record;
}

async function updateRecord(token, tableId, recordId, fields) {
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${recordId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });
  return body.data?.record;
}

function buildDashboardFields(ymd, rows) {
  const bookings = rows["用户预约需求表"] || [];
  const providers = rows["服务者入驻申请表"] || [];
  const orders = rows["订单跟进表"] || [];
  const reports = rows["投诉举报表"] || [];
  const consults = rows["客户咨询线索表"] || [];

  const todayBookings = bookings.filter((record) => submittedOn(record, "提交时间", ymd));
  const todayProviders = providers.filter((record) => submittedOn(record, "提交时间", ymd));
  const todayReports = reports.filter((record) => submittedOn(record, "提交时间", ymd));
  const todayConsults = consults.filter((record) => submittedOn(record, "提交时间", ymd));
  const dealOrders = orders.filter((record) => DEAL_STATUSES.has(text(record.fields?.订单状态)));

  const cityItems = [
    ...todayBookings.map((record) => record.fields?.所在城市),
    ...todayConsults.map((record) => record.fields?.咨询城市),
    ...todayReports.map((record) => record.fields?.相关城市)
  ];
  const serviceItems = [
    ...todayBookings.map((record) => record.fields?.服务类型),
    ...dealOrders.map((record) => record.fields?.服务类型)
  ];

  return {
    统计日期: dateValue(ymd),
    新增预约数: todayBookings.length,
    新增入驻数: todayProviders.length,
    待跟进预约数: bookings.filter((record) => PENDING_BOOKING_STATUSES.has(text(record.fields?.跟进状态))).length,
    待审核服务者数: providers.filter((record) => PENDING_PROVIDER_STATUSES.has(text(record.fields?.审核状态))).length,
    已成交订单数: dealOrders.length,
    订单成交金额: dealOrders.reduce((sum, record) => sum + number(record.fields?.报价金额), 0),
    平台毛利: dealOrders.reduce((sum, record) => sum + number(record.fields?.平台毛利), 0),
    投诉数量: todayReports.length,
    城市线索排行: topList(cityItems),
    服务类型排行: topList(serviceItems)
  };
}

async function main() {
  const targetDate = parseDateArg();
  const token = await getTenantToken();
  const tables = await listTables(token);
  const tableMap = new Map(tables.map((table) => [table.name, table.table_id]));
  const missing = REQUIRED_TABLES.filter((name) => !tableMap.has(name));
  if (missing.length) throw new Error(`Missing tables: ${missing.join(", ")}`);

  const rows = {};
  for (const tableName of REQUIRED_TABLES.filter((name) => name !== "数据看板表")) {
    rows[tableName] = await listRecords(token, tableMap.get(tableName));
    console.log(`= ${tableName} 读取 ${rows[tableName].length} 条`);
  }

  const dashboardTable = tableMap.get("数据看板表");
  const dashboardRows = await listRecords(token, dashboardTable);
  const fields = buildDashboardFields(targetDate, rows);
  const existing = dashboardRows.find((record) => fieldDate(record, "统计日期") === targetDate);

  if (existing) {
    await updateRecord(token, dashboardTable, existing.record_id, fields);
    console.log(`= 数据看板表 更新：${targetDate} (${existing.record_id})`);
  } else {
    const record = await createRecord(token, dashboardTable, fields);
    console.log(`+ 数据看板表 新增：${targetDate} (${record?.record_id || "未返回"})`);
  }

  console.log(JSON.stringify(fields, null, 2));
  console.log("Done. 飞书数据看板已同步。");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
