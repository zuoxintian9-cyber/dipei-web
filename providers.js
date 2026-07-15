const providerProfiles = [
  {
    id: "beijing-citywalk",
    title: "北京城市漫游",
    city: "北京",
    area: "朝阳 / 东城",
    group: "城市体验",
    service: "城市漫游",
    price: 199,
    unit: "小时",
    img: "./assets/provider-beijing.jpg",
    tags: ["路线规划", "公开街区", "交通建议"],
    capability: "能力示例｜成年与资料审核后匹配",
    intro: "适合初次到访、商圈熟悉和半日公开路线同行。",
    scope: ["公开街区动线", "交通与时间建议", "本地生活贴士", "不组织包价旅游"]
  },
  {
    id: "chengdu-checkin",
    title: "成都旅游打卡",
    city: "成都",
    area: "春熙路 / 望平街",
    group: "城市体验",
    service: "旅游打卡",
    price: 239,
    unit: "次",
    img: "./assets/provider-chengdu.jpg",
    tags: ["打卡路线", "时间规划", "费用边界"],
    capability: "能力示例｜门票、餐费与交通费自理",
    intro: "根据兴趣和体力协助安排公开景点与街区顺序。",
    scope: ["公开景点与街区", "时间与交通路线", "消费项目提前披露", "持证导游需求另行核验"]
  },
  {
    id: "shanghai-food",
    title: "上海美食探店",
    city: "上海",
    area: "黄浦 / 静安",
    group: "城市体验",
    service: "美食探店",
    price: 228,
    unit: "次",
    img: "./assets/provider-shanghai.jpg",
    tags: ["口味筛选", "餐厅动线", "无暗佣"],
    capability: "能力示例｜餐饮消费与平台服务费分开",
    intro: "结合口味、预算和交通安排正规餐厅与公开市集路线。",
    scope: ["口味与预算沟通", "餐厅交通动线", "餐费用户自理", "不接受未披露返佣"]
  },
  {
    id: "hangzhou-photo",
    title: "杭州摄影跟拍",
    city: "杭州",
    area: "西湖 / 滨江",
    group: "城市体验",
    service: "摄影跟拍",
    price: 299,
    unit: "次",
    img: "./assets/provider-xian.jpg",
    tags: ["轻量跟拍", "原片交付", "授权确认"],
    capability: "能力示例｜公开场所｜不接受偷拍",
    intro: "在公开场景提供轻量跟拍、构图建议和交付说明。",
    scope: ["公开场景跟拍", "构图与点位建议", "交付数量提前确认", "禁止偷拍与未授权公开"]
  },
  {
    id: "xian-outdoor",
    title: "西安户外轻运动",
    city: "西安",
    area: "曲江 / 公开运动路线",
    group: "兴趣同行",
    service: "户外轻运动",
    price: 268,
    unit: "次",
    img: "./assets/provider-xian.jpg",
    tags: ["低风险", "节奏陪同", "装备清单"],
    capability: "能力示例｜天气、路线和装备前置确认",
    intro: "仅开放公园步行、慢跑、入门骑行等低风险活动。",
    scope: ["公开低风险路线", "节奏与装备提醒", "恶劣天气取消", "高风险项目不承接"]
  },
  {
    id: "shanghai-boardgame",
    title: "上海桌游同行",
    city: "上海",
    area: "经审核公开门店",
    group: "兴趣同行",
    service: "桌游同行",
    price: 168,
    unit: "次",
    img: "./assets/provider-shanghai.jpg",
    tags: ["新人友好", "规则讲解", "非现金"],
    capability: "能力示例｜公开门店｜禁止赌博",
    intro: "适合公开门店的桌游、剧本与非现金棋牌入门同行。",
    scope: ["公开门店", "规则与新人引导", "费用提前确认", "禁止现金赌博与私局抽成"]
  },
  {
    id: "beijing-business",
    title: "北京商务接待",
    city: "北京",
    area: "国贸 / 望京",
    group: "商务服务",
    service: "商务接待",
    price: 500,
    unit: "半天",
    img: "./assets/provider-beijing.jpg",
    tags: ["客户接待", "会面动线", "保密要求"],
    capability: "能力示例｜企业需求人工复审｜不涉招聘",
    intro: "面向客户到访、酒店会议和园区考察的路线与现场衔接。",
    scope: ["客户到访接待", "酒店会场衔接", "职责与保密前置确认", "不从事职业中介与劳务派遣"]
  },
  {
    id: "chengdu-arrival",
    title: "成都交通接站",
    city: "成都",
    area: "天府机场 / 成都东站",
    group: "商务服务",
    service: "交通接站",
    price: 259,
    unit: "次",
    img: "./assets/provider-chengdu.jpg",
    tags: ["抵达协助", "行李动线", "合规运力"],
    capability: "能力示例｜不自营载客运输｜车费分开",
    intro: "协助确认出站口、行李动线和合规交通方式。",
    scope: ["集合点确认", "行李与酒店动线", "车费与服务费分开", "用车由合规运力完成"]
  },
  {
    id: "shenzhen-expo",
    title: "深圳展会协助",
    city: "深圳",
    area: "福田 / 宝安会展",
    group: "商务服务",
    service: "展会协助",
    price: 499,
    unit: "半天",
    img: "./assets/provider-shenzhen.jpg",
    tags: ["展馆动线", "客户引导", "资料协助"],
    capability: "能力示例｜公开活动｜职责与保密前置确认",
    intro: "提供展会动线、资料整理和客户到场引导等基础协助。",
    scope: ["公开展会与活动", "展馆动线与客户引导", "职责清单提前确认", "专业翻译与安保需另行核验"]
  },
  {
    id: "guangzhou-errands",
    title: "广州办事陪同",
    city: "广州",
    area: "天河 / 越秀",
    group: "生活协助",
    service: "办事陪同",
    price: 239,
    unit: "次",
    img: "./assets/provider-guangzhou.jpg",
    tags: ["资料提醒", "路线指引", "不代办"],
    capability: "能力示例｜公开流程｜隐私最小化",
    intro: "提供公开流程、路线、资料清单和时间节点的现场协助。",
    scope: ["公开办事流程", "资料与路线提醒", "不冒用身份或保证结果", "不替代法律医疗金融专业判断"]
  }
];

const $p = (selector, root = document) => root.querySelector(selector);

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function providerCard(profile, compact = false) {
  return `
    <article class="provider-card market-provider-card${compact ? " compact" : ""}">
      <div class="provider-media">
        <img src="${esc(profile.img)}" alt="${esc(profile.title)}服务能力示意图" loading="lazy" />
        <div class="provider-media-badges">
          <span class="verify-badge">${esc(profile.group)}</span>
          <span class="availability-badge">档期人工确认</span>
        </div>
      </div>
      <div class="provider-body">
        <div class="provider-title-row">
          <div><h3>${esc(profile.title)}</h3><small>${esc(profile.area)}</small></div>
          <strong>¥${esc(profile.price)}<small>/ ${esc(profile.unit)}</small></strong>
        </div>
        <p class="provider-audit">${esc(profile.capability)}</p>
        ${compact ? "" : `<p>${esc(profile.intro)}</p>`}
        <div class="provider-tags">${profile.tags.map((tag) => `<span>${esc(tag)}</span>`).join("")}</div>
        <div class="provider-trust-row" aria-label="平台保障">
          <span>成年核验</span><span>资料审核</span><span>订单留痕</span>
        </div>
        <div class="provider-actions">
          <a class="btn ghost" href="./provider.html?id=${encodeURIComponent(profile.id)}">能力说明</a>
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
  const group = $p("#providerGroup")?.value || "";
  const service = $p("#providerService")?.value || "";
  const price = Number($p("#providerPrice")?.value || 0);
  const filtered = providerProfiles.filter((profile) => {
    return (!city || profile.city === city) && (!group || profile.group === group) && (!service || profile.service === service) && (!price || profile.price <= price);
  });
  grid.innerHTML = filtered.map((profile) => providerCard(profile)).join("");
  const summary = $p("#providerSummary");
  if (summary) summary.textContent = filtered.length
    ? `当前匹配 ${filtered.length} 个服务能力示例；页面不展示虚构姓名、订单量或评分，实际人员与档期由客服确认。`
    : "暂未匹配到能力示例，可放宽筛选条件或提交预约需求。";
}

function renderHomepageProviders() {
  const grid = $p("#homeProviderGrid");
  if (!grid) return;
  grid.innerHTML = providerProfiles.slice(0, 4).map((profile) => providerCard(profile, true)).join("");
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
        <p class="eyebrow">${esc(profile.group)} · ${esc(profile.service)}</p>
        <h1>${esc(profile.title)}</h1>
        <p>${esc(profile.capability)}</p>
        <p>${esc(profile.intro)}</p>
        <div class="detail-stats">
          <span><strong>¥${esc(profile.price)}</strong>参考 / ${esc(profile.unit)}</span>
          <span><strong>${esc(profile.area)}</strong>参考区域</span>
          <span><strong>人工确认</strong>实际人员与档期</span>
        </div>
        <div class="detail-actions">
          <a class="btn gold" href="./index.html#booking">提交预约需求</a>
          <a class="btn ghost" href="./contact.html">先咨询客服</a>
        </div>
      </div>
    </section>
    <section class="detail-grid-section">
      <article><h2>服务范围</h2><ul>${profile.scope.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>
      <article><h2>预约流程</h2><ol><li>提交城市、日期、人数和预算</li><li>客服确认服务边界与地方要求</li><li>匹配通过审核的实际服务者</li><li>书面确认价格、地点和注意事项</li><li>服务后可评价或投诉举报</li></ol></article>
      <article><h2>展示说明</h2><p>本页为服务能力与卡片布局示例，不对应某一位具体服务者，也不代表真实成交、评分或评价。只有完成资料审核并获得展示授权后，平台才会展示实际服务者。</p></article>
      <article><h2>禁止内容</h2><p>严禁违法违规、低俗色情、婚恋撮合、赌博、私下交易、侵犯隐私、冒用身份、无证载客和诱导绕开平台。</p></article>
    </section>
  `;
}

["#providerCity", "#providerGroup", "#providerService", "#providerPrice"].forEach((selector) => {
  $p(selector)?.addEventListener("change", renderProviderList);
});

$p("#resetProviderFilters")?.addEventListener("click", () => {
  ["#providerCity", "#providerGroup", "#providerService", "#providerPrice"].forEach((selector) => {
    const input = $p(selector);
    if (input) input.value = "";
  });
  renderProviderList();
});

renderProviderList();
renderHomepageProviders();
renderProviderDetail();
