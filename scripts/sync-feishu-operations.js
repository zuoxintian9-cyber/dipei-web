#!/usr/bin/env node

const APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

const cities = [
  {
    城市: "北京",
    是否开放: "已开放",
    服务类目: ["商务接待", "展会陪同", "机场接送"],
    推荐起步价: 500,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["商圈", "机场", "会展中心"],
    备注: "首批开放城市，重点覆盖朝阳 CBD、国贸、机场高铁场景"
  },
  {
    城市: "上海",
    是否开放: "已开放",
    服务类目: ["城市陪同", "商务接待", "机场接送"],
    推荐起步价: 400,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["商圈", "机场", "会展中心"],
    备注: "首批开放城市，重点覆盖陆家嘴、外滩、虹桥和浦东机场"
  },
  {
    城市: "广州",
    是否开放: "已开放",
    服务类目: ["办事协助", "商务接待", "城市陪同"],
    推荐起步价: 350,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["商圈", "高铁站", "政务大厅"],
    备注: "首批开放城市，重点覆盖天河、越秀、琶洲会展"
  },
  {
    城市: "深圳",
    是否开放: "已开放",
    服务类目: ["展会陪同", "商务接待", "城市陪同"],
    推荐起步价: 600,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["商圈", "机场", "会展中心"],
    备注: "首批开放城市，重点覆盖福田、南山、会展中心"
  },
  {
    城市: "成都",
    是否开放: "已开放",
    服务类目: ["机场接送", "城市陪同", "旅游向导"],
    推荐起步价: 300,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["机场", "商圈", "高铁站"],
    备注: "首批开放城市，重点覆盖双流、天府机场和核心商圈"
  },
  {
    城市: "杭州",
    是否开放: "已开放",
    服务类目: ["城市陪同", "商务接待", "旅游向导"],
    推荐起步价: 420,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["景区", "商圈", "高铁站"],
    备注: "首批开放城市，重点覆盖西湖、钱江新城、杭州东站"
  },
  {
    城市: "西安",
    是否开放: "已开放",
    服务类目: ["旅游向导", "城市陪同", "商务接待"],
    推荐起步价: 450,
    服务者数量: 1,
    城市负责人: "运营待分配",
    热门区域: ["景区", "商圈", "高铁站"],
    备注: "首批开放城市，重点覆盖钟楼、大雁塔、曲江"
  },
  {
    城市: "重庆",
    是否开放: "内测中",
    服务类目: ["城市陪同", "旅游向导", "机场接送"],
    推荐起步价: 380,
    服务者数量: 0,
    城市负责人: "运营待分配",
    热门区域: ["景区", "商圈", "机场"],
    备注: "内测城市，先接收需求后由客服确认可服务情况"
  }
];

const configs = [
  ["客服邮箱", "zuoxintian9@gmail.com", "公开客服邮箱，网站联系页使用"],
  ["服务开放城市", "北京、上海、广州、深圳、成都、杭州、西安、重庆", "第一期城市范围"],
  ["默认预约成功提示语", "提交成功，客服会尽快联系你。", "网站表单成功提示"],
  ["入驻成功提示语", "入驻申请已提交，平台会进行人工审核。", "服务者入驻表单提示"],
  ["投诉邮箱", "zuoxintian9@gmail.com", "投诉举报兜底联系方式"],
  ["禁止服务说明", "严禁违法违规、低俗色情、私下交易、侵害隐私及诱导绕开平台的行为。", "首页和规则页合规提示"],
  ["隐私政策链接", "https://www.dipeikehu.com/privacy.html", "公开隐私政策"],
  ["服务协议链接", "https://www.dipeikehu.com/terms.html", "公开服务协议"],
  ["预约规则链接", "https://www.dipeikehu.com/booking-rule.html", "公开预约与订单规则"],
  ["账号中心入口", "https://www.dipeikehu.com/account.html", "用户注册、登录帮助和订单列表协助入口"],
  ["订单进度入口", "https://www.dipeikehu.com/order.html", "用户补充预约信息和查询进度入口"],
  ["服务者中心链接", "https://www.dipeikehu.com/provider-center.html", "服务者资料补充和状态咨询入口"],
  ["服务反馈入口", "https://www.dipeikehu.com/feedback.html", "用户提交服务评价和改进建议入口"]
].map(([配置项, 配置值, 备注]) => ({ 配置项, 配置值, 是否启用: true, 备注 }));

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
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records?page_size=500`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function createRecord(token, tableId, fields) {
  await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/records`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ fields })
  });
}

async function syncByKey(token, tableId, tableName, keyField, rows) {
  const records = await listRecords(token, tableId);
  const existing = new Set(records.map((record) => record.fields?.[keyField]).filter(Boolean));
  for (const row of rows) {
    if (existing.has(row[keyField])) {
      console.log(`= ${tableName} 已存在：${row[keyField]}`);
      continue;
    }
    await createRecord(token, tableId, row);
    console.log(`+ ${tableName} 新增：${row[keyField]}`);
  }
}

async function main() {
  const token = await getTenantToken();
  const tables = await listTables(token);
  const tableMap = new Map(tables.map((table) => [table.name, table.table_id]));
  const cityTable = tableMap.get("城市与服务类目表");
  const configTable = tableMap.get("平台配置表");
  if (!cityTable || !configTable) throw new Error("Missing 城市与服务类目表 or 平台配置表");
  await syncByKey(token, cityTable, "城市与服务类目表", "城市", cities);
  await syncByKey(token, configTable, "平台配置表", "配置项", configs);
  console.log("Done. 飞书运营基础数据已同步。");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
