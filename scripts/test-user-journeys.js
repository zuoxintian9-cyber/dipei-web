const assert = require("assert");
const { chromium } = require("playwright");

if (process.env.RUN_LIVE_JOURNEY !== "1") {
  throw new Error("Set RUN_LIVE_JOURNEY=1 to create labeled end-to-end test records.");
}

const origin = process.env.TEST_ORIGIN || "https://www.dipeikehu.com";
const chromePath = process.env.CHROME_PATH || `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`;
const seed = String(Date.now()).slice(-7);
const phones = {
  account: `1380${seed}`,
  booking: `1390${seed}`,
  provider: `1370${seed}`
};

function futureDate(days = 12) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function submitAndRead(form, buttonName) {
  await form.getByRole("button", { name: buttonName }).click();
  const result = form.locator(".form-result");
  await result.waitFor({ state: "visible", timeout: 20000 });
  return result.textContent();
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

  await page.goto(`${origin}/account.html`, { waitUntil: "load" });
  const register = page.locator("#register form");
  await register.locator('[name="name"]').fill("全流程测试用户");
  await register.locator('[name="contact"]').fill(phones.account);
  await register.locator('[name="city"]').selectOption("武汉");
  await register.locator('[name="accountRole"]').selectOption("个人用户");
  await register.locator('[name="preferredTime"]').fill("工作日 14 点后");
  await register.locator('[name="detail"]').fill("【全流程测试，请勿跟进】验证账号登记、编号生成和飞书通知链路。");
  await register.locator('[name="consent"]').check();
  const accountResult = await submitAndRead(register, "提交注册协助");
  assert.match(accountResult, /账号登记已提交[\s\S]*ZX\d{16}/);

  await page.goto(`${origin}/#booking`, { waitUntil: "load" });
  const booking = page.locator("#bookingForm");
  await booking.locator('[name="customerName"]').fill("全流程测试预约");
  await booking.locator('[name="phone"]').fill(phones.booking);
  await booking.locator('[name="city"]').selectOption("武汉");
  await booking.locator('[name="service"]').selectOption("商务接待");
  await booking.locator('[name="date"]').fill(futureDate());
  await booking.locator('[name="detail"]').fill("【全流程测试，请勿跟进】验证武汉城市级商务接待预约和状态查询链路。");
  await booking.locator('[name="consent"]').check();
  const bookingResult = await submitAndRead(booking, "提交预约需求");
  const bookingNo = bookingResult.match(/DP\d{16}/)?.[0];
  assert.ok(bookingNo, bookingResult);

  await page.goto(`${origin}/order.html`, { waitUntil: "load" });
  const orderLookup = page.locator("#orderLookupForm");
  await orderLookup.locator('[name="trackingNo"]').fill(bookingNo);
  await orderLookup.locator('[name="phone"]').fill(phones.booking);
  await orderLookup.getByRole("button", { name: "查询预约进度" }).click();
  await page.locator("#orderStatusResult").waitFor({ state: "visible", timeout: 20000 });
  const orderResult = await page.locator("#orderStatusResult").textContent();
  assert.ok(orderResult.includes(bookingNo) && orderResult.includes("武汉"), orderResult);

  await page.goto(`${origin}/#join`, { waitUntil: "load" });
  const provider = page.locator("#providerForm");
  await provider.locator('[name="name"]').fill("全流程测试服务者");
  await provider.locator('[name="phone"]').fill(phones.provider);
  await provider.locator('[name="wechat"]').fill(`test_${seed}`);
  await provider.locator('[name="gender"]').selectOption("男");
  await provider.locator('[name="ageRange"]').selectOption("25-30");
  await provider.locator('[name="city"]').selectOption("武汉");
  await provider.locator('[name="serviceArea"]').fill("核心商圈、机场");
  await provider.locator('[name="serviceType"]').selectOption("商务接待");
  await provider.locator('[name="availableTime"]').fill("工作日、周末");
  await provider.locator('[name="price"]').fill("500");
  await provider.locator('[name="billingType"]').selectOption("半天");
  await provider.locator('[name="intro"]').fill("【全流程测试，请勿跟进】熟悉武汉商务路线、机场接待和会展客户陪同流程。");
  await provider.locator('[name="strengths"]').fill("路线规划、商务接待");
  await provider.locator('[name="languages"]').fill("普通话、英语");
  await provider.locator('[name="consent"]').check();
  const providerResult = await submitAndRead(provider, "提交入驻申请");
  const providerNo = providerResult.match(/FWZ\d{16}/)?.[0];
  assert.ok(providerNo, providerResult);

  await page.goto(`${origin}/provider-center.html`, { waitUntil: "load" });
  const providerLookup = page.locator("#providerStatusForm");
  await providerLookup.locator('[name="applicationNo"]').fill(providerNo);
  await providerLookup.locator('[name="phone"]').fill(phones.provider);
  await providerLookup.getByRole("button", { name: "查询审核状态" }).click();
  await page.locator("#providerStatusResult").waitFor({ state: "visible", timeout: 20000 });
  const providerStatus = await page.locator("#providerStatusResult").textContent();
  assert.ok(providerStatus.includes(providerNo) && providerStatus.includes("等待平台审核"), providerStatus);

  const support = page.locator("#providerSupport form");
  await support.locator('[name="name"]').fill("全流程测试服务者");
  await support.locator('[name="contact"]').fill(phones.provider);
  await support.locator('[name="city"]').selectOption("武汉");
  await support.locator('[name="providerRef"]').fill(providerNo);
  await support.locator('[name="preferredTime"]').fill("工作日 14 点后");
  await support.locator('[name="detail"]').fill("【全流程测试，请勿跟进】验证入驻编号关联和资料补充咨询链路。");
  await support.locator('[name="consent"]').check();
  const supportResult = await submitAndRead(support, "提交资料补充");
  assert.match(supportResult, /资料补充申请已提交[\s\S]*ZX\d{16}/);

  assert.equal(errors.length, 0, JSON.stringify(errors));
  console.log(JSON.stringify({ phones, accountResult, bookingNo, orderResult, providerNo, providerStatus, supportResult }, null, 2));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

