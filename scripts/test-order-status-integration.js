const assert = require("assert");
const handler = require("../api/order-status");

const trackingNo = process.env.TEST_TRACKING_NO;
const phone = process.env.TEST_PHONE;
if (!trackingNo || !phone) throw new Error("TEST_TRACKING_NO and TEST_PHONE are required");

function invoke(body, ip) {
  return new Promise((resolve, reject) => {
    const req = {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-vercel-forwarded-for": ip,
        origin: "https://www.dipeikehu.com"
      },
      body,
      socket: {}
    };
    const res = {
      headers: {},
      statusCode: 200,
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, headers: this.headers, payload }); }
    };
    Promise.resolve(handler(req, res)).catch(reject);
  });
}

async function main() {
  const success = await invoke({ trackingNo, phone }, "198.51.100.30");
  assert.equal(success.status, 200);
  assert.equal(success.payload.ok, true);
  assert.equal(success.payload.trackingNo, trackingNo);
  for (const key of ["customerName", "phone", "detail", "price", "internalRemark", "recordId"]) {
    assert.equal(Object.prototype.hasOwnProperty.call(success.payload, key), false);
  }
  assert.equal(success.headers["cache-control"], "no-store, max-age=0");

  const wrongPhone = await invoke({ trackingNo, phone: "13900139000" }, "198.51.100.31");
  assert.equal(wrongPhone.status, 404);
  assert.equal(wrongPhone.payload.code, "BOOKING_NOT_FOUND");

  console.log(`Order integration passed: ${success.payload.statusLabel}, wrong-phone lookup rejected.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
