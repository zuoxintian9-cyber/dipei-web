#!/usr/bin/env node

const APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

const TABLES = ["用户预约需求表", "服务者入驻申请表", "投诉举报表", "客户咨询线索表"];

function targetSubmitTime() {
  const dateArg = process.argv.find((arg) => arg.startsWith("--date="));
  if (dateArg) {
    const value = dateArg.split("=", 2)[1];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("日期格式应为 --date=YYYY-MM-DD");
    return `${value} 12:00:00`;
  }
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

function clean(value) {
  return String(value ?? "").trim();
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

async function updateRecord(token, tableId, recordId, fields) {
  await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records/${recordId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });
}

async function main() {
  const value = targetSubmitTime();
  const token = await getTenantToken();
  const tables = await listTables(token);
  const tableMap = new Map(tables.map((table) => [table.name, table.table_id]));

  for (const tableName of TABLES) {
    const tableId = tableMap.get(tableName);
    if (!tableId) throw new Error(`Missing table: ${tableName}`);
    const records = await listRecords(token, tableId);
    let updated = 0;
    for (const record of records) {
      if (clean(record.fields?.提交时间)) continue;
      await updateRecord(token, tableId, record.record_id, { 提交时间: value });
      updated += 1;
    }
    console.log(`${tableName} 回填 ${updated} 条，时间：${value}`);
  }

  console.log("Done. 空提交时间已回填。");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
