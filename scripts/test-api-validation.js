const assert = require("assert");
const submitHandler = require("../api/feishu-submit");
const orderHandler = require("../api/order-status");

const submitTest = submitHandler._test;
const orderTest = orderHandler._test;
const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const farFutureDate = new Date(Date.now() + 800 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

function request(headers = {}, body = {}) {
  return { method: "POST", headers, body, socket: { remoteAddress: "127.0.0.1" } };
}

function invoke(handler, req) {
  return new Promise((resolve, reject) => {
    const response = {
      headers: {},
      statusCode: 200,
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
      status(code) { this.statusCode = code; return this; },
      json(body) { resolve({ status: this.statusCode, headers: this.headers, body }); }
    };
    Promise.resolve(handler(req, response)).catch(reject);
  });
}

async function main() {
  const validBooking = {
    customerName: "测试客户",
    phone: "13800138000",
    city: "北京",
    service: "商务接待",
    date: futureDate,
    detail: "这是用于验证预约接口字段规则的正常测试需求。",
    协议同意: "已阅读并同意"
  };

  assert.equal(submitTest.validatePayload("用户预约需求表", validBooking).ok, true);
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, phone: "123" }).code, "INVALID_PHONE");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, date: "2026-02-30" }).code, "INVALID_DATE");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, date: farFutureDate }).code, "INVALID_DATE");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, city: "火星" }).code, "INVALID_BOOKING_OPTION");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, service: "特殊类型" }).code, "INVALID_BOOKING_OPTION");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, detail: "明确要求私下交易并加微信绕开平台完成服务" }).code, "RISK_CONTENT_REJECTED");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, detail: "正".repeat(801) }).code, "FIELD_TOO_LONG");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, website: "spam.example" }).code, "SPAM_REJECTED");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, 协议同意: "否" }).code, "CONSENT_REQUIRED");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, customerName: "测试\n伪造通知" }).code, "INVALID_LINE_BREAK");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, nested: { value: 1 } }).code, "INVALID_FIELD_TYPE");
  assert.equal(submitTest.validatePayload("用户预约需求表", { ...validBooking, unknown: "value" }).code, "UNEXPECTED_FIELDS");

  const validProvider = {
    name: "测试服务者",
    phone: "13900139000",
    wechat: "test_wechat",
    city: "上海",
    serviceArea: "浦东、虹桥",
    serviceType: "城市陪同",
    availableTime: "周末白天",
    price: "500",
    billingType: "半天",
    intro: "这是用于验证服务者入驻接口字段规则的正常测试介绍内容。",
    协议同意: "已阅读并同意"
  };
  assert.equal(submitTest.validatePayload("服务者入驻申请表", validProvider).ok, true);
  assert.equal(submitTest.validatePayload("服务者入驻申请表", { ...validProvider, price: "-1" }).code, "INVALID_PRICE");
  assert.equal(submitTest.validatePayload("服务者入驻申请表", { ...validProvider, billingType: "随意收费" }).code, "INVALID_PROVIDER_OPTION");

  const ids = new Set(Array.from({ length: 1000 }, () => submitTest.publicId("DP")));
  assert.equal(ids.size, 1000);
  assert.ok([...ids].every((value) => /^DP\d{16}$/.test(value)));
  assert.ok(!submitTest.submitTime({ 提交时间: "2000-01-01 00:00:00" }).startsWith("2000"));

  assert.equal(submitTest.hasAllowedOrigin(request({ origin: "https://www.dipeikehu.com" })), true);
  assert.equal(submitTest.hasAllowedOrigin(request({ origin: "https://dipei-web.vercel.app" })), true);
  assert.equal(submitTest.hasAllowedOrigin(request({ origin: "https://dipei-abc123-zuoxintian9-7231s-projects.vercel.app" })), true);
  assert.equal(submitTest.hasAllowedOrigin(request({ origin: "https://dipei-abc123-another-team.vercel.app" })), false);
  assert.equal(submitTest.hasAllowedOrigin(request({ origin: "https://attacker.vercel.app" })), false);
  assert.equal(submitTest.hasAllowedOrigin(request({ origin: "https://evil.example" })), false);
  assert.equal(submitTest.hasJsonContentType(request({ "content-type": "application/json; charset=utf-8" })), true);
  assert.equal(submitTest.requestTooLarge(request({ "content-length": "20000" })), true);
  assert.equal(submitTest.bodyTooLarge(request({}, { detail: "测".repeat(6000) })), true);

  const contactReq = request({ "x-vercel-forwarded-for": "198.51.100.10" });
  for (let index = 0; index < 5; index += 1) {
    assert.equal(submitTest.checkRateLimit(contactReq, { phone: "13900139000" }), true);
  }
  assert.equal(submitTest.checkRateLimit(contactReq, { phone: "13900139000" }), false);

  const ipReq = request({ "x-vercel-forwarded-for": "198.51.100.11" });
  for (let index = 0; index < 12; index += 1) {
    assert.equal(submitTest.checkRateLimit(ipReq, { phone: `1380000${String(index).padStart(4, "0")}` }), true);
  }
  assert.equal(submitTest.checkRateLimit(ipReq, { phone: "13700137000" }), false);

  assert.equal(orderTest.normalizePhone("+86 138-0013-8000"), "8613800138000");
  assert.equal(orderTest.safeEqual("13800138000", "13800138000"), true);
  assert.equal(orderTest.safeEqual("13800138000", "13900139000"), false);
  assert.equal(orderTest.statusData({ fields: { 跟进状态: "待匹配" } }, null).label, "正在匹配服务者");
  assert.equal(orderTest.statusData({ fields: { 跟进状态: "新线索" } }, { fields: { 订单状态: "服务完成" } }).tone, "complete");
  assert.equal(orderTest.bodyTooLarge(request({}, { trackingNo: "DP".repeat(2000) })), true);

  const submitNoType = await invoke(submitHandler, request({ "x-vercel-forwarded-for": "203.0.113.1" }, "{}"));
  assert.equal(submitNoType.status, 415);
  const submitBadOrigin = await invoke(submitHandler, request({ "content-type": "application/json", origin: "https://evil.example", "x-vercel-forwarded-for": "203.0.113.2" }, "{}"));
  assert.equal(submitBadOrigin.status, 403);
  const submitTooLarge = await invoke(submitHandler, request({ "content-type": "application/json", "content-length": "20000", "x-vercel-forwarded-for": "203.0.113.3" }, "{}"));
  assert.equal(submitTooLarge.status, 413);
  const submitMalformed = await invoke(submitHandler, request({ "content-type": "application/json", "x-vercel-forwarded-for": "203.0.113.4" }, "{bad-json"));
  assert.equal(submitMalformed.status, 400);

  const orderNoType = await invoke(orderHandler, request({ "x-vercel-forwarded-for": "203.0.113.5" }, "{}"));
  assert.equal(orderNoType.status, 415);
  const orderBadOrigin = await invoke(orderHandler, request({ "content-type": "application/json", origin: "https://evil.example", "x-vercel-forwarded-for": "203.0.113.6" }, "{}"));
  assert.equal(orderBadOrigin.status, 403);
  const orderMalformed = await invoke(orderHandler, request({ "content-type": "application/json", "x-vercel-forwarded-for": "203.0.113.7" }, "{bad-json"));
  assert.equal(orderMalformed.status, 400);

  console.log("API security tests passed: validation, consent, origins, payload limits, IDs, status privacy and rate limits.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
