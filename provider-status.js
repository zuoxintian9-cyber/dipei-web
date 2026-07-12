const providerStatusForm = document.querySelector("#providerStatusForm");
const providerStatusResult = document.querySelector("#providerStatusResult");

function providerEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function showProviderStatus(data) {
  providerStatusResult.className = "order-status-result";
  providerStatusResult.hidden = false;
  providerStatusResult.innerHTML = `
    <div class="order-result-head">
      <div><span class="status-pill tone-${providerEscape(data.tone)}">${providerEscape(data.statusLabel)}</span><strong>${providerEscape(data.applicationNo)}</strong></div>
      <span>${providerEscape(data.city)} · ${providerEscape(data.serviceType)}</span>
    </div>
    <p class="order-result-message">${providerEscape(data.message)}</p>
    <div class="provider-query-meta"><span>审核状态：${providerEscape(data.status)}</span><span>身份认证：${providerEscape(data.identityStatus)}</span></div>
  `;
}

function showProviderError(message) {
  providerStatusResult.className = "order-status-result error";
  providerStatusResult.hidden = false;
  providerStatusResult.innerHTML = `<div class="order-result-head"><span class="status-pill">查询未完成</span></div><p>${providerEscape(message)}</p><a class="btn ghost small" href="#providerSupport">提交人工协助</a>`;
}

providerStatusForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const applicationNo = String(providerStatusForm.elements.applicationNo.value || "").trim().toUpperCase();
  const phone = String(providerStatusForm.elements.phone.value || "").replace(/\D/g, "");
  if (!/^FWZ\d{16}$/.test(applicationNo) || !/^1[3-9]\d{9}$/.test(phone)) {
    showProviderError("请填写正确的 FWZ 申请编号和 11 位手机号。");
    return;
  }
  const button = providerStatusForm.querySelector('[type="submit"]');
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "正在查询...";
  try {
    const response = await fetch("/api/provider-status", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ applicationNo, phone })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "查询失败，请稍后重试");
    showProviderStatus(data);
  } catch (error) {
    showProviderError(error.message || "查询失败，请稍后重试");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
});

