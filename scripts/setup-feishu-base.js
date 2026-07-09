#!/usr/bin/env node

const APP_TOKEN = process.env.FEISHU_BASE_APP_TOKEN || "GgevbG7I6aQzsJsbWRtcPCnCn4c";
const APP_ID = process.env.FEISHU_APP_ID || "";
const APP_SECRET = process.env.FEISHU_APP_SECRET || "";

const FIELD_TYPE = {
  text: 1,
  number: 2,
  single: 3,
  multi: 4,
  date: 5,
  checkbox: 7,
  phone: 13
};

const option = (name) => ({ name });

const schemas = [
  {
    name: "用户预约需求表",
    view: "全部预约",
    views: ["全部预约", "今日新增", "待联系", "待匹配服务者", "已成交", "无效线索", "按城市分组", "按服务类型分组"],
    fields: [
      text("预约编号"),
      text("提交时间"),
      text("客户姓名/称呼"),
      phone("手机号"),
      text("微信号"),
      single("所在城市", ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"]),
      text("服务区域"),
      single("服务类型", ["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"]),
      date("预约日期"),
      single("预约时间段", ["上午", "下午", "晚上", "全天"]),
      single("服务时长", ["2 小时", "半天", "全天", "多日服务"]),
      number("人数"),
      single("预算范围", ["300以内", "300-500", "500-1000", "1000以上", "待沟通"]),
      text("具体需求"),
      single("是否需要外语", ["不需要", "英语", "日语", "韩语", "其他"]),
      single("是否需要接送", ["不需要", "机场", "高铁", "酒店", "待沟通"]),
      text("来源页面"),
      single("跟进状态", ["新线索", "已联系", "待匹配", "已报价", "已成交", "服务完成", "无效"]),
      single("无效原因", ["无效号码", "重复提交", "需求违规", "预算不匹配", "城市未覆盖", "其他"]),
      text("分配客服"),
      text("匹配服务者"),
      text("备注")
    ]
  },
  {
    name: "服务者入驻申请表",
    view: "全部申请",
    views: ["全部申请", "待审核", "资料不完整", "初审通过", "复审通过", "已拒绝", "黑名单", "按城市分组"],
    fields: [
      text("申请编号"),
      text("提交时间"),
      text("姓名/昵称"),
      phone("手机号"),
      text("微信号"),
      single("性别", ["男", "女", "不便透露"]),
      single("年龄段", ["18-24", "25-30", "31-40", "41以上"]),
      single("所在城市", ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"]),
      multi("可服务区域", ["核心商圈", "景区", "机场", "高铁站", "会展中心", "政务大厅"]),
      multi("服务类型", ["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"]),
      multi("可服务时间", ["工作日", "周末", "晚上", "节假日"]),
      number("起步价格"),
      single("计费方式", ["小时", "半天", "全天", "按次沟通"]),
      text("个人介绍"),
      multi("擅长内容", ["美食", "拍照", "路线规划", "翻译", "商务接待"]),
      multi("语言能力", ["普通话", "英语", "日语", "韩语", "其他"]),
      single("身份认证状态", ["未认证", "待核验", "已认证", "拒绝"]),
      single("审核状态", ["待审核", "资料不完整", "初审通过", "复审通过", "拒绝", "黑名单"]),
      multi("拒绝原因", ["资料虚假", "服务内容不合规", "联系方式异常", "城市暂未开放", "照片不符合要求", "价格不合理", "重复申请"]),
      text("审核备注"),
      text("审核人"),
      checkbox("是否进入服务者库")
    ]
  },
  {
    name: "服务者资料库",
    view: "可接单服务者",
    views: ["可接单服务者", "暂停接单", "高评分服务者", "重点城市服务者", "风险关注名单"],
    fields: [
      text("服务者编号"),
      text("服务者昵称"),
      text("真实姓名"),
      phone("手机号"),
      text("微信号"),
      single("服务城市", ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"]),
      multi("服务区域", ["核心商圈", "景区", "机场", "高铁站", "会展中心", "政务大厅"]),
      multi("服务类型", ["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"]),
      multi("服务标签", ["会拍照", "会英语", "熟悉夜生活", "商务接待", "路线规划"]),
      number("起步价"),
      number("评分"),
      number("成交次数"),
      single("服务状态", ["可接单", "忙碌", "暂停接单", "资料待完善", "下架", "黑名单"]),
      single("风险等级", ["正常", "关注", "限制接单", "黑名单"]),
      text("对外展示文案"),
      text("内部备注"),
      text("关联入驻申请"),
      text("关联订单")
    ]
  },
  {
    name: "订单跟进表",
    view: "全部订单",
    views: ["全部订单", "待确认", "已报价", "服务中", "已完成", "已取消", "待回访", "有投诉订单"],
    fields: [
      text("订单编号"),
      text("关联预约需求"),
      text("客户姓名"),
      phone("客户手机号"),
      single("服务城市", ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"]),
      single("服务类型", ["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"]),
      text("服务者"),
      date("服务日期"),
      single("服务时长", ["小时", "半天", "全天", "多日"]),
      number("报价金额"),
      number("服务者结算价"),
      number("平台毛利"),
      single("订单状态", ["待确认", "已报价", "客户已确认", "已收定金", "已分配服务者", "服务中", "服务完成", "已回访", "已取消"]),
      single("收款状态", ["未收款", "已定金", "已全款", "退款中", "已退款"]),
      text("跟进客服"),
      text("客户反馈"),
      text("投诉关联"),
      text("备注")
    ]
  },
  {
    name: "城市与服务类目表",
    view: "开放城市",
    views: ["开放城市", "内测城市", "暂未开放", "按负责人"],
    fields: [
      text("城市"),
      single("是否开放", ["已开放", "内测中", "暂未开放"]),
      multi("服务类目", ["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"]),
      number("推荐起步价"),
      number("服务者数量"),
      text("城市负责人"),
      multi("热门区域", ["景区", "商圈", "机场", "高铁站", "会展中心", "政务大厅"]),
      text("备注")
    ]
  },
  {
    name: "客户咨询线索表",
    view: "全部咨询",
    views: ["全部咨询", "待联系", "已联系", "有意向", "无效咨询"],
    fields: [
      text("线索编号"),
      text("提交时间"),
      text("客户称呼"),
      text("联系方式"),
      single("咨询城市", ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"]),
      single("咨询类型", ["预约咨询", "入驻合作", "费用说明", "隐私与协议", "其他"]),
      text("咨询内容"),
      text("来源页面"),
      single("跟进状态", ["待联系", "已联系", "有意向", "无效"]),
      text("跟进人"),
      date("下次跟进时间"),
      text("备注")
    ]
  },
  {
    name: "投诉举报表",
    view: "全部投诉",
    views: ["全部投诉", "待处理", "处理中", "高风险投诉", "已解决", "无效投诉"],
    fields: [
      text("投诉编号"),
      text("提交时间"),
      text("投诉人姓名/称呼"),
      text("联系方式"),
      text("关联订单"),
      text("相关城市"),
      text("被投诉对象"),
      single("投诉类型", ["服务态度", "迟到", "收费争议", "违规内容", "隐私问题", "其他问题"]),
      text("投诉内容"),
      text("证据附件说明/链接"),
      single("处理状态", ["待处理", "处理中", "已解决", "无效"]),
      text("处理人"),
      text("处理结果"),
      single("风险等级", ["低", "中", "高", "严重"])
    ]
  },
  {
    name: "客服跟进记录表",
    view: "全部跟进",
    views: ["全部跟进", "今日跟进", "待再次跟进", "未接通", "已成交", "无效"],
    fields: [
      text("跟进编号"),
      date("跟进时间"),
      single("跟进对象", ["用户", "服务者"]),
      text("关联预约"),
      text("关联订单"),
      single("跟进方式", ["电话", "微信", "短信", "飞书"]),
      text("跟进内容"),
      single("跟进结果", ["已联系", "未接", "待补资料", "已成交", "无效"]),
      date("下次跟进时间"),
      text("跟进人")
    ]
  },
  {
    name: "平台配置表",
    view: "启用配置",
    views: ["启用配置", "全部配置"],
    fields: [
      text("配置项"),
      text("配置值"),
      checkbox("是否启用"),
      text("备注")
    ]
  },
  {
    name: "数据看板表",
    view: "核心指标",
    views: ["核心指标", "每日数据"],
    fields: [
      date("统计日期"),
      number("新增预约数"),
      number("新增入驻数"),
      number("待跟进预约数"),
      number("待审核服务者数"),
      number("已成交订单数"),
      number("订单成交金额"),
      number("平台毛利"),
      number("投诉数量"),
      text("城市线索排行"),
      text("服务类型排行")
    ]
  }
];

const seedRecords = {
  用户预约需求表: {
    预约编号: "YY20260710001",
    提交时间: "2026-07-10 10:00:00",
    "客户姓名/称呼": "宋女士",
    手机号: "13874269152",
    微信号: "song_city_2026",
    所在城市: "上海",
    服务区域: "陆家嘴 / 外滩",
    服务类型: "商务接待",
    预约日期: dateValue("2026-07-18"),
    预约时间段: "下午",
    服务时长: "半天",
    人数: 3,
    预算范围: "500-1000",
    具体需求: "外地客户到上海洽谈，希望安排熟悉陆家嘴和外滩路线的商务陪同，协助会面前后的交通动线和餐厅建议。",
    是否需要外语: "英语",
    是否需要接送: "高铁",
    来源页面: "/#booking",
    跟进状态: "新线索",
    备注: "自动化测试数据"
  },
  服务者入驻申请表: {
    申请编号: "RZ20260710001",
    提交时间: "2026-07-10 10:05:00",
    "姓名/昵称": "赵先生",
    手机号: "13956382741",
    微信号: "zhao_hz_88",
    性别: "男",
    年龄段: "25-30",
    所在城市: "杭州",
    可服务区域: ["核心商圈", "景区", "高铁站"],
    服务类型: ["城市陪同", "商务接待"],
    可服务时间: ["周末", "晚上", "节假日"],
    起步价格: 420,
    计费方式: "半天",
    个人介绍: "熟悉杭州核心商圈、景区和高铁站路线，可提供城市陪同、商务接待和基础路线规划服务，沟通稳定，时间安排灵活。",
    擅长内容: ["美食", "路线规划", "商务接待"],
    语言能力: ["普通话", "英语"],
    身份认证状态: "未认证",
    审核状态: "待审核",
    是否进入服务者库: false
  },
  服务者资料库: {
    服务者编号: "FW20260710001",
    服务者昵称: "赵先生",
    真实姓名: "赵明",
    手机号: "13956382741",
    微信号: "zhao_hz_88",
    服务城市: "杭州",
    服务区域: ["核心商圈", "景区", "高铁站"],
    服务类型: ["城市陪同", "商务接待"],
    服务标签: ["路线规划", "商务接待"],
    起步价: 420,
    评分: 4.9,
    成交次数: 12,
    服务状态: "可接单",
    风险等级: "正常",
    对外展示文案: "熟悉杭州核心商圈、景区和高铁站路线，可提供城市陪同、商务接待和基础路线规划。",
    内部备注: "自动化测试服务者资料",
    关联入驻申请: "RZ20260710001",
    关联订单: "DD20260718001"
  },
  订单跟进表: {
    订单编号: "DD20260718001",
    关联预约需求: "YY20260710001",
    客户姓名: "宋女士",
    客户手机号: "13874269152",
    服务城市: "上海",
    服务类型: "商务接待",
    服务者: "赵先生",
    服务日期: dateValue("2026-07-18"),
    服务时长: "半天",
    报价金额: 880,
    服务者结算价: 620,
    平台毛利: 260,
    订单状态: "已报价",
    收款状态: "未收款",
    跟进客服: "客服A",
    客户反馈: "客户希望下午 14:00 前确认服务者。",
    备注: "自动化测试订单"
  },
  投诉举报表: {
    投诉编号: "TS20260710001",
    提交时间: "2026-07-10 10:20:00",
    "投诉人姓名/称呼": "吴先生",
    联系方式: "13691827405",
    关联订单: "DD20260718003",
    相关城市: "上海",
    被投诉对象: "某服务沟通人员",
    投诉类型: "隐私问题",
    投诉内容: "沟通过程中对方要求添加私人联系方式并索要与服务无关的信息，希望平台核查并确认是否符合服务规范。",
    处理状态: "待处理",
    风险等级: "中"
  },
  城市与服务类目表: {
    城市: "上海",
    是否开放: "已开放",
    服务类目: ["商务接待", "城市陪同", "机场接送"],
    推荐起步价: 400,
    服务者数量: 0,
    热门区域: ["商圈", "机场", "会展中心"],
    备注: "首批开放城市"
  },
  客户咨询线索表: {
    线索编号: "ZX20260710001",
    提交时间: "2026-07-10 10:25:00",
    客户称呼: "李女士",
    联系方式: "13700001234",
    咨询城市: "深圳",
    咨询类型: "预约咨询",
    咨询内容: "想了解展会陪同和商务翻译服务，预算待确认。",
    来源页面: "/contact.html",
    跟进状态: "待联系",
    跟进人: "客服A",
    下次跟进时间: dateValue("2026-07-11"),
    备注: "自动化测试咨询线索"
  },
  客服跟进记录表: {
    跟进编号: "GJ20260710001",
    跟进时间: dateValue("2026-07-10"),
    跟进对象: "用户",
    关联预约: "YY20260710001",
    关联订单: "DD20260718001",
    跟进方式: "电话",
    跟进内容: "已确认客户时间、人数和接送需求，等待服务者最终报价。",
    跟进结果: "已联系",
    下次跟进时间: dateValue("2026-07-11"),
    跟进人: "客服A"
  },
  平台配置表: {
    配置项: "禁止服务说明",
    配置值: "严禁违法违规、低俗色情、私下交易、侵害隐私及诱导绕开平台的行为。",
    是否启用: true,
    备注: "网站首页合规提示"
  },
  数据看板表: {
    统计日期: dateValue("2026-07-10"),
    新增预约数: 1,
    新增入驻数: 1,
    待跟进预约数: 1,
    待审核服务者数: 1,
    已成交订单数: 0,
    订单成交金额: 0,
    平台毛利: 0,
    投诉数量: 1,
    城市线索排行: "上海 1",
    服务类型排行: "商务接待 1"
  }
};

function text(name) {
  return { field_name: name, type: FIELD_TYPE.text };
}

function number(name) {
  return { field_name: name, type: FIELD_TYPE.number };
}

function phone(name) {
  return { field_name: name, type: FIELD_TYPE.phone };
}

function date(name) {
  return { field_name: name, type: FIELD_TYPE.date, property: { date_formatter: "yyyy/MM/dd" } };
}

function checkbox(name) {
  return { field_name: name, type: FIELD_TYPE.checkbox };
}

function single(name, options) {
  return { field_name: name, type: FIELD_TYPE.single, property: { options: options.map(option) } };
}

function multi(name, options) {
  return { field_name: name, type: FIELD_TYPE.multi, property: { options: options.map(option) } };
}

function dateValue(value) {
  return new Date(`${value}T00:00:00+08:00`).getTime();
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

async function createTable(token, schema) {
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      table: {
        name: schema.name
      }
    })
  });
  return body.data?.table_id || body.data?.table?.table_id;
}

async function listFields(token, tableId) {
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/fields?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function listViews(token, tableId) {
  const body = await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/views?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return body.data?.items || [];
}

async function createView(token, tableId, viewName) {
  await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/views`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      view_name: viewName,
      view_type: "grid"
    })
  });
}

async function createField(token, tableId, field) {
  try {
    await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/fields`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(field)
    });
  } catch (error) {
    if (field.type === FIELD_TYPE.text) throw error;
    console.warn(`  ! ${field.field_name} 使用类型 ${field.type} 创建失败，回退为文本字段：${error.message}`);
    await api(`/bitable/v1/apps/${APP_TOKEN}/tables/${tableId}/fields`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(text(field.field_name))
    });
  }
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

async function main() {
  const seed = process.argv.includes("--seed");
  const token = await getTenantToken();
  const existingTables = await listTables(token);
  const tableMap = new Map(existingTables.map((table) => [table.name, table.table_id]));

  for (const schema of schemas) {
    let tableId = tableMap.get(schema.name);
    if (!tableId) {
      tableId = await createTable(token, schema);
      console.log(`+ 创建数据表：${schema.name} (${tableId})`);
      await sleep(700);
    } else {
      console.log(`= 已存在数据表：${schema.name} (${tableId})`);
    }

    const fields = await listFields(token, tableId);
    const fieldNames = new Set(fields.map((field) => field.field_name || field.name));
    for (const field of schema.fields) {
      if (fieldNames.has(field.field_name)) continue;
      await createField(token, tableId, field);
      console.log(`  + 字段：${field.field_name}`);
      await sleep(450);
    }

    if (schema.views?.length) {
      try {
        const views = await listViews(token, tableId);
        const viewNames = new Set(views.map((view) => view.view_name || view.name));
        for (const viewName of schema.views) {
          if (viewNames.has(viewName)) continue;
          await createView(token, tableId, viewName);
          console.log(`  + 视图：${viewName}`);
          await sleep(450);
        }
      } catch (error) {
        console.warn(`  ! 视图同步跳过：${error.message}`);
      }
    }

    if (seed && seedRecords[schema.name]) {
      await createRecord(token, tableId, seedRecords[schema.name]);
      console.log(`  + 测试数据：${schema.name}`);
      await sleep(700);
    }
  }

  console.log("Done. 飞书多维表格后台已完成初始化。");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
