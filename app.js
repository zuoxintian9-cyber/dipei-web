const scenarios = [
  {
    id: "beijing-citywalk",
    title: "城市漫游 · 北京",
    city: "北京",
    area: "朝阳 / 东城",
    service: "城市漫游",
    img: "./assets/provider-beijing.jpg",
    budget: 199,
    desc: "适合初次到访、城市街区熟悉和半日公开路线同行。",
    meta: "城市体验｜公开场所｜提前 24 小时预约",
    skillSummary: "街区动线、交通建议、本地生活贴士",
    points: ["路线规划", "公开场所", "人工确认"],
    intro: "城市漫游仅围绕公开街区、商圈和交通动线提供同行与本地建议，不组织包价旅游。"
  },
  {
    id: "chengdu-checkin",
    title: "旅游打卡 · 成都",
    city: "成都",
    area: "春熙路 / 望平街",
    service: "旅游打卡",
    img: "./assets/provider-chengdu.jpg",
    budget: 239,
    desc: "按时间、体力和兴趣协助安排公开景点与街区打卡顺序。",
    meta: "城市体验｜路线不含门票餐费｜人工确认",
    skillSummary: "打卡路线、时间规划、餐饮交通建议",
    points: ["打卡路线", "时间管理", "费用边界"],
    intro: "本服务不含门票、餐饮、车费和旅行社包价产品，需持证导游的场景由合规合作方承接。"
  },
  {
    id: "shanghai-food",
    title: "美食探店 · 上海",
    city: "上海",
    area: "黄浦 / 静安",
    service: "美食探店",
    img: "./assets/provider-shanghai.jpg",
    budget: 228,
    desc: "结合口味、预算和交通协助安排正规餐厅与公开市集路线。",
    meta: "城市体验｜餐费自理｜不接受商家暗佣",
    skillSummary: "口味筛选、预算建议、餐厅交通动线",
    points: ["口味匹配", "餐费自理", "无暗佣"],
    intro: "平台服务费与餐饮消费分开，不以强制消费或未披露的商家返佣影响推荐。"
  },
  {
    id: "hangzhou-photo",
    title: "摄影跟拍 · 杭州",
    city: "杭州",
    area: "西湖 / 滨江",
    service: "摄影跟拍",
    img: "./assets/provider-xian.jpg",
    budget: 299,
    desc: "在公开场景提供轻量跟拍、构图建议和原片交付说明。",
    meta: "城市体验｜公开场所｜肖像授权单独确认",
    skillSummary: "轻量跟拍、打卡构图、原片交付",
    points: ["公开拍摄", "交付说明", "授权确认"],
    intro: "禁止偷拍、私密场所拍摄和未经同意公开照片；精修数量与交付时间在预约前确认。"
  },
  {
    id: "xian-outdoor",
    title: "户外轻运动 · 西安",
    city: "西安",
    area: "曲江 / 城墙公开区域",
    service: "户外轻运动",
    img: "./assets/provider-xian.jpg",
    budget: 268,
    desc: "仅开放公园步行、慢跑、入门骑行等低风险活动。",
    meta: "兴趣同行｜低风险｜天气与装备前置确认",
    skillSummary: "轻运动路线、节奏陪同、装备清单",
    points: ["低风险", "公开路线", "天气门禁"],
    intro: "攀岩、潜水、高海拔、野外穿越等高风险项目不在普通类目内，需专项资质和保险后再评估。"
  },
  {
    id: "shanghai-boardgame",
    title: "桌游同行 · 上海",
    city: "上海",
    area: "经审核桌游门店",
    service: "桌游同行",
    img: "./assets/provider-shanghai.jpg",
    budget: 168,
    desc: "适合公开门店的桌游、剧本与非现金棋牌入门同行。",
    meta: "兴趣同行｜公开门店｜禁止赌博",
    skillSummary: "规则讲解、新人友好、公开门店",
    points: ["新人友好", "非现金", "禁止赌博"],
    intro: "禁止现金赌博、私局抽成、诱导借贷与未成年人夜间履约。"
  },
  {
    id: "beijing-business",
    title: "商务接待 · 北京",
    city: "北京",
    area: "国贸 / 望京",
    service: "商务接待",
    img: "./assets/provider-beijing.jpg",
    budget: 500,
    desc: "面向客户到访、酒店会议和园区考察的路线与现场衔接。",
    meta: "商务服务｜职责清单｜企业需求人工复审",
    skillSummary: "客户接待、会面动线、酒店会场衔接",
    points: ["职责确认", "保密要求", "不涉招聘"],
    intro: "企业服务不得用于网络招聘、职业中介或劳务派遣；若需相关能力，必须由持许可主体承接。"
  },
  {
    id: "shenzhen-expo",
    title: "展会协助 · 深圳",
    city: "深圳",
    area: "福田 / 宝安会展",
    service: "展会协助",
    img: "./assets/provider-shenzhen.jpg",
    budget: 499,
    desc: "提供公开展会动线、资料整理和客户到场引导等基础协助。",
    meta: "商务服务｜公开活动｜职责与保密前置确认",
    skillSummary: "展馆动线、客户引导、资料协助",
    points: ["公开展会", "职责清单", "保密要求"],
    intro: "不承诺销售结果、不代替专业翻译或保安岗位，涉及专项资质时另行核验。"
  },
  {
    id: "chengdu-arrival",
    title: "交通接站 · 成都",
    city: "成都",
    area: "天府机场 / 成都东站",
    service: "交通接站",
    img: "./assets/provider-chengdu.jpg",
    budget: 259,
    desc: "协助确认出站口、行李动线和合规交通方式，不自营载客运输。",
    meta: "商务服务｜抵达协助｜车费由持证运力收取",
    skillSummary: "集合点、行李动线、酒店交通建议",
    points: ["抵达协助", "合规运力", "车费分开"],
    intro: "平台不直接组织无证载客；如需用车，由用户或合规运输服务商完成。"
  },
  {
    id: "guangzhou-errands",
    title: "办事陪同 · 广州",
    city: "广州",
    area: "天河 / 越秀",
    service: "办事陪同",
    img: "./assets/provider-guangzhou.jpg",
    budget: 239,
    desc: "提供公开流程、路线、资料清单和时间节点的现场协助。",
    meta: "生活协助｜不代办｜不替代专业判断",
    skillSummary: "资料提醒、路线指引、现场流程",
    points: ["公开流程", "不代办", "隐私最小化"],
    intro: "不冒用身份、不保证办理结果，不替代法律、医疗、金融或政务专业判断。"
  }
];

const FORM_ENDPOINT = window.DIPEI_FORM_ENDPOINT || "/api/feishu-submit";
const DUPLICATE_WINDOW_MS = 60 * 1000;
const RISK_WORDS = [
  "特殊服务",
  "陪睡",
  "色情",
  "私下交易",
  "加微信绕平台",
  "绕开平台",
  "裸聊",
  "赌博",
  "代办违法证件",
  "偷拍",
  "查别人隐私",
  "约炮",
  "援交",
  "包养",
  "卖淫",
  "嫖",
  "包夜",
  "陪酒",
  "私人空间",
  "现金局",
  "代练",
  "租号",
  "约会撮合"
];
const SUCCESS_LABELS = {
  用户预约需求表: "预约已提交",
  服务者入驻申请表: "入驻申请已提交",
  投诉举报表: "投诉举报已提交",
  客户咨询线索表: "咨询已提交"
};

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
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, maxLength);
}

function localDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function showToast(message, duration = 3200) {
  let toast = $("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }
  clearTimeout(showToast.timer);
  toast.textContent = message;
  toast.classList.add("show");
  showToast.timer = setTimeout(() => toast.classList.remove("show"), duration);
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
      <p class="scenario-meta">${escapeHtml(item.meta)}</p>
      <p>${escapeHtml(item.desc)}</p>
      <p class="scenario-skill"><strong>擅长：</strong>${escapeHtml(item.skillSummary)}</p>
      <div class="scenario-tags">
        ${item.points.map((point) => `<span>${escapeHtml(point)}</span>`).join("")}
      </div>
      <div class="scenario-foot">
        <strong>参考 ${escapeHtml(item.budget)} 元起</strong>
        <button class="mini-btn primary" type="button" data-prefill="${escapeHtml(item.id)}">提交需求匹配</button>
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
  form.budgetRange.value =
    item.budget >= 1000 ? "1000以上" : item.budget >= 500 ? "500-1000" : item.budget >= 300 ? "300-500" : "300以内";
  closeScenarioDialog();
  $("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`已带入 ${item.title} 的预约信息，请补充时间、人数和联系方式。`);
}

function isContactValid(value) {
  const contact = cleanInput(value, 80);
  const phone = /^1[3-9]\d{9}$/;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const wechat = /^[a-zA-Z0-9][-_a-zA-Z0-9]{4,29}$/;
  return phone.test(contact) || email.test(contact) || wechat.test(contact);
}

function isPhoneValid(value) {
  return /^1[3-9]\d{9}$/.test(cleanInput(value, 20));
}

function isBudgetValid(value) {
  return /^\d{2,6}(\s*[-~至]\s*\d{2,6})?$/.test(cleanInput(value, 30));
}

function hasRiskContent(value) {
  const text = cleanInput(value, 800).toLowerCase();
  return RISK_WORDS.some((word) => text.includes(word.toLowerCase()));
}

function formHasRiskContent(form) {
  if (form.dataset.leadType === "投诉举报表") return false;
  const safeNames = new Set(["customerName", "name", "complainantName", "phone", "contact", "wechat", "website", "consent"]);
  return [...form.elements].some((field) => {
    if (!field.name || safeNames.has(field.name)) return false;
    if (field.type === "checkbox") return false;
    return hasRiskContent(field.value);
  });
}

function lastSubmitTime(key) {
  try {
    return Number(localStorage.getItem(key) || 0);
  } catch {
    return 0;
  }
}

function rememberSubmit(key) {
  try {
    localStorage.setItem(key, String(Date.now()));
  } catch {
    // Storage can be unavailable in private or embedded browser modes.
  }
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
  if (date && form.elements.date.max && date > form.elements.date.max) errors.push("预约日期不能超过一年。");

  const people = form.elements.people?.value;
  if (people && (Number(people) < 1 || Number(people) > 99)) errors.push("人数需在 1 到 99 之间。");

  const budget = form.elements.budget?.value;
  if (budget && !isBudgetValid(budget)) errors.push("预算请填写数字或区间，例如 500 或 500-800。");

  const price = form.elements.price?.value;
  if (price && !/^\d{1,6}$/.test(cleanInput(price, 8))) errors.push("起步价格请填写纯数字。");

  const contact = form.elements.contact?.value || form.elements.phone?.value;
  if (form.elements.phone?.value && !isPhoneValid(form.elements.phone.value)) errors.push("手机号请填写 11 位大陆手机号。");
  if (form.elements.contact?.value && !isContactValid(contact)) errors.push("联系方式请填写 11 位手机号、邮箱或有效微信号。");

  const wechat = form.elements.wechat?.value;
  if (wechat && !isContactValid(wechat)) errors.push("微信号格式不正确，请检查后再提交。");

  if (formHasRiskContent(form)) errors.push("当前内容可能涉及违规服务，请修改后再提交。");

  const detail = form.elements.detail?.value;
  if (detail && cleanInput(detail, 500).length < 12) errors.push("具体需求描述至少需要 12 个字。");

  const intro = form.elements.intro?.value;
  if (intro && cleanInput(intro, 500).length < 20) errors.push("服务介绍至少需要 20 个字。");

  const unique = [...new Set(errors)];
  if (unique.length) {
    showToast(unique[0]);
    return false;
  }

  const duplicateScope = form.dataset.source || form.elements.topic?.value || window.location.pathname;
  const duplicateKey = `dipei:last-submit:${formType}:${duplicateScope}`;
  const lastSubmit = lastSubmitTime(duplicateKey);
  if (Date.now() - lastSubmit < DUPLICATE_WINDOW_MS) {
    showToast("提交过于频繁，请稍后再试。");
    return false;
  }
  form.dataset.duplicateKey = duplicateKey;
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
    const field = form.elements.namedItem(key);
    const declaredLimit = Number(field?.maxLength || 0);
    const limit = declaredLimit > 0 ? Math.min(declaredLimit, 1000) : 500;
    payload[key] = cleanInput(value, limit);
  });
  payload.协议同意 = "已阅读并同意";
  return payload;
}

function successMessage(formType, result = {}, payload = {}) {
  const consultLabels = {
    用户注册: "账号登记已提交",
    登录帮助: "账号协助已提交",
    订单进度: "订单协助已提交",
    服务者资料补充: "资料补充申请已提交",
    服务者中心: "服务者协助已提交"
  };
  const label = formType === "客户咨询线索表"
    ? (consultLabels[payload.topic] || SUCCESS_LABELS[formType])
    : (SUCCESS_LABELS[formType] || "提交成功");
  const publicId = result.publicId || result.trackingNo || result.recordId;
  const idLine = publicId ? `\n编号：${publicId}` : "";
  return `${label}${idLine}\n客服将在工作时间内联系你，请保存编号用于后续查询。`;
}

function showFormResult(form, message, type = "success") {
  let box = form.querySelector(".form-result");
  if (!box) {
    box = document.createElement("div");
    box.className = "form-result";
    box.setAttribute("role", "status");
    box.setAttribute("aria-live", "polite");
    form.append(box);
  }
  box.className = `form-result ${type}`;
  box.textContent = message;
}

async function submitLead(form) {
  const payload = collectFormPayload(form);
  if (FORM_ENDPOINT) {
    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) return successMessage(payload.表单类型, result, payload);
      if (result.code !== "FEISHU_NOT_CONFIGURED") throw new Error(result.message || "提交失败");
    } catch (error) {
      if (FORM_ENDPOINT !== "/api/feishu-submit") throw error;
      if (error.message && error.message !== "提交失败") throw error;
    }
  }

  throw new Error("提交通道暂不可用，请稍后重试。请勿重复提交同一需求。");
}

function bindLeadForms() {
  $$("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validateLeadForm(form)) return;
      const submitButton = form.querySelector('[type="submit"]');
      const originalLabel = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "正在提交...";
      try {
        const result = await submitLead(form);
        if (form.dataset.duplicateKey) rememberSubmit(form.dataset.duplicateKey);
        form.reset();
        showFormResult(form, result, "success");
        showToast(result.replace(/\n/g, " "), result.includes("编号：") ? 7000 : 3200);
      } catch (error) {
        const message = error.message || "提交失败，请通过联系客服页面补充发送。";
        showFormResult(form, message, "error");
        showToast(message, 5200);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalLabel;
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

function refreshSharedBrandLabels() {
  $$(".brand small").forEach((node) => { node.textContent = "城市兴趣服务平台"; });
  $$("a").forEach((link) => {
    if (link.textContent.trim() === "精选服务者") link.textContent = "精选达人";
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
const maxBookingDate = new Date();
maxBookingDate.setDate(maxBookingDate.getDate() + 366);
$$('input[type="date"]').forEach((input) => {
  if (input.dataset.allowPast === "true") return;
  input.min = today;
  input.max = localDateInputValue(maxBookingDate);
});

$$('[type="submit"]').forEach((button) => {
  button.dataset.label = button.textContent;
});

refreshSharedBrandLabels();
bindNavigation();
bindLeadForms();
filterScenarios();
