const providerProfiles = [
  {
    id: "beijing-business",
    title: "商务接待 · 北京",
    city: "北京",
    area: "朝阳 CBD / 国贸",
    service: "商务接待",
    gender: "男",
    price: 500,
    img: "./assets/provider-beijing.jpg",
    tags: ["商务礼仪", "会展支持", "机场高铁衔接"],
    capability: "能力示例｜商务接待｜普通话/英语需求可备注",
    intro: "适合客户到访、企业考察、酒店会议和会展活动等正规场景，可协助路线规划、会面动线和基础现场支持。",
    scope: ["客户到访接待", "商务路线规划", "酒店与会议场地衔接", "机场高铁接送建议"]
  },
  {
    id: "shanghai-city",
    title: "城市陪同 · 上海",
    city: "上海",
    area: "陆家嘴 / 外滩",
    service: "城市陪同",
    gender: "女",
    price: 400,
    img: "./assets/provider-shanghai.jpg",
    tags: ["商圈熟悉", "本地建议", "交通动线"],
    capability: "能力示例｜城市陪同｜普通话/英语需求可备注",
    intro: "适合短期到访、核心商圈熟悉、城市路线安排和本地生活协助，不包含任何违规或私下交易内容。",
    scope: ["核心商圈陪同", "城市路线建议", "酒店周边熟悉", "正规本地生活协助"]
  },
  {
    id: "xian-guide",
    title: "旅游向导 · 西安",
    city: "西安",
    area: "钟楼 / 大雁塔",
    service: "旅游向导",
    gender: "女",
    price: 450,
    img: "./assets/provider-xian.jpg",
    tags: ["景点讲解", "路线规划", "餐饮建议"],
    capability: "能力示例｜文化路线｜普通话服务场景",
    intro: "可按半天、全天或多日行程沟通路线，重点服务历史文化讲解、景区陪同和本地行程建议。",
    scope: ["景区路线规划", "文化讲解", "餐饮与交通建议", "亲友接待陪同"]
  },
  {
    id: "guangzhou-assist",
    title: "办事协助 · 广州",
    city: "广州",
    area: "天河 / 越秀",
    service: "办事协助",
    gender: "男",
    price: 350,
    img: "./assets/provider-guangzhou.jpg",
    tags: ["资料提醒", "路线指引", "现场陪同"],
    capability: "能力示例｜现场协助｜普通话/粤语需求可备注",
    intro: "主要提供资料清单提醒、时间规划、路线指引和现场陪同，不代替用户作出法律、医疗、金融等专业判断。",
    scope: ["政务大厅路线", "资料清单提醒", "流程节点提示", "非专业判断类现场协助"]
  },
  {
    id: "shenzhen-expo",
    title: "展会陪同 · 深圳",
    city: "深圳",
    area: "福田会展中心",
    service: "展会陪同",
    gender: "女",
    price: 600,
    img: "./assets/provider-shenzhen.jpg",
    tags: ["展会引导", "客户接待", "资料协助"],
    capability: "能力示例｜展会支持｜普通话/英语需求可备注",
    intro: "面向展会现场引导、参展客户接待、资料协助和会后路线安排，适合企业临时增加现场支持。",
    scope: ["展会现场引导", "客户路线衔接", "资料协助", "会后交通建议"]
  },
  {
    id: "chengdu-airport",
    title: "机场接送 · 成都",
    city: "成都",
    area: "双流 / 天府机场",
    service: "机场接送",
    gender: "男",
    price: 300,
    img: "./assets/provider-chengdu.jpg",
    tags: ["航班衔接", "行李协助", "酒店路线"],
    capability: "能力示例｜交通衔接｜普通话服务场景",
    intro: "根据航班时间、行李数量和目的地安排接送方案，强调准时、路线效率和必要的现场协助。",
    scope: ["接机送机", "中转路线提醒", "酒店衔接", "行李动线协助"]
  }
];

const $p = (selector, root = document) => root.querySelector(selector);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function providerCard(profile) {
  return `
    <article class="provider-card">
      <div class="provider-media">
        <img src="${esc(profile.img)}" alt="${esc(profile.title)}服务能力示意图" loading="lazy" />
        <span class="verify-badge">能力示例</span>
      </div>
      <div class="provider-body">
        <div class="provider-title-row">
          <h3>${esc(profile.title)}</h3>
          <strong>¥${esc(profile.price)}起</strong>
        </div>
        <p class="provider-audit">${esc(profile.capability)}</p>
        <p>${esc(profile.intro)}</p>
        <div class="provider-meta">
          <span>${esc(profile.area)}</span>
          <span>参考 ¥${esc(profile.price)} 起</span>
          <span>实际人员与档期由客服确认</span>
        </div>
        <div class="provider-tags">${profile.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>
        <div class="provider-actions">
          <a class="btn ghost" href="./provider.html?id=${encodeURIComponent(profile.id)}">查看能力说明</a>
          <a class="btn gold" href="./index.html#booking">提交需求匹配</a>
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
  if (summary) summary.textContent = filtered.length
    ? `当前匹配 ${filtered.length} 个服务能力示例，实际人员、资质、档期和价格由客服确认。`
    : "暂未匹配到能力示例，可放宽筛选条件或提交预约需求。";
}

function renderProviderDetail() {
  const detail = $p("#providerDetail");
  if (!detail) return;
  const params = new URLSearchParams(window.location.search);
  const profile = providerProfiles.find((item) => item.id === params.get("id")) || providerProfiles[0];
  document.title = `${profile.title}服务能力示例｜地陪客户`;
  detail.innerHTML = `
    <section class="detail-hero">
      <img src="${esc(profile.img)}" alt="${esc(profile.title)}服务能力示意图" />
      <div>
        <p class="eyebrow">服务能力示例</p>
        <h1>${esc(profile.title)}</h1>
        <p>${esc(profile.capability)}</p>
        <p>${esc(profile.intro)}</p>
        <div class="detail-stats">
          <span><strong>¥${esc(profile.price)}</strong>参考起步价</span>
          <span><strong>${esc(profile.area)}</strong>参考区域</span>
          <span><strong>人工确认</strong>人员与档期</span>
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
          <li>确认实际服务者、费用、地点和注意事项</li>
          <li>按约定完成服务并保留必要沟通记录</li>
          <li>服务后可评价或提交投诉举报</li>
        </ol>
      </article>
      <article>
        <h2>展示说明</h2>
        <p>本页是服务能力与可预约场景示例，不对应某一位具体服务者，也不代表真实成交、评分或用户评价。平台会在收到需求后审核并匹配实际服务者。</p>
        <p><a class="link-arrow" href="./index.html#booking">提交需求并由客服匹配<span>→</span></a></p>
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
