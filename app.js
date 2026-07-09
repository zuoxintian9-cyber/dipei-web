const scenarios = [
  {
    id: "beijing-business",
    title: "商务接待 · 北京",
    city: "北京",
    area: "朝阳 CBD",
    service: "商务接待",
    img: "./assets/provider-beijing.jpg",
    budget: 500,
    desc: "适合客户到访、商务会面、酒店会议、城市考察和机场高铁衔接。",
    points: ["会面路线规划", "酒店与会场协助", "商务礼仪提醒"],
    intro:
      "北京商务接待服务面向客户到访、企业考察、酒店会议和会展活动等正规场景。客服会根据人数、时间、语言和行程安排确认服务边界。"
  },
  {
    id: "shanghai-city",
    title: "城市陪同 · 上海",
    city: "上海",
    area: "陆家嘴 / 外滩",
    service: "城市陪同",
    img: "./assets/provider-shanghai.jpg",
    budget: 400,
    desc: "适合短期到访、商圈熟悉、城市动线安排和本地生活协助。",
    points: ["商圈熟悉", "交通动线", "本地建议"],
    intro:
      "上海城市陪同服务覆盖核心商圈、交通枢纽、酒店会面和短期城市熟悉等场景，不包含任何违规或私下交易内容。"
  },
  {
    id: "xian-guide",
    title: "旅游向导 · 西安",
    city: "西安",
    area: "钟楼 / 大雁塔",
    service: "旅游向导",
    img: "./assets/provider-xian.jpg",
    budget: 450,
    desc: "适合文化路线、景点讲解、行程规划和亲友接待陪同。",
    points: ["路线规划", "景点讲解", "餐饮建议"],
    intro:
      "西安旅游向导服务可按半天、全天或多日行程沟通路线，重点服务历史文化讲解、景区陪同和本地行程建议。"
  },
  {
    id: "guangzhou-assist",
    title: "办事协助 · 广州",
    city: "广州",
    area: "天河 / 越秀",
    service: "办事协助",
    img: "./assets/provider-guangzhou.jpg",
    budget: 350,
    desc: "适合政务大厅、银行、医院、学校等非敏感事务的现场指引。",
    points: ["资料提醒", "路线指引", "流程协助"],
    intro:
      "广州办事协助服务主要提供资料清单提醒、时间规划、路线指引和现场陪同，不代替用户作出法律、医疗、金融等专业判断。"
  },
  {
    id: "shenzhen-expo",
    title: "展会陪同 · 深圳",
    city: "深圳",
    area: "福田会展中心",
    service: "展会陪同",
    img: "./assets/provider-shenzhen.jpg",
    budget: 600,
    desc: "适合参展接待、客户引导、资料协助和基础沟通支持。",
    points: ["展会引导", "客户接待", "现场协助"],
    intro:
      "深圳展会陪同服务面向展会现场引导、参展客户接待、资料协助和会后路线安排，适合企业临时增加现场支持。"
  },
  {
    id: "chengdu-airport",
    title: "机场接送 · 成都",
    city: "成都",
    area: "双流 / 天府机场",
    service: "机场接送",
    img: "./assets/provider-chengdu.jpg",
    budget: 300,
    desc: "适合接机送机、中转协助、行李动线和酒店衔接。",
    points: ["航班衔接", "行李协助", "酒店路线"],
    intro:
      "成都机场接送服务根据航班时间、行李数量和目的地安排接送方案，强调准时、路线效率和必要的现场协助。"
  }
];

const SUPPORT_EMAIL = "zuoxintian9@gmail.com";
const FORM_ENDPOINT = window.DIPEI_FORM_ENDPOINT || "";
const DUPLICATE_WINDOW_MS = 60 * 1000;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[char];
  });
}

function cleanInput(value, maxLength = 120) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function localDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  clearTimeout(showToast.timer);
  toast.textContent = message;
  toast.classList.add("show");
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function renderScenarioCard(item) {
  const card = document.createElement("article");
  card.className = "scenario-card";
  card.innerHTML = `
    <div class="scenario-media">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}服务场景示意图" loading="lazy" />
      <span class="badge">场景示意</span>
    </div>
    <div class="scenario-body">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.desc)}</p>
      <div class="scenario-tags">
        ${item.points.map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
      <div class="scenario-foot">
        <strong>参考 ${escapeHtml(item.budget)} 元起</strong>
        <button class="mini-btn primary" type="button" data-detail="${escapeHtml(item.id)}">查看详情</button>
      </div>
    </div>
  `;
  return card;
}

function filterScenarios() {
  const city = $("#filterCity")?.value || "";
  const service = $("#filterService")?.value || "";
  const budget = Number($("#filterBudget")?.value || 0);
  const filtered = scenarios.filter((item) => {
    return (!city || item.city === city) && (!service || item.service === service) && (!budget || item.budget >= budget);
  });
  const grid = $("#scenarioGrid");
  if (grid) grid.replaceChildren(...filtered.map(renderScenarioCard));
  const summary = $("#resultSummary");
  if (summary) {
    summary.textContent = filtered.length
      ? `当前匹配 ${filtered.length} 个开放服务场景，可继续筛选或直接提交预约需求。`
      : "暂未找到完全匹配的服务场景，建议放宽城市、类型或预算条件。";
  }
}

function openScenarioDetail(id) {
  const item = scenarios.find((scenario) => scenario.id === id);
  const dialog = $("#scenarioDialog");
  const body = $("#dialogBody");
  if (!item || !dialog || !body) return;

  body.innerHTML = `
    <article class="dialog-provider">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.title)}服务场景示意图" />
      <div class="dialog-info">
        <span class="badge">正规服务场景</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.intro)}</p>
        <div class="detail-grid">
          <span><strong>开放城市</strong>${escapeHtml(item.city)} · ${escapeHtml(item.area)}</span>
          <span><strong>服务类型</strong>${escapeHtml(item.service)}</span>
          <span><strong>参考预算</strong>${escapeHtml(item.budget)} 元起</span>
          <span><strong>服务边界</strong>仅限正规陪同与协助</span>
        </div>
        <p><strong>可沟通事项：</strong>${escapeHtml(item.points.join(" / "))}</p>
        <p><strong>禁止内容：</strong>违法违规、低俗色情、私下交易、侵犯隐私、虚假资料和诱导绕开平台的行为。</p>
        <div class="dialog-actions">
          <button class="btn gold" type="button" data-prefill="${escapeHtml(item.id)}">带入预约表单</button>
          <button class="btn ghost" type="button" data-close-dialog>关闭</button>
        </div>
      </div>
    </article>
  `;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeScenarioDialog() {
  const dialog = $("#scenarioDialog");
  if (dialog?.open) dialog.close();
  document.body.classList.remove("dialog-open");
}

function prefillBooking(id) {
  const item = scenarios.find((scenario) => scenario.id === id);
  const form = $("#bookingForm");
  if (!item || !form) return;
  form.city.value = item.city;
  form.area.value = item.area;
  form.service.value = item.service;
  form.budget.value = String(item.budget);
  closeScenarioDialog();
  $("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`已带入 ${item.title} 的预约信息，请补充时间、人数和联系方式。`);
}

function isContactValid(value) {
  const contact = cleanInput(value, 80);
  const phone = /^1[3-9]\d{9}$/;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const wechat = /^[a-zA-Z][-_a-zA-Z0-9]{4,19}$/;
  return phone.test(contact) || email.test(contact) || wechat.test(contact);
}

function isBudgetValid(value) {
  return /^\d{2,6}(\s*[-~至]\s*\d{2,6})?$/.test(cleanInput(value, 30));
}

function validateLeadForm(form) {
  const errors = [];
  const today = localDateInputValue();
  const formType = form.dataset.leadType || "表单";
  const requiredFields = [...form.querySelectorAll("[required]")];

  requiredFields.forEach((field) => {
    const type = field.type;
    const empty = type === "checkbox" ? !field.checked : !cleanInput(field.value, 500);
    if (empty) errors.push("请完整填写必填项，并勾选协议同意。");
  });

  const date = form.elements.date?.value;
  if (date && date < today) errors.push("预约日期不能早于今天。");

  const people = form.elements.people?.value;
  if (people && (Number(people) < 1 || Number(people) > 99)) errors.push("人数需在 1 到 99 之间。");

  const budget = form.elements.budget?.value;
  if (budget && !isBudgetValid(budget)) errors.push("预算请填写数字或区间，例如 500 或 500-800。");

  const price = form.elements.price?.value;
  if (price && !/^\d{2,6}$/.test(cleanInput(price, 8))) errors.push("起步价格请填写纯数字。");

  const contact = form.elements.contact?.value || form.elements.phone?.value;
  if (contact && !isContactValid(contact)) errors.push("联系方式请填写 11 位手机号、邮箱或有效微信号。");

  const wechat = form.elements.wechat?.value;
  if (wechat && !isContactValid(wechat)) errors.push("微信号格式不正确，请检查后再提交。");

  const detail = form.elements.detail?.value;
  if (detail && cleanInput(detail, 500).length < 12) errors.push("具体需求描述至少需要 12 个字。");

  const intro = form.elements.intro?.value;
  if (intro && cleanInput(intro, 500).length < 20) errors.push("服务介绍至少需要 20 个字。");

  const unique = [...new Set(errors)];
  if (unique.length) {
    showToast(unique[0]);
    return false;
  }

  const duplicateKey = `dipei:last-submit:${formType}:${contact || cleanInput(form.elements.name?.value || "", 40)}`;
  const lastSubmit = Number(localStorage.getItem(duplicateKey) || 0);
  if (Date.now() - lastSubmit < DUPLICATE_WINDOW_MS) {
    showToast("提交过于频繁，请稍后再试。");
    return false;
  }
  localStorage.setItem(duplicateKey, String(Date.now()));
  return true;
}

function collectFormPayload(form) {
  const data = new FormData(form);
  const payload = {
    表单类型: form.dataset.leadType || "表单",
    来源页面: form.dataset.source || window.location.pathname,
    提交时间: new Date().toLocaleString("zh-CN", { hour12: false }),
    处理状态: "待处理"
  };
  data.forEach((value, key) => {
    if (key === "consent") return;
    payload[key] = cleanInput(value, 500);
  });
  payload.协议同意 = "已阅读并同意";
  return payload;
}

function payloadToText(payload) {
  return Object.entries(payload)
    .map(([key, value]) => `${key}: ${value || "未填写"}`)
    .join("\n");
}

async function submitLead(form) {
  const payload = collectFormPayload(form);
  if (FORM_ENDPOINT) {
    const response = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error("提交失败");
    return "提交成功";
  }

  const subject = encodeURIComponent(`地陪客户${payload.表单类型}`);
  const body = encodeURIComponent(payloadToText(payload));
  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  return "请在打开的邮件窗口中确认发送";
}

function bindLeadForms() {
  $$("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateLeadForm(form)) return;
      const submitButton = form.querySelector('[type="submit"]');
      submitButton.disabled = true;
      submitButton.textContent = "正在提交...";
      try {
        const result = await submitLead(form);
        form.reset();
        showToast(`${result}，请确认发送后客服才能收到。`);
      } catch (error) {
        showToast("提交失败，请通过联系客服页面补充发送。");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.label || submitButton.textContent.replace("正在提交...", "提交");
      }
    });
  });
}

function bindNavigation() {
  const menuToggle = $("#menuToggle");
  const mainNav = $("#mainNav");
  if (!menuToggle || !mainNav) return;
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      $$(".main-nav a").forEach((link) => link.classList.remove("active"));
      event.target.classList.add("active");
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    }
  });
}

document.addEventListener("click", (event) => {
  const categoryButton = event.target.closest("[data-service]");
  const detailButton = event.target.closest("[data-detail]");
  const prefillButton = event.target.closest("[data-prefill]");
  const closeButton = event.target.closest("[data-close-dialog]");

  if (categoryButton) {
    $$(".category-card").forEach((button) => button.classList.remove("active"));
    categoryButton.classList.add("active");
    const filterService = $("#filterService");
    if (filterService) filterService.value = categoryButton.dataset.service;
    filterScenarios();
    $("#cities")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (detailButton) openScenarioDetail(detailButton.dataset.detail);
  if (prefillButton) prefillBooking(prefillButton.dataset.prefill);
  if (closeButton) closeScenarioDialog();
});

$("#dialogClose")?.addEventListener("click", closeScenarioDialog);
$("#scenarioDialog")?.addEventListener("click", (event) => {
  if (event.target === $("#scenarioDialog")) closeScenarioDialog();
});

$("#searchForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const city = $("#filterCity");
  const service = $("#filterService");
  if (city) city.value = formData.get("city") || "";
  if (service) service.value = formData.get("service") || "";
  filterScenarios();
  $("#cities")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

["#filterCity", "#filterService", "#filterBudget"].forEach((selector) => {
  $(selector)?.addEventListener("change", filterScenarios);
});

$("#resetFilters")?.addEventListener("click", () => {
  ["#filterCity", "#filterService", "#filterBudget"].forEach((selector) => {
    const input = $(selector);
    if (input) input.value = "";
  });
  filterScenarios();
});

const today = localDateInputValue();
$$('input[type="date"]').forEach((input) => {
  input.min = today;
});

$$('[type="submit"]').forEach((button) => {
  button.dataset.label = button.textContent;
});

bindNavigation();
bindLeadForms();
filterScenarios();
