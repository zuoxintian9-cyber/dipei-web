const providerProfiles = [
  {
    id: "beijing-business",
    title: "商务接待 · 北京",
    city: "北京",
    area: "朝阳 CBD / 国贸",
    service: "商务接待",
    gender: "男",
    verified: true,
    available: true,
    rating: 4.9,
    orders: 128,
    price: 500,
    response: "30 分钟内",
    img: "./assets/provider-beijing.jpg",
    tags: ["商务礼仪", "会展支持", "机场高铁衔接"],
    intro: "适合客户到访、企业考察、酒店会议和会展活动等正规场景，可协助路线规划、会面动线和基础现场支持。",
    scope: ["客户到访接待", "商务路线规划", "酒店与会议场地衔接", "机场高铁接送建议"],
    reviews: ["响应很快，路线安排清楚。", "商务接待边界说明完整，沟通比较稳。"]
  },
  {
    id: "shanghai-city",
    title: "城市陪同 · 上海",
    city: "上海",
    area: "陆家嘴 / 外滩",
    service: "城市陪同",
    gender: "女",
    verified: true,
    available: true,
    rating: 4.9,
    orders: 96,
    price: 400,
    response: "30 分钟内",
    img: "./assets/provider-shanghai.jpg",
    tags: ["商圈熟悉", "本地建议", "交通动线"],
    intro: "适合短期到访、核心商圈熟悉、城市路线安排和本地生活协助，不包含任何违规或私下交易内容。",
    scope: ["核心商圈陪同", "城市路线建议", "酒店周边熟悉", "正规本地生活协助"],
    reviews: ["对浦东和外滩路线比较熟。", "沟通清楚，服务内容边界明确。"]
  },
  {
    id: "xian-guide",
    title: "旅游向导 · 西安",
    city: "西安",
    area: "钟楼 / 大雁塔",
    service: "旅游向导",
    gender: "女",
    verified: true,
    available: true,
    rating: 4.9,
    orders: 210,
    price: 450,
    response: "1 小时内",
    img: "./assets/provider-xian.jpg",
    tags: ["景点讲解", "路线规划", "餐饮建议"],
    intro: "可按半天、全天或多日行程沟通路线，重点服务历史文化讲解、景区陪同和本地行程建议。",
    scope: ["景区路线规划", "文化讲解", "餐饮与交通建议", "亲友接待陪同"],
    reviews: ["讲解有条理，适合亲友接待。", "路线安排紧凑但不赶。"]
  },
  {
    id: "guangzhou-assist",
    title: "办事协助 · 广州",
    city: "广州",
    area: "天河 / 越秀",
    service: "办事协助",
    gender: "男",
    verified: true,
    available: true,
    rating: 4.8,
    orders: 88,
    price: 350,
    response: "30 分钟内",
    img: "./assets/provider-guangzhou.jpg",
    tags: ["资料提醒", "路线指引", "现场陪同"],
    intro: "主要提供资料清单提醒、时间规划、路线指引和现场陪同，不代替用户作出法律、医疗、金融等专业判断。",
    scope: ["政务大厅路线", "资料清单提醒", "流程节点提示", "非专业判断类现场协助"],
    reviews: ["流程提醒很细。", "提前说明了哪些事项不能代办。"]
  },
  {
    id: "shenzhen-expo",
    title: "展会陪同 · 深圳",
    city: "深圳",
    area: "福田会展中心",
    service: "展会陪同",
    gender: "女",
    verified: true,
    available: true,
    rating: 5.0,
    orders: 76,
    price: 600,
    response: "30 分钟内",
    img: "./assets/provider-shenzhen.jpg",
    tags: ["展会引导", "客户接待", "资料协助"],
    intro: "面向展会现场引导、参展客户接待、资料协助和会后路线安排，适合企业临时增加现场支持。",
    scope: ["展会现场引导", "客户路线衔接", "资料协助", "会后交通建议"],
    reviews: ["展会现场动线熟悉。", "客户引导比较自然。"]
  },
  {
    id: "chengdu-airport",
    title: "机场接送 · 成都",
    city: "成都",
    area: "双流 / 天府机场",
    service: "机场接送",
    gender: "男",
    verified: true,
    available: true,
    rating: 4.9,
    orders: 154,
    price: 300,
    response: "1 小时内",
    img: "./assets/provider-chengdu.jpg",
    tags: ["航班衔接", "行李协助", "酒店路线"],
    intro: "根据航班时间、行李数量和目的地安排接送方案，强调准时、路线效率和必要的现场协助。",
    scope: ["接机送机", "中转路线提醒", "酒店衔接", "行李动线协助"],
    reviews: ["航站楼信息提醒准确。", "接送节奏安排不错。"]
  }
];

const providerCities = ["北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "重庆"];
const providerServices = ["商务接待", "城市陪同", "旅游向导", "办事协助", "展会陪同", "机场接送"];

const $p = (selector, root = document) => root.querySelector(selector);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function providerCard(profile) {
  return `
    <article class="provider-card">
      <div class="provider-media">
        <img src="${esc(profile.img)}" alt="${esc(profile.title)}服务者展示图" loading="lazy" />
        <span class="verify-badge">已认证</span>
      </div>
      <div class="provider-body">
        <div class="provider-title-row">
          <h3>${esc(profile.title)}</h3>
          <strong>¥${esc(profile.price)}起</strong>
        </div>
        <p>${esc(profile.intro)}</p>
        <div class="provider-meta">
          <span>${esc(profile.area)}</span>
          <span>评分 ${esc(profile.rating)}</span>
          <span>服务 ${esc(profile.orders)} 次</span>
          <span>${esc(profile.response)}响应</span>
        </div>
        <div class="provider-tags">${profile.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>
        <div class="provider-actions">
          <a class="btn ghost" href="./provider.html?id=${encodeURIComponent(profile.id)}">查看详情</a>
          <a class="btn gold" href="./index.html#booking">立即预约</a>
        </div>
      </div>
    </article>
  `;
}

function renderProviderList() {
  const grid = $p("#providerGrid");
  if (!grid) return;
  const city = $p("#providerCity")?.value || "";
  const service = $p("#providerService")?.value || "";
  const price = Number($p("#providerPrice")?.value || 0);
  const gender = $p("#providerGender")?.value || "";
  const filtered = providerProfiles.filter((profile) => {
    return (!city || profile.city === city) && (!service || profile.service === service) && (!price || profile.price <= price) && (!gender || profile.gender === gender);
  });
  grid.innerHTML = filtered.map(providerCard).join("");
  const summary = $p("#providerSummary");
  if (summary) summary.textContent = filtered.length ? `当前匹配 ${filtered.length} 位服务者展示样例，实际可约情况由客服确认。` : "暂未匹配到服务者，可放宽筛选条件或提交预约需求。";
}

function renderProviderDetail() {
  const detail = $p("#providerDetail");
  if (!detail) return;
  const params = new URLSearchParams(window.location.search);
  const profile = providerProfiles.find((item) => item.id === params.get("id")) || providerProfiles[0];
  document.title = `${profile.title}｜地陪客户`;
  detail.innerHTML = `
    <section class="detail-hero">
      <img src="${esc(profile.img)}" alt="${esc(profile.title)}服务者展示图" />
      <div>
        <p class="eyebrow">已认证服务者</p>
        <h1>${esc(profile.title)}</h1>
        <p>${esc(profile.intro)}</p>
        <div class="detail-stats">
          <span><strong>${esc(profile.rating)}</strong>评分</span>
          <span><strong>${esc(profile.orders)}</strong>服务次数</span>
          <span><strong>¥${esc(profile.price)}</strong>起步价</span>
          <span><strong>${esc(profile.response)}</strong>响应</span>
        </div>
        <div class="detail-actions">
          <a class="btn gold" href="./index.html#booking">提交预约需求</a>
          <a class="btn ghost" href="./contact.html">先咨询客服</a>
        </div>
      </div>
    </section>
    <section class="detail-grid-section">
      <article>
        <h2>服务范围</h2>
        <ul>${profile.scope.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </article>
      <article>
        <h2>服务流程</h2>
        <ol>
          <li>提交需求并说明城市、时间、人数和预算</li>
          <li>平台客服确认服务边界和可服务情况</li>
          <li>确认服务者、费用、地点和注意事项</li>
          <li>按约定完成服务并保留必要沟通记录</li>
          <li>服务后可评价或提交投诉举报</li>
        </ol>
      </article>
      <article>
        <h2>用户反馈</h2>
        <ul>${profile.reviews.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </article>
      <article>
        <h2>注意事项</h2>
        <p>仅提供正规城市陪同、商务接待、旅游向导、办事协助等服务。严禁违法违规、低俗色情、私下交易和绕开平台的行为。</p>
      </article>
    </section>
  `;
}

["#providerCity", "#providerService", "#providerPrice", "#providerGender"].forEach((selector) => {
  $p(selector)?.addEventListener("change", renderProviderList);
});

$p("#resetProviderFilters")?.addEventListener("click", () => {
  ["#providerCity", "#providerService", "#providerPrice", "#providerGender"].forEach((selector) => {
    const input = $p(selector);
    if (input) input.value = "";
  });
  renderProviderList();
});

renderProviderList();
renderProviderDetail();
