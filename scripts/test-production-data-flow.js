const assert = require("assert");

const origin = process.env.TEST_ORIGIN || "https://www.dipeikehu.com";
const phone = process.env.TEST_PHONE || "13800138000";

function futureDate(days = 10) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
      .formatToParts(new Date(Date.now() + days * 24 * 60 * 60 * 1000))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

async function post(path, body) {
  const response = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

async function main() {
  const payload = {
    表单类型: "用户预约需求表",
    customerName: "自动化回归测试",
    phone,
    city: "北京",
    service: "商务接待",
    date: futureDate(),
    detail: "【自动化回归测试，请勿跟进】验证线上预约编号、飞书写入和状态查询链路。",
    协议同意: "已阅读并同意",
    来源页面: "/security-regression",
    提交时间: "2000-01-01 00:00:00",
    处理状态: "待处理"
  };

  const created = await post("/api/feishu-submit", payload);
  assert.equal(created.response.status, 200, JSON.stringify(created.data));
  assert.match(created.data.publicId, /^DP\d{16}$/);
  assert.deepEqual(Object.keys(created.data).sort(), ["ok", "publicId", "trackingNo"]);

  const found = await post("/api/order-status", { trackingNo: created.data.publicId, phone });
  assert.equal(found.response.status, 200, JSON.stringify(found.data));
  for (const key of ["customerName", "phone", "detail", "recordId", "internalRemark"]) {
    assert.equal(Object.hasOwn(found.data, key), false);
  }

  const wrongPhone = phone === "13900139000" ? "13800138000" : "13900139000";
  const wrong = await post("/api/order-status", { trackingNo: created.data.publicId, phone: wrongPhone });
  assert.equal(wrong.response.status, 404);

  console.log(`Production data flow passed: ${created.data.publicId}, ${found.data.statusLabel}, wrong phone rejected.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
