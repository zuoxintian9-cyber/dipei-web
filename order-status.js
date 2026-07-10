const orderLookupForm = document.querySelector("#orderLookupForm");
const orderStatusResult = document.querySelector("#orderStatusResult");
const orderSupportForm = document.querySelector("#orderSupportForm");

const ORDER_PROGRESS_LABELS = ["预约已提交", "客服已核对", "方案匹配中", "服务已确认", "服务已完成"];

function escapeOrderText(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function lookupToast(message) {
  if (typeof showToast === "function") showToast(message, 4200);
}

function setLookupResult(html, type) {
  if (!orderStatusResult) return;
  orderStatusResult.hidden = false;
  orderStatusResult.className = `order-status-result ${type}`;
  orderStatusResult.innerHTML = html;
  orderStatusResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderLookupError(message) {
  setLookupResult(
    `<div class="order-result-head"><span class="status-pill">查询未完成</span></div><p>${escapeOrderText(message)}</p><a class="btn ghost small" href="#manualSupport">提交人工协助</a>`,
    "error"
  );
}

function renderOrderStatus(data) {
  const step = Math.max(1, Math.min(5, Number(data.progressStep) || 1));
  const tone = ["active", "complete", "closed"].includes(data.statusTone) ? data.statusTone : "active";
  const progress = ORDER_PROGRESS_LABELS.map((label, index) => {
    const number = index + 1;
    const state = number < step ? "complete" : number === step ? "current" : "";
    return `<span class="${state}"><b>${number}</b>${escapeOrderText(label)}</span>`;
  }).join("");
  const orderLine = data.orderNo
    ? `<div><span>订单编号</span><strong>${escapeOrderText(data.orderNo)}</strong></div>`
    : "";
  const supportLink = data.supportNeeded
    ? `<a class="btn ghost small" href="#manualSupport">联系人工核验</a>`
    : `<a class="btn ghost small" href="./contact.html">联系客服</a>`;

  setLookupResult(
    `<div class="order-result-head">
      <div><span class="status-pill tone-${tone}">${escapeOrderText(data.statusLabel)}</span><strong>${escapeOrderText(data.trackingNo)}</strong></div>
      ${supportLink}
    </div>
    <div class="order-progress" aria-label="当前预约进度">${progress}</div>
    <div class="order-result-grid">
      <div><span>服务城市</span><strong>${escapeOrderText(data.city)}</strong></div>
      <div><span>服务类型</span><strong>${escapeOrderText(data.service)}</strong></div>
      <div><span>预约日期</span><strong>${escapeOrderText(data.serviceDate)}</strong></div>
      ${orderLine}
    </div>
    <p class="order-result-message">${escapeOrderText(data.message)}</p>`,
    `success tone-${tone}`
  );

  if (orderSupportForm) {
    const orderRef = orderSupportForm.elements.orderRef;
    const contact = orderSupportForm.elements.contact;
    const city = orderSupportForm.elements.city;
    if (orderRef) orderRef.value = data.trackingNo || "";
    if (contact) contact.value = orderLookupForm.elements.phone.value || "";
    if (city && [...city.options].some((option) => option.value === data.city)) city.value = data.city;
  }
}

orderLookupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const trackingNo = String(orderLookupForm.elements.trackingNo.value || "").trim().toUpperCase();
  const phone = String(orderLookupForm.elements.phone.value || "").replace(/[^\d]/g, "");
  if (!/^DP\d{12,16}$/.test(trackingNo) || !/^1[3-9]\d{9}$/.test(phone)) {
    const message = "请填写正确的 DP 预约编号和 11 位手机号。";
    renderLookupError(message);
    lookupToast(message);
    return;
  }

  const button = orderLookupForm.querySelector('[type="submit"]');
  button.disabled = true;
  button.textContent = "正在查询...";
  orderLookupForm.setAttribute("aria-busy", "true");
  try {
    const response = await fetch("/api/order-status", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ trackingNo, phone })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || "查询失败，请稍后重试。");
    renderOrderStatus(result);
    lookupToast("预约进度查询成功");
  } catch (error) {
    const message = error.message || "查询失败，请稍后重试。";
    renderLookupError(message);
    lookupToast(message);
  } finally {
    button.disabled = false;
    button.textContent = button.dataset.label || "查询预约进度";
    orderLookupForm.removeAttribute("aria-busy");
  }
});
