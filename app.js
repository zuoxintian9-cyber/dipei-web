const providers = [
  {
    id: "beijing-business",
    title: "商务接待 · 北京",
    city: "北京",
    area: "朝阳 CBD",
    service: "商务接待",
    img: "./assets/provider-beijing.jpg",
    desc: "10年从业经验，熟悉核心商圈、酒店会场与商务接待礼仪。",
    rating: 4.9,
    count: 128,
    price: 500,
    response: "20 分钟内",
    strengths: ["商务会面", "展会陪同", "机场接送"],
    intro:
      "提供北京地区商务接待、城市陪同、展会协助、机场接送等服务，熟悉核心商圈、酒店、交通路线及常见商务接待场景。"
  },
  {
    id: "shanghai-city",
    title: "城市陪同 · 上海",
    city: "上海",
    area: "陆家嘴",
    service: "城市陪同",
    img: "./assets/provider-shanghai.jpg",
    desc: "资深本地陪同，适合商务随行、城市动线安排和生活协助。",
    rating: 4.9,
    count: 96,
    price: 400,
    response: "25 分钟内",
    strengths: ["商务随行", "城市陪伴", "路线规划"],
    intro:
      "熟悉上海核心商圈、交通节点与酒店会面场景，可为短期到访客户提供城市陪同、路线安排和本地生活建议。"
  },
  {
    id: "xian-guide",
    title: "旅游向导 · 西安",
    city: "西安",
    area: "钟楼 / 大雁塔",
    service: "旅游向导",
    img: "./assets/provider-xian.jpg",
    desc: "金牌导游，擅长深度讲解、文化路线与亲友接待行程。",
    rating: 4.9,
    count: 210,
    price: 450,
    response: "15 分钟内",
    strengths: ["深度讲解", "行程规划", "景区陪同"],
    intro:
      "可按客户兴趣规划半日、全天或多日路线，覆盖历史文化讲解、热门景区陪同、餐饮建议和交通衔接。"
  },
  {
    id: "guangzhou-assist",
    title: "办事协助 · 广州",
    city: "广州",
    area: "天河 / 越秀",
    service: "办事协助",
    img: "./assets/provider-guangzhou.jpg",
    desc: "政务代办、资料整理、路线指引，高效可靠。",
    rating: 4.9,
    count: 88,
    price: 350,
    response: "30 分钟内",
    strengths: ["政务协助", "资料整理", "生活协助"],
    intro:
      "适合政务大厅、银行、医院、学校等非敏感事务协助，可提前梳理资料、规划时间并现场陪同。"
  },
  {
    id: "shenzhen-expo",
    title: "展会陪同 · 深圳",
    city: "深圳",
    area: "福田会展中心",
    service: "展会陪同",
    img: "./assets/provider-shenzhen.jpg",
    desc: "展会翻译、商务支持、客户引导，适合高频商务场景。",
    rating: 5.0,
    count: 76,
    price: 600,
    response: "18 分钟内",
    strengths: ["展会翻译", "商务支持", "客户引导"],
    intro:
      "服务覆盖展会现场引导、参展客户接待、基础翻译、资料协助与会后路线安排，适合企业临时增援。"
  },
  {
    id: "chengdu-airport",
    title: "机场陪同 · 成都",
    city: "成都",
    area: "双流 / 天府机场",
    service: "机场接送",
    img: "./assets/provider-chengdu.jpg",
    desc: "准时守候、安全舒适，适合接机送机与中转协助。",
    rating: 4.9,
    count: 154,
    price: 300,
    response: "20 分钟内",
    strengths: ["接机送机", "中转协助", "路线安排"],
    intro:
      "根据航班时间、行李数量和目的地安排接送服务，可协助客户完成到达、中转、酒店衔接和城市路线建议。"
  }
];

const orders = [
  {
    id: "D2026070801",
    title: "商务接待 · 北京",
    city: "北京",
    area: "朝阳 CBD",
    service: "商务接待",
    date: "2026-07-12",
    time: "09:30",
    status: "待确认",
    budget: "¥500 起",
    contact: "138****6688"
  },
  {
    id: "D2026070802",
    title: "展会陪同 · 深圳",
    city: "深圳",
    area: "福田会展中心",
    service: "展会陪同",
    date: "2026-07-13",
    time: "14:00",
    status: "服务中",
    budget: "¥600 起",
    contact: "企业客户"
  },
  {
    id: "D2026070703",
    title: "机场陪同 · 成都",
    city: "成都",
    area: "天府机场",
    service: "机场接送",
    date: "2026-07-07",
    time: "18:20",
    status: "已完成",
    budget: "¥300 起",
    contact: "186****9021"
  }
];

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const featuredGrid = $("#featuredGrid");
const providerGrid = $("#providerGrid");
const resultSummary = $("#resultSummary");
const dialog = $("#providerDialog");
const dialogBody = $("#dialogBody");
const authDialog = $("#authDialog");
const authTitle = $("#authTitle");
const authSubmit = $("#authSubmit");
const orderList = $("#orderList");
const providerOrderRows = $("#providerOrderRows");
const toast = $("#toast");
let toastTimer;
let currentOrderFilter = "all";
let authMode = "login";

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

function cleanInput(value, maxLength = 80) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function localDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function renderCard(provider) {
  const card = document.createElement("article");
  card.className = "provider-card";
  card.innerHTML = `
    <div class="provider-media">
      <img src="${escapeHtml(provider.img)}" alt="${escapeHtml(provider.title)}服务者照片" loading="lazy">
    </div>
    <div class="provider-body">
      <h3>${escapeHtml(provider.title)}</h3>
      <p class="provider-desc">${escapeHtml(provider.desc)}</p>
      <div class="provider-meta">
        <span><b class="star">★</b> ${provider.rating.toFixed(1)}</span>
        <span>服务${provider.count}次</span>
      </div>
      <div class="provider-foot">
        <strong class="price">¥${provider.price}<small>起</small></strong>
        <div class="card-actions">
          <button class="mini-btn" type="button" data-detail="${escapeHtml(provider.id)}">详情</button>
          <button class="mini-btn primary" type="button" data-book="${escapeHtml(provider.id)}">咨询</button>
        </div>
      </div>
    </div>
  `;
  return card;
}

function renderProviders(list = providers) {
  featuredGrid.replaceChildren(...providers.map(renderCard));
  providerGrid.replaceChildren(...list.map(renderCard));
  resultSummary.textContent = `已为你匹配 ${list.length} 位服务者，可继续按城市、类型、价格与认证状态筛选。`;
}

function statusClass(status) {
  if (status === "待确认") return "pending";
  if (status === "服务中" || status === "已接单") return "active";
  if (status === "已取消") return "canceled";
  return "done";
}

function renderOrderActions(order) {
  if (order.status === "待确认") {
    return `
      <button class="mini-btn primary" type="button" data-order-accept="${escapeHtml(order.id)}">接单</button>
      <button class="mini-btn" type="button" data-order-reject="${escapeHtml(order.id)}">拒单</button>
    `;
  }
  if (order.status === "服务中") {
    return `<button class="mini-btn primary" type="button" data-order-complete="${escapeHtml(order.id)}">完成</button>`;
  }
  return `<span class="status-pill ${statusClass(order.status)}">${escapeHtml(order.status)}</span>`;
}

function renderOrders(filter = currentOrderFilter) {
  currentOrderFilter = filter;
  const visibleOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter);
  orderList.replaceChildren(
    ...visibleOrders.map((order) => {
      const card = document.createElement("article");
      card.className = "order-card";
      card.innerHTML = `
        <div>
          <h3>${escapeHtml(order.title)}</h3>
          <p>${escapeHtml(order.area)} · ${escapeHtml(order.service)} · ${escapeHtml(order.budget)}</p>
          <div class="order-meta">
            <span>订单号 ${escapeHtml(order.id)}</span>
            <span>${escapeHtml(order.date)} ${escapeHtml(order.time)}</span>
            <span>${escapeHtml(order.contact)}</span>
          </div>
        </div>
        <span class="status-pill ${statusClass(order.status)}">${escapeHtml(order.status)}</span>
      `;
      return card;
    })
  );

  $("#totalOrders").textContent = orders.length;
  $("#pendingOrders").textContent = orders.filter((order) => order.status === "待确认").length;
  $("#activeOrders").textContent = orders.filter((order) => order.status === "服务中").length;
  $("#doneOrders").textContent = orders.filter((order) => order.status === "已完成").length;
}

function renderProviderOrders() {
  const providerOrders = orders.filter((order) => order.status === "待确认" || order.status === "服务中");
  providerOrderRows.replaceChildren(
    ...providerOrders.map((order) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(order.id)}</td>
        <td>${escapeHtml(order.city)}</td>
        <td>${escapeHtml(order.date)} ${escapeHtml(order.time)}</td>
        <td><span class="status-pill ${statusClass(order.status)}">${escapeHtml(order.status)}</span></td>
        <td>${renderOrderActions(order)}</td>
      `;
      return row;
    })
  );
}

function filterByPrice(provider, value) {
  if (!value) return true;
  if (value === "399") return provider.price <= 399;
  if (value === "499") return provider.price >= 400 && provider.price <= 499;
  if (value === "599") return provider.price >= 500 && provider.price <= 599;
  return provider.price >= 600;
}

function applyFilters() {
  const city = $("#filterCity").value;
  const service = $("#filterService").value;
  const price = $("#filterPrice").value;
  const verified = $("#filterVerified").value;
  const filtered = providers.filter((provider) => {
    return (
      (!city || provider.city === city) &&
      (!service || provider.service === service) &&
      filterByPrice(provider, price) &&
      (!verified || verified === "verified")
    );
  });

  providerGrid.replaceChildren(...filtered.map(renderCard));
  resultSummary.textContent = filtered.length
    ? `已为你匹配 ${filtered.length} 位服务者，可点击详情查看服务范围与流程。`
    : "暂未找到完全匹配的服务者，建议放宽城市、价格或服务类型。";
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function openDetail(id) {
  const provider = providers.find((item) => item.id === id);
  if (!provider) return;
  dialogBody.innerHTML = `
    <article class="dialog-provider">
      <img src="${escapeHtml(provider.img)}" alt="${escapeHtml(provider.title)}服务者照片">
      <div class="dialog-info">
        <span class="badge">✓ 已认证</span>
        <h2>${escapeHtml(provider.title)}</h2>
        <p>${escapeHtml(provider.intro)}</p>
        <div class="detail-grid">
          <span><strong>服务城市</strong>${escapeHtml(provider.city)} · ${escapeHtml(provider.area)}</span>
          <span><strong>服务类型</strong>${escapeHtml(provider.service)}</span>
          <span><strong>起步价格</strong>¥${provider.price} 起</span>
          <span><strong>响应速度</strong>${escapeHtml(provider.response)}</span>
          <span><strong>服务评分</strong>${provider.rating.toFixed(1)} / 5.0</span>
          <span><strong>服务次数</strong>${provider.count} 次</span>
        </div>
        <p><strong>擅长：</strong>${escapeHtml(provider.strengths.join(" / "))}</p>
        <p><strong>服务流程：</strong>提交需求 → 平台确认 → 服务者沟通 → 确认时间地点 → 开始服务 → 完成评价。</p>
        <div class="dialog-actions">
          <button class="btn gold" type="button" data-book="${escapeHtml(provider.id)}">立即咨询</button>
          <button class="btn ghost" type="button" data-close-dialog>稍后再看</button>
        </div>
      </div>
    </article>
  `;
  dialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeDialog() {
  if (dialog.open) dialog.close();
  document.body.classList.remove("dialog-open");
}

function prefillBooking(id) {
  const provider = providers.find((item) => item.id === id);
  if (!provider) return;
  const form = $("#bookingForm");
  form.city.value = provider.city;
  form.service.value = provider.service;
  form.area.value = provider.area;
  form.budget.value = `¥${provider.price} 起`;
  closeDialog();
  $("#booking").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast(`已带入 ${provider.title} 的预约信息，请补充时间和联系方式。`);
}

function syncSearchToFilters(formData) {
  $("#filterCity").value = formData.get("city") || "";
  $("#filterService").value = formData.get("service") || "";
  $("#filterPrice").value = "";
  $("#filterVerified").value = "verified";
  applyFilters();
}

function openAuth(mode = "login") {
  setAuthMode(mode);
  authDialog.showModal();
  document.body.classList.add("dialog-open");
}

function closeAuth() {
  if (authDialog.open) authDialog.close();
  document.body.classList.remove("dialog-open");
}

function setAuthMode(mode) {
  authMode = mode;
  $("[data-auth-mode='login']").classList.toggle("active", mode === "login");
  $("[data-auth-mode='register']").classList.toggle("active", mode === "register");
  authTitle.textContent = mode === "login" ? "登录地陪客户" : "注册地陪客户";
  authSubmit.textContent = mode === "login" ? "登录" : "注册";
  $("#roleField").classList.toggle("is-hidden", mode !== "register");
}

function addOrderFromBooking(form) {
  const formData = new FormData(form);
  const service = cleanInput(formData.get("service"), 24);
  const city = cleanInput(formData.get("city"), 24);
  const area = cleanInput(formData.get("area"), 60);
  const date = cleanInput(formData.get("date"), 10);
  const time = cleanInput(formData.get("time"), 5);
  const budget = cleanInput(formData.get("budget"), 30) || "待确认";
  const id = `D${Date.now().toString().slice(-10)}`;
  orders.unshift({
    id,
    title: `${service} · ${city}`,
    city,
    area,
    service,
    date,
    time,
    status: "待确认",
    budget,
    contact: cleanInput(formData.get("contact"), 40)
  });
  renderOrders("all");
  renderProviderOrders();
}

renderProviders();
renderOrders();
renderProviderOrders();

$("#searchForm").addEventListener("submit", (event) => {
  event.preventDefault();
  syncSearchToFilters(new FormData(event.currentTarget));
  $("#serviceList").scrollIntoView({ behavior: "smooth", block: "start" });
});

["#filterCity", "#filterService", "#filterPrice", "#filterVerified"].forEach((selector) => {
  $(selector).addEventListener("change", applyFilters);
});

$("#resetFilters").addEventListener("click", () => {
  $("#filterCity").value = "";
  $("#filterService").value = "";
  $("#filterPrice").value = "";
  $("#filterVerified").value = "";
  applyFilters();
});

document.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail]");
  const bookButton = event.target.closest("[data-book]");
  const closeButton = event.target.closest("[data-close-dialog]");
  const categoryButton = event.target.closest("[data-service]");
  const headerAction = event.target.closest("[data-action]");
  const orderFilter = event.target.closest("[data-order-filter]");
  const authModeButton = event.target.closest("[data-auth-mode]");
  const acceptButton = event.target.closest("[data-order-accept]");
  const rejectButton = event.target.closest("[data-order-reject]");
  const completeButton = event.target.closest("[data-order-complete]");
  const adminPassButton = event.target.closest("[data-admin-pass]");

  if (detailButton) openDetail(detailButton.dataset.detail);
  if (bookButton) prefillBooking(bookButton.dataset.book);
  if (closeButton) closeDialog();
  if (categoryButton) {
    $$(".category-card").forEach((button) => button.classList.remove("active"));
    categoryButton.classList.add("active");
    $("#filterService").value = categoryButton.dataset.service;
    applyFilters();
    $("#serviceList").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (headerAction) {
    if (headerAction.dataset.action === "login") openAuth("login");
    if (headerAction.dataset.action === "register") openAuth("register");
    if (headerAction.dataset.action === "provider-register") {
      $("#join").scrollIntoView({ behavior: "smooth", block: "start" });
      openAuth("register");
      $("select[name='role']", $("#authForm")).value = "服务者";
    }
    if (headerAction.dataset.action === "admin-login") {
      openAuth("login");
      showToast("管理员登录入口已打开，静态原型会模拟权限校验。");
    }
  }
  if (orderFilter) {
    $$(".segmented [data-order-filter]").forEach((button) => button.classList.remove("active"));
    orderFilter.classList.add("active");
    renderOrders(orderFilter.dataset.orderFilter);
  }
  if (authModeButton) {
    setAuthMode(authModeButton.dataset.authMode);
  }
  if (acceptButton) {
    const order = orders.find((item) => item.id === acceptButton.dataset.orderAccept);
    if (order) {
      order.status = "服务中";
      renderOrders(currentOrderFilter);
      renderProviderOrders();
      showToast(`${order.id} 已接单，状态更新为服务中。`);
    }
  }
  if (rejectButton) {
    const order = orders.find((item) => item.id === rejectButton.dataset.orderReject);
    if (order) {
      order.status = "已取消";
      renderOrders(currentOrderFilter);
      renderProviderOrders();
      showToast(`${order.id} 已拒单，订单状态已取消。`);
    }
  }
  if (completeButton) {
    const order = orders.find((item) => item.id === completeButton.dataset.orderComplete);
    if (order) {
      order.status = "已完成";
      renderOrders(currentOrderFilter);
      renderProviderOrders();
      showToast(`${order.id} 已完成，等待用户评价。`);
    }
  }
  if (adminPassButton) {
    const row = adminPassButton.closest("tr");
    row.querySelector(".status-pill").className = "status-pill done";
    row.querySelector(".status-pill").textContent = "已通过";
    adminPassButton.disabled = true;
    adminPassButton.textContent = "已通过";
    $("#reviewCount").textContent = Math.max(0, Number($("#reviewCount").textContent) - 1);
    showToast("服务者审核已通过，可在前台推荐位展示。");
  }
});

$("#dialogClose").addEventListener("click", closeDialog);
$("#authClose").addEventListener("click", closeAuth);

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});

authDialog.addEventListener("click", (event) => {
  if (event.target === authDialog) closeAuth();
});

$("#bookingForm").addEventListener("submit", (event) => {
  event.preventDefault();
  addOrderFromBooking(event.currentTarget);
  event.currentTarget.reset();
  $("#clientDesk").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("预约需求已提交，并已生成一条待确认订单。");
});

$("#authForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const role = new FormData(event.currentTarget).get("role");
  closeAuth();
  showToast(authMode === "login" ? `${role || "用户"}登录成功，已进入原型工作流。` : `${role}注册信息已提交。`);
});

$("#providerForm").addEventListener("submit", (event) => {
  event.preventDefault();
  $("#providerAuditState").className = "status-pill pending";
  $("#providerAuditState").textContent = "审核中";
  showToast("入驻资料已提交，后台审核通过后可展示到前台。");
});

$("#publishService").addEventListener("click", () => {
  $("#providerAuditState").className = "status-pill active";
  $("#providerAuditState").textContent = "服务待上架";
  showToast("服务项目已保存，等待管理员上架。");
});

$("#addCity").addEventListener("click", () => {
  const tag = document.createElement("span");
  tag.textContent = "杭州 · 5 区";
  $("#cityTags").append(tag);
  showToast("已添加示例城市：杭州。");
});

const menuToggle = $("#menuToggle");
const mainNav = $("#mainNav");

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

const today = localDateInputValue();
$$('input[type="date"]').forEach((input) => {
  input.min = today;
});
