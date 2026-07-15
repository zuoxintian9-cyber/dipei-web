const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const cities = ["北京", "上海", "广州", "深圳", "成都", "西安", "杭州", "重庆", "武汉", "苏州", "南京", "长沙"];
const services = ["城市漫游", "旅游打卡", "美食探店", "摄影跟拍", "户外轻运动", "桌游同行", "商务接待", "展会协助", "交通接站", "办事陪同"];

const pages = [
  {
    slug: "beijing.html",
    kind: "city",
    city: "北京",
    eyebrow: "北京本地陪同服务",
    title: "北京本地陪同服务｜商务接待与机场高铁接送｜地陪客户",
    description: "地陪客户提供北京商务接待、城市陪同、展会陪同、办事协助及机场高铁接送等正规本地陪同服务，提交需求后由客服人工确认。",
    h1: "北京本地陪同、商务接待与机场高铁接送",
    intro: "面向商务来访、展会会议、短期到京和交通枢纽衔接等正规场景。提交城市、日期和需求后，平台客服核对服务边界并匹配可服务人员。",
    coverage: "朝阳 CBD、国贸、望京、首都机场、北京南站等",
    price: "500 元起",
    scenes: [
      ["商务客户接待", "协助安排会面动线、酒店与会场衔接、餐厅路线及本地出行。"],
      ["展会与会议陪同", "适用于展馆引导、客户接待、资料协助和会后交通安排。"],
      ["机场高铁衔接", "根据航班或车次时间协助抵达、行李动线及目的地接驳。"]
    ],
    related: [["上海服务", "shanghai.html"], ["商务接待", "business.html"], ["机场高铁接送", "airport.html"]]
  },
  {
    slug: "shanghai.html",
    kind: "city",
    city: "上海",
    eyebrow: "上海本地陪同服务",
    title: "上海商务接待陪同｜城市向导与机场高铁接送｜地陪客户",
    description: "地陪客户提供上海商务接待、城市陪同、展会陪同、旅游向导和浦东虹桥交通衔接服务，需求由客服人工审核确认。",
    h1: "上海商务接待、城市陪同与交通枢纽衔接",
    intro: "适合商务会面、展会参访、城市熟悉和机场高铁衔接。平台先确认时间、区域、人数和服务边界，再安排匹配。",
    coverage: "陆家嘴、外滩、虹桥枢纽、浦东机场、国家会展中心等",
    price: "400 元起",
    scenes: [
      ["商务到访陪同", "协助梳理会面路线、时间节点、酒店会场和本地交通。"],
      ["展会参访支持", "提供展馆动线、客户引导、资料与会后行程协助。"],
      ["城市与枢纽衔接", "覆盖浦东机场、虹桥机场及高铁站的正规抵达协助。"]
    ],
    related: [["北京服务", "beijing.html"], ["深圳服务", "shenzhen.html"], ["商务接待", "business.html"]]
  },
  {
    slug: "guangzhou.html",
    kind: "city",
    city: "广州",
    eyebrow: "广州本地陪同服务",
    title: "广州办事协助与商务接待｜琶洲展会陪同｜地陪客户",
    description: "地陪客户提供广州办事协助、商务接待、城市陪同、琶洲展会陪同及白云机场广州南站衔接服务。",
    h1: "广州办事协助、商务接待与琶洲展会陪同",
    intro: "服务围绕正规办事、商务来访、展会参访和城市交通展开，不代替法律、医疗、金融等专业判断。",
    coverage: "天河、越秀、琶洲会展、白云机场、广州南站等",
    price: "350 元起",
    scenes: [
      ["正规办事协助", "提供资料清单提醒、路线指引、排队与现场流程协助。"],
      ["商务接待", "协助安排客户到访、会面路线、酒店会场和本地交通。"],
      ["琶洲展会陪同", "适用于展馆引导、参展动线、资料协助和客户接待。"]
    ],
    related: [["深圳服务", "shenzhen.html"], ["商务接待", "business.html"], ["机场高铁接送", "airport.html"]]
  },
  {
    slug: "shenzhen.html",
    kind: "city",
    city: "深圳",
    eyebrow: "深圳本地陪同服务",
    title: "深圳展会陪同与商务接待｜城市陪同服务｜地陪客户",
    description: "地陪客户提供深圳展会陪同、商务接待、城市陪同、办事协助及宝安机场深圳北站交通衔接服务。",
    h1: "深圳展会陪同、商务接待与城市协助",
    intro: "面向展会活动、商务来访、园区考察、短期到深和交通枢纽衔接等场景，由客服按日期和区域确认可服务能力。",
    coverage: "福田、南山、会展中心、宝安机场、深圳北站等",
    price: "600 元起",
    scenes: [
      ["展会现场陪同", "协助展馆动线、客户引导、资料准备和会后交通安排。"],
      ["商务与园区接待", "适合客户到访、园区考察、会议衔接和城市交通协助。"],
      ["机场高铁衔接", "根据航班或车次安排抵达、行李动线及目的地接驳。"]
    ],
    related: [["广州服务", "guangzhou.html"], ["商务接待", "business.html"], ["机场高铁接送", "airport.html"]]
  },
  {
    slug: "chengdu.html",
    kind: "city",
    city: "成都",
    eyebrow: "成都本地陪同服务",
    title: "成都本地陪同与旅游向导｜商务接待和机场接送｜地陪客户",
    description: "地陪客户提供成都城市陪同、旅游向导、商务接待、办事协助及双流天府机场衔接等正规服务，提交需求后由客服确认。",
    h1: "成都城市陪同、旅游向导与机场接送",
    intro: "面向短期到蓉、亲友接待、商务来访和机场交通衔接等正规场景。平台会根据日期、区域和服务边界确认实际承接能力。",
    coverage: "春熙路、天府广场、金融城、双流机场、天府机场等",
    price: "300 元起",
    scenes: [
      ["城市路线陪同", "协助规划商圈、文化街区、餐饮与城市交通路线。"],
      ["商务来访接待", "梳理酒店、会场、园区和交通枢纽之间的时间与动线。"],
      ["机场抵达衔接", "根据航班、行李和目的地确认集合点及接驳安排。"]
    ],
    related: [["旅游向导", "travel-guide.html"], ["机场高铁接送", "airport.html"], ["商务接待", "business.html"]]
  },
  {
    slug: "hangzhou.html",
    kind: "city",
    city: "杭州",
    eyebrow: "杭州本地陪同服务",
    title: "杭州城市陪同与商务接待｜旅游向导和高铁接送｜地陪客户",
    description: "地陪客户提供杭州城市陪同、商务接待、旅游向导、办事协助及萧山机场杭州东站衔接等正规服务。",
    h1: "杭州城市陪同、商务接待与旅游向导",
    intro: "适合商务来访、园区考察、城市文化路线和交通枢纽衔接。客服先核对时间、区域和服务边界，再确认人员与方案。",
    coverage: "西湖、钱江新城、滨江、萧山机场、杭州东站等",
    price: "350 元起",
    scenes: [
      ["商务与园区接待", "协助会面时间、园区路线、酒店会场和本地交通安排。"],
      ["城市文化路线", "围绕西湖、街区和公开文化场所安排正规陪同路线。"],
      ["机场高铁衔接", "确认航班或车次、出站动线、行李及目的地接驳。"]
    ],
    related: [["商务接待", "business.html"], ["旅游向导", "travel-guide.html"], ["机场高铁接送", "airport.html"]]
  },
  {
    slug: "xian.html",
    kind: "city",
    city: "西安",
    eyebrow: "西安本地陪同服务",
    title: "西安旅游向导与城市陪同｜文化路线和机场接送｜地陪客户",
    description: "地陪客户提供西安旅游向导、城市陪同、文化路线、商务接待及咸阳机场西安北站衔接等正规服务。",
    h1: "西安旅游向导、文化路线与城市陪同",
    intro: "适合历史文化路线、亲友接待、短期到访和交通枢纽衔接。实际讲解能力、日期和路线由客服审核确认。",
    coverage: "钟楼、大雁塔、曲江、西安北站、咸阳机场等",
    price: "450 元起",
    scenes: [
      ["历史文化路线", "按时间和兴趣规划公开景点、街区及交通顺序。"],
      ["亲友到访陪同", "协助餐饮、交通、休息和拍照时间安排。"],
      ["机场高铁衔接", "根据航班或车次协助确认集合点和目的地路线。"]
    ],
    related: [["旅游向导", "travel-guide.html"], ["机场高铁接送", "airport.html"], ["开放城市", "cities.html"]]
  },
  {
    slug: "chongqing.html",
    kind: "city",
    city: "重庆",
    eyebrow: "重庆内测服务",
    title: "重庆城市陪同与旅游向导内测预约｜地陪客户",
    description: "地陪客户接受重庆城市陪同、旅游向导、商务接待和交通衔接的内测预约，提交需求后由客服确认当地人员与档期。",
    h1: "重庆城市陪同与旅游向导内测预约",
    intro: "重庆目前处于内测阶段，可以先提交正规服务需求。客服会根据日期、区域和当地服务者储备确认是否可承接，未确认前不产生订单。",
    coverage: "解放碑、观音桥、重庆北站、江北机场等，按需求确认",
    price: "提交后确认",
    scenes: [
      ["城市路线陪同", "结合山城交通、步行强度和开放场所规划路线。"],
      ["旅游向导需求", "接受公开景点、文化街区和正规餐饮路线需求。"],
      ["交通枢纽衔接", "根据航班、车次和目的地确认是否具备承接能力。"]
    ],
    related: [["旅游向导", "travel-guide.html"], ["城市陪同", "city-companion.html"], ["开放城市", "cities.html"]]
  },
  {
    slug: "business.html",
    kind: "service",
    service: "商务接待",
    eyebrow: "商务接待服务",
    title: "商务接待陪同服务｜客户到访与展会会议协助｜地陪客户",
    description: "地陪客户提供客户到访、商务会面、城市考察、展会会议和机场高铁衔接等正规商务接待陪同服务。",
    h1: "商务接待陪同，让客户到访安排更从容",
    intro: "适用于客户来访、商务会面、酒店会议、园区考察和展会活动。客服先核对城市、时间、语言和行程，再确认服务方案。",
    coverage: "北京、上海、广州、深圳、成都、杭州等开放城市",
    price: "350 元起",
    scenes: [
      ["客户到访接待", "梳理机场、高铁站、酒店、会场和餐厅之间的时间与路线。"],
      ["会议与考察陪同", "协助会面节点、园区参访、资料携带和本地交通安排。"],
      ["展会商务支持", "提供展馆动线、客户引导、基础现场协助和会后衔接。"]
    ],
    related: [["北京商务接待", "beijing.html"], ["上海商务接待", "shanghai.html"], ["机场高铁接送", "airport.html"]]
  },
  {
    slug: "travel-guide.html",
    kind: "service",
    service: "旅游向导",
    eyebrow: "旅游向导服务",
    title: "城市旅游向导服务｜文化路线与行程规划｜地陪客户",
    description: "地陪客户提供正规城市旅游向导、文化路线、景点讲解、亲友接待和半天全天行程规划服务。",
    h1: "城市旅游向导与文化路线陪同",
    intro: "适合第一次到访、亲友接待、城市文化体验和半天或全天路线规划。服务内容以公开景点、正规餐饮与城市交通为主。",
    coverage: "西安、成都、杭州等开放城市；重庆内测",
    price: "300 元起",
    scenes: [
      ["文化路线规划", "按兴趣、时间和体力安排景点顺序与城市交通。"],
      ["景点与街区讲解", "提供公开历史文化、街区特色和参观动线介绍。"],
      ["亲友到访陪同", "协助规划餐饮、交通、休息和拍照时间，不安排违规内容。"]
    ],
    related: [["开放城市", "cities.html"], ["精选服务者", "providers.html"], ["提交预约", "index.html#booking"]]
  },
  {
    slug: "airport.html",
    kind: "service",
    service: "机场接送",
    eyebrow: "机场高铁接送服务",
    title: "机场高铁接送陪同｜行李与酒店衔接服务｜地陪客户",
    description: "地陪客户提供机场高铁接送陪同、航班车次衔接、行李动线、酒店会场接驳和临时抵达协助。",
    h1: "机场高铁接送陪同与抵达协助",
    intro: "适用于接机送机、高铁站接送、中转协助、行李动线和酒店会场衔接。客服会确认班次、人数、行李和目的地。",
    coverage: "主要机场、高铁站及开放城市核心区域",
    price: "300 元起",
    scenes: [
      ["接机与送机", "根据航班时间确认集合点、等待规则、行李情况和目的地。"],
      ["高铁站抵达协助", "协助确认出站口、行李动线、交通方式和酒店会场衔接。"],
      ["中转与临时安排", "根据停留时间规划正规休息、用餐或城市短程安排。"]
    ],
    related: [["北京接送", "beijing.html"], ["上海接送", "shanghai.html"], ["商务接待", "business.html"]]
  },
  {
    slug: "city-companion.html",
    kind: "service",
    service: "城市陪同",
    eyebrow: "城市陪同服务",
    title: "城市陪同服务｜商圈熟悉与本地路线协助｜地陪客户",
    description: "地陪客户提供正规城市陪同、商圈熟悉、本地路线、短期到访和亲友接待服务，需求由客服审核确认。",
    h1: "城市陪同与本地路线协助",
    intro: "适合第一次到访、商圈熟悉、亲友接待、酒店周边和城市交通路线安排。服务限于公开、正规场景。",
    coverage: "北京、上海、广州、深圳、成都、杭州、西安；重庆内测",
    price: "350 元起",
    scenes: [
      ["商圈与街区熟悉", "协助了解公开商圈、餐饮、交通和步行动线。"],
      ["短期到访安排", "根据时间、兴趣和体力规划半天或全天城市路线。"],
      ["亲友接待陪同", "协助交通、用餐、休息和公开场所行程安排。"]
    ],
    related: [["开放城市", "cities.html"], ["旅游向导", "travel-guide.html"], ["提交预约", "index.html#booking"]]
  },
  {
    slug: "errands.html",
    kind: "service",
    service: "办事协助",
    eyebrow: "办事协助服务",
    title: "办事协助陪同服务｜资料提醒与现场路线指引｜地陪客户",
    description: "地陪客户提供正规办事协助、资料清单提醒、排队流程、路线指引和非专业判断类现场陪同服务。",
    h1: "正规办事协助与现场流程陪同",
    intro: "适合需要资料提醒、路线指引、排队和现场流程协助的场景，不代办违法事项，不替代法律、医疗、金融等专业判断。",
    coverage: "开放城市内的公开办事场所，具体区域由客服确认",
    price: "350 元起",
    scenes: [
      ["资料清单提醒", "按用户提供的公开要求梳理资料和时间节点。"],
      ["路线与排队协助", "确认地点、交通、窗口和现场流程，不承诺办理结果。"],
      ["现场沟通支持", "协助理解公开流程，不冒用身份或代替专业决策。"]
    ],
    related: [["广州服务", "guangzhou.html"], ["城市陪同", "city-companion.html"], ["服务规则", "booking-rule.html"]]
  },
  {
    slug: "expo.html",
    kind: "service",
    service: "展会陪同",
    eyebrow: "展会陪同服务",
    title: "展会陪同与现场接待服务｜客户引导和资料协助｜地陪客户",
    description: "地陪客户提供正规展会陪同、客户引导、展馆动线、资料协助、会议衔接和会后交通安排服务。",
    h1: "展会陪同、客户引导与现场协助",
    intro: "面向参展企业、商务访客和临时现场支持需求。客服会先核对展馆、日期、人数、语言和具体职责。",
    coverage: "主要开放城市会展中心与公开商务活动场所",
    price: "500 元起",
    scenes: [
      ["展馆动线引导", "协助确认入口、展位、会议区和休息区的时间与路线。"],
      ["客户接待支持", "协助到场引导、资料准备和基础现场沟通。"],
      ["会后交通衔接", "根据结束时间安排酒店、车站或机场路线建议。"]
    ],
    related: [["深圳服务", "shenzhen.html"], ["商务接待", "business.html"], ["机场高铁接送", "airport.html"]]
  }
];

const wordingRules = [
  ["机场高铁接送", "交通接站"],
  ["机场接送", "交通接站"],
  ["城市陪同", "城市漫游"],
  ["旅游向导", "旅游打卡"],
  ["办事协助", "办事陪同"],
  ["展会陪同", "展会协助"],
  ["本地陪同", "城市本地服务"],
  ["陪同服务", "城市服务"]
];

function modernizeWording(value) {
  if (typeof value === "string") {
    return wordingRules.reduce((text, [from, to]) => text.replaceAll(from, to), value);
  }
  if (Array.isArray(value)) return value.map(modernizeWording);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, modernizeWording(item)]));
  }
  return value;
}

for (let index = 0; index < pages.length; index += 1) pages[index] = modernizeWording(pages[index]);

function options(values, selected = "") {
  return values.map((value) => `<option${value === selected ? " selected" : ""}>${value}</option>`).join("\n                  ");
}

function bookingFields(page) {
  const cityField = page.kind === "city"
    ? `<input type="hidden" name="city" value="${page.city}" />
            <label>服务城市<input value="${page.city}" readonly aria-readonly="true" /></label>`
    : `<label>服务城市
              <select name="city" required>
                <option value="">请选择城市</option>
                ${options(cities)}
              </select>
            </label>`;
  const serviceField = page.kind === "service"
    ? `<input type="hidden" name="service" value="${page.service}" />
            <label>服务类型<input value="${page.service}" readonly aria-readonly="true" /></label>`
    : `<label>服务类型
              <select name="service" required>
                <option value="">请选择服务类型</option>
                ${options(services)}
              </select>
            </label>`;

  return `${cityField}
            ${serviceField}`;
}

function pageHtml(page) {
  const sceneCards = page.scenes.map(([title, text], index) => `
          <article class="service-card">
            <span>0${index + 1}</span>
            <h2>${title}</h2>
            <p>${text}</p>
          </article>`).join("");
  const relatedLinks = page.related.map(([label, href]) => `<a href="./${href}">${label}</a>`).join("\n              ");

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${page.title}</title>
    <meta name="description" content="${page.description}" />
    <link rel="canonical" href="https://www.dipeikehu.com/${page.slug}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:site_name" content="地陪客户" />
    <meta property="og:title" content="${page.title}" />
    <meta property="og:description" content="${page.description}" />
    <meta property="og:url" content="https://www.dipeikehu.com/${page.slug}" />
    <meta property="og:image" content="https://www.dipeikehu.com/assets/hero-city.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${page.title}" />
    <meta name="twitter:description" content="${page.description}" />
    <meta name="twitter:image" content="https://www.dipeikehu.com/assets/hero-city.jpg" />
    <meta name="theme-color" content="#fff8f6" />
    <link rel="icon" href="./favicon.svg" type="image/svg+xml" />
    <link rel="manifest" href="./site.webmanifest" />
    <link rel="stylesheet" href="./styles.css?v=20260716-market" />
  </head>
  <body>
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="./index.html" aria-label="地陪客户首页">
          <img class="brand-mark" src="./favicon.svg" alt="" />
          <span><strong>地陪客户</strong><small>城市兴趣服务平台</small></span>
        </a>
        <nav class="main-nav" id="mainNav" aria-label="主导航">
          <a href="./index.html">首页</a>
          <a href="./providers.html">精选达人</a>
          <a${page.kind === "service" ? ' class="active"' : ""} href="./services.html">服务分类</a>
          <a${page.kind === "city" ? ' class="active"' : ""} href="./cities.html">开放城市</a>
          <a href="./booking-rule.html">预约规则</a>
          <a href="./index.html#join">达人入驻</a>
        </nav>
        <div class="header-actions">
          <a class="btn ghost small" href="./contact.html">联系客服</a>
          <a class="btn gold small" href="#booking">提交预约</a>
        </div>
        <button class="menu-toggle" id="menuToggle" aria-label="展开导航" aria-expanded="false">菜单</button>
      </div>
    </header>

    <main>
      <div class="container breadcrumbs" aria-label="面包屑导航">
        <a href="./index.html">首页</a><span>/</span><a href="./${page.kind === "city" ? "cities" : "services"}.html">${page.kind === "city" ? "开放城市" : "服务分类"}</a><span>/</span><span>${page.eyebrow}</span>
      </div>
      <section class="page-hero seo-hero">
        <div class="container">
          <p class="eyebrow">${page.eyebrow}</p>
          <h1>${page.h1}</h1>
          <p>${page.intro}</p>
          <div class="hero-actions">
            <a class="btn gold" href="#booking">立即提交预约</a>
            <a class="btn ghost" href="#process">查看服务流程</a>
          </div>
        </div>
      </section>

      <section class="section landing-summary">
        <div class="container landing-facts">
          <article><span>服务范围</span><strong>${page.coverage}</strong></article>
          <article><span>参考价格</span><strong>${page.price}</strong><small>根据时长、日期和实际需求确认</small></article>
          <article><span>确认方式</span><strong>客服人工核对</strong><small>先确认边界，再匹配服务者</small></article>
          <article><span>提交结果</span><strong>生成预约编号</strong><small>用于后续进度查询</small></article>
        </div>
      </section>

      <section class="section-band" id="process">
        <div class="container split-feature">
          <div>
            <p class="eyebrow">可预约场景</p>
            <h2>围绕真实行程提供正规陪同</h2>
            <p>参考价格只用于前期判断，不代表最终报价。客服会结合服务日期、时长、区域、人数、语言和交通需求给出确认方案，未确认前不产生订单。</p>
          </div>
          <div class="process-card">
            <h3>五步完成预约</h3>
            <ol>
              <li>提交城市、服务类型、日期和联系方式</li>
              <li>生成预约编号并进入运营后台</li>
              <li>客服核对时间、区域和服务边界</li>
              <li>确认服务者、价格、地点和注意事项</li>
              <li>完成服务并支持反馈或投诉</li>
            </ol>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container service-grid">${sceneCards}
        </div>
      </section>

      <section class="section booking-section" id="booking">
        <div class="container booking-shell landing-booking-shell">
          <div class="section-heading">
            <p class="eyebrow">快速预约</p>
            <h2>提交核心需求，客服继续确认细节</h2>
            <p>预算、人数、语言、接送和服务时长可在客服回访时补充。提交成功后页面会显示预约编号。</p>
          </div>
          <form class="booking-form landing-booking-form" data-lead-form data-lead-type="用户预约需求表" data-source="/${page.slug}#booking" novalidate>
            <input class="hp-field" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />
            <label>客户姓名/称呼
              <input name="customerName" maxlength="30" placeholder="如：张先生 / 李女士" required />
            </label>
            <label>手机号
              <input name="phone" inputmode="tel" maxlength="20" placeholder="请输入 11 位手机号" required />
            </label>
            ${bookingFields(page)}
            <label>预约日期
              <input type="date" name="date" required />
            </label>
            <label class="full">具体需求描述
              <textarea name="detail" rows="5" minlength="12" maxlength="500" placeholder="请说明接待对象、区域、路线、时间及注意事项，至少 12 个字。" required></textarea>
            </label>
            <label class="consent-line">
              <input type="checkbox" name="consent" value="已同意" required />
              <span>我已阅读并同意 <a href="./privacy.html">隐私政策</a> 和 <a href="./terms.html">服务协议</a></span>
            </label>
            <button class="btn gold" type="submit">提交预约需求</button>
            <p class="form-note full">严禁提交违法违规、低俗色情、私下交易、侵害隐私或诱导绕开平台的内容。</p>
          </form>
        </div>
      </section>

      <section class="section-band">
        <div class="container landing-bottom-grid">
          <article class="page-card">
            <p class="eyebrow">服务边界</p>
            <h2>平台不承接的内容</h2>
            <p>禁止违法违规、低俗色情、赌博、偷拍、查询他人隐私、代办违法证件、私下交易及诱导绕开平台。风险内容会被系统拦截并进入人工复核。</p>
          </article>
          <article class="page-card">
            <p class="eyebrow">继续了解</p>
            <h2>相关城市与服务</h2>
            <div class="quick-links">
              ${relatedLinks}
              <a href="./booking-rule.html">预约规则</a>
            </div>
          </article>
        </div>
      </section>
    </main>

    <div class="mobile-quickbar" aria-label="移动端快捷操作">
      <a class="btn ghost" href="./contact.html">联系客服</a>
      <a class="btn gold" href="#booking">提交预约</a>
    </div>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div>
          <a class="brand footer-brand" href="./index.html"><span><strong>地陪客户</strong><small>城市兴趣服务平台</small></span></a>
          <p>城市兴趣服务先审核需求，再确认匹配。</p>
        </div>
        <div class="footer-links">
          <a href="./services.html">服务分类</a>
          <a href="./cities.html">开放城市</a>
          <a href="./providers.html">精选达人</a>
          <a href="./order.html">订单进度</a>
          <a href="./contact.html">联系客服</a>
          <a href="./report.html">投诉举报</a>
          <a href="./privacy.html">隐私政策</a>
        </div>
      </div>
    </footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
    <script src="./seo-schema.js"></script>
    <script src="./app.js"></script>
  </body>
</html>
`;
}

for (const page of pages) {
  fs.writeFileSync(path.join(root, page.slug), pageHtml(page), "utf8");
}

console.log(`Generated ${pages.length} SEO pages.`);
