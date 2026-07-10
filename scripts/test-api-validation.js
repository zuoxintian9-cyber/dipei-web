const assert = require("assert");
const submitHandler = require("../api/feishu-submit");

const { validatePayload, publicId, checkRateLimit } = submitHandler._test;
const validBooking = {
  customerName: "测试客户",
  phone: "13800138000",
  city: "北京",
  service: "商务接待",
  date: "2099-12-31",
  detail: "这是用于验证预约接口字段规则的正常测试需求。"
};

assert.equal(validatePayload("用户预约需求表", validBooking).ok, true);
assert.equal(validatePayload("用户预约需求表", { ...validBooking, phone: "123" }).code, "INVALID_PHONE");
assert.equal(validatePayload("用户预约需求表", { ...validBooking, date: "2020-01-01" }).code, "INVALID_DATE");
assert.equal(validatePayload("用户预约需求表", { ...validBooking, detail: "要求私下交易并绕开平台" }).code, "RISK_CONTENT_REJECTED");
assert.equal(validatePayload("用户预约需求表", { ...validBooking, detail: "正".repeat(801) }).code, "FIELD_TOO_LONG");
assert.equal(validatePayload("用户预约需求表", { ...validBooking, website: "spam.example" }).code, "SPAM_REJECTED");

const ids = new Set(Array.from({ length: 1000 }, () => publicId("DP")));
assert.equal(ids.size, 1000);
assert.ok([...ids].every((value) => /^DP\d{16}$/.test(value)));

const contactReq = { headers: { "x-forwarded-for": "198.51.100.10" }, socket: {} };
for (let index = 0; index < 5; index += 1) {
  assert.equal(checkRateLimit(contactReq, { phone: "13900139000" }), true);
}
assert.equal(checkRateLimit(contactReq, { phone: "13900139000" }), false);

const ipReq = { headers: { "x-forwarded-for": "198.51.100.11" }, socket: {} };
for (let index = 0; index < 12; index += 1) {
  assert.equal(checkRateLimit(ipReq, { phone: `1380000${String(index).padStart(4, "0")}` }), true);
}
assert.equal(checkRateLimit(ipReq, { phone: "13700137000" }), false);

console.log("API validation tests passed: fields, risk content, IDs and rate limits.");
