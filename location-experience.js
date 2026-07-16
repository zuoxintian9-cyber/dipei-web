import * as THREE from "./assets/vendor/three.module.min.js";

const cities = [
  {
    name: "北京",
    code: "BJS",
    icon: "i-landmark-beijing",
    color: 0xd7aa5d,
    map: { center: [116.4074, 39.9042], boundary: "./assets/maps/beijing-districts.geojson", origin: [116.6031, 40.0799], originName: "首都机场" },
    summary: "从首都机场、高铁站到 CBD 商务会面，由客服根据区域、时间和服务边界人工确认。",
    landmark: "故宫与中轴线城市路线",
    hotspots: ["故宫", "天安门", "国贸 CBD"],
    districts: [
      { name: "朝阳区", center: [39.9185, 116.4551], landmark: "中国尊", type: "skyscraper", hotspots: ["中国尊", "国贸 CBD", "三里屯"] },
      { name: "海淀区", center: [39.9999, 116.2755], landmark: "佛香阁", type: "pagoda", hotspots: ["佛香阁", "中关村", "颐和园"] },
      { name: "东城区", center: [39.9151, 116.3972], landmark: "天安门城楼", type: "gate", hotspots: ["天安门", "故宫", "天坛"] },
      { name: "西城区", center: [39.9242, 116.3737], landmark: "白塔", type: "stupa", hotspots: ["白塔", "什刹海", "金融街"] },
      { name: "丰台区", center: [39.8651, 116.3046], landmark: "北京西站", type: "station", hotspots: ["北京西站", "丽泽商务区", "北京南站"] }
    ]
  },
  {
    name: "上海",
    code: "SHA",
    icon: "i-landmark-shanghai",
    color: 0x70c0b0,
    map: { center: [121.4737, 31.2304], boundary: "./assets/maps/shanghai-districts.geojson", origin: [121.8052, 31.1443], originName: "浦东机场" },
    summary: "覆盖浦东商务区、核心商圈、酒店会面与交通衔接，按行程节奏匹配本地服务。",
    landmark: "外滩与陆家嘴城市路线",
    hotspots: ["外滩", "陆家嘴", "上海中心"],
    districts: [
      { name: "浦东新区", center: [31.2397, 121.4998], landmark: "东方明珠", type: "pearl", hotspots: ["东方明珠", "陆家嘴", "上海中心"] },
      { name: "黄浦区", center: [31.2352, 121.4903], landmark: "外滩钟楼", type: "clocktower", hotspots: ["外滩", "南京东路", "人民广场"] },
      { name: "静安区", center: [31.2294, 121.4453], landmark: "静安寺", type: "temple", hotspots: ["静安寺", "南京西路", "苏河湾"] },
      { name: "徐汇区", center: [31.1923, 121.4352], landmark: "徐家汇天主堂", type: "cathedral", hotspots: ["徐家汇", "衡山路", "西岸"] },
      { name: "闵行区", center: [31.1130, 121.3817], landmark: "虹桥枢纽", type: "station", hotspots: ["虹桥枢纽", "七宝", "虹桥商务区"] }
    ]
  },
  {
    name: "广州",
    code: "CAN",
    icon: "i-landmark-guangzhou",
    color: 0xe0b46b,
    map: { center: [113.2644, 23.1291], boundary: "./assets/maps/guangzhou-districts.geojson", origin: [113.2988, 23.3924], originName: "白云机场" },
    summary: "面向商务到访、展会协助和正规办事陪同，可备注普通话、粤语及路线需求。",
    landmark: "广州塔与珠江新城路线",
    hotspots: ["广州塔", "珠江新城", "北京路"],
    districts: [
      { name: "天河区", center: [23.1203, 113.3248], landmark: "周大福金融中心", type: "skyscraper", hotspots: ["珠江新城", "天河路", "广州东站"] },
      { name: "越秀区", center: [23.1376, 113.2645], landmark: "镇海楼", type: "pavilion", hotspots: ["镇海楼", "北京路", "中山纪念堂"] },
      { name: "海珠区", center: [23.1065, 113.3245], landmark: "广州塔", type: "canton", hotspots: ["广州塔", "琶洲会展", "海珠湿地"] },
      { name: "荔湾区", center: [23.1259, 113.2443], landmark: "陈家祠", type: "pavilion", hotspots: ["陈家祠", "沙面", "永庆坊"] },
      { name: "黄埔区", center: [23.1064, 113.4598], landmark: "科学城地标", type: "skyscraper", hotspots: ["科学城", "黄埔港", "知识城"] }
    ]
  },
  {
    name: "深圳",
    code: "SZX",
    icon: "i-landmark-shenzhen",
    color: 0x68b7a1,
    map: { center: [114.0579, 22.5431], boundary: "./assets/maps/shenzhen-districts.geojson", origin: [113.8107, 22.6393], originName: "宝安机场" },
    summary: "适合会展接待、企业到访、口岸与机场衔接，客服提前核对集合地点和时间。",
    landmark: "平安金融中心与湾区路线",
    hotspots: ["平安金融中心", "深圳湾", "会展中心"],
    districts: [
      { name: "福田区", center: [22.5366, 114.0547], landmark: "平安金融中心", type: "skyscraper", hotspots: ["平安中心", "市民中心", "会展中心"] },
      { name: "南山区", center: [22.5172, 113.9410], landmark: "春茧体育馆", type: "stadium", hotspots: ["深圳湾", "人才公园", "科技园"] },
      { name: "罗湖区", center: [22.5454, 114.1178], landmark: "地王大厦", type: "steppedtower", hotspots: ["地王大厦", "罗湖口岸", "东门"] },
      { name: "宝安区", center: [22.5541, 113.8831], landmark: "湾区之光", type: "ferris", hotspots: ["湾区之光", "宝安中心", "深圳机场"] },
      { name: "龙岗区", center: [22.6970, 114.2184], landmark: "大运中心", type: "stadium", hotspots: ["大运中心", "龙岗中心城", "甘坑古镇"] }
    ]
  },
  {
    name: "成都",
    code: "CTU",
    icon: "i-landmark-chengdu",
    color: 0xc79a5d,
    map: { center: [104.0665, 30.5728], boundary: "./assets/maps/chengdu-districts.geojson", origin: [103.9471, 30.5785], originName: "双流机场" },
    summary: "覆盖核心商圈、会展商务、文化街区和机场高铁衔接，适合商务到访与城市路线陪同。",
    landmark: "太古里与宽窄巷子路线",
    hotspots: ["成都 IFS", "太古里", "宽窄巷子"],
    districts: [
      { name: "锦江区", center: [30.6543, 104.0818], landmark: "成都 IFS", type: "skyscraper", hotspots: ["成都 IFS", "太古里", "春熙路"] },
      { name: "武侯区", center: [30.6455, 104.0492], landmark: "锦里牌坊", type: "arch", hotspots: ["锦里", "武侯祠", "金融城"] },
      { name: "青羊区", center: [30.6720, 104.0476], landmark: "四川博物院", type: "museum", hotspots: ["四川博物院", "宽窄巷子", "杜甫草堂"] },
      { name: "成华区", center: [30.6846, 104.1133], landmark: "天府熊猫塔", type: "broadcast", hotspots: ["熊猫塔", "东郊记忆", "建设路"] },
      { name: "天府新区", mapName: "双流区", center: [30.5084, 104.0715], landmark: "中国西部博览城", type: "megacenter", hotspots: ["西博城", "天府公园", "兴隆湖"] }
    ]
  },
  {
    name: "杭州",
    code: "HGH",
    icon: "i-landmark-hangzhou",
    color: 0x69b49d,
    map: { center: [120.1551, 30.2741], boundary: "./assets/maps/hangzhou-districts.geojson", origin: [120.4344, 30.2295], originName: "萧山机场" },
    summary: "覆盖西湖文化路线、钱江新城商务区、滨江科技企业与高铁机场衔接场景。",
    landmark: "西湖与钱江新城路线",
    hotspots: ["西湖", "雷峰塔", "钱江新城"],
    districts: [
      { name: "西湖区", center: [30.2315, 120.1452], landmark: "雷峰塔", type: "pagoda", hotspots: ["雷峰塔", "西湖", "灵隐寺"] },
      { name: "上城区", center: [30.2462, 120.2108], landmark: "杭州大剧院", type: "theatre", hotspots: ["钱江新城", "杭州大剧院", "湖滨"] },
      { name: "拱墅区", center: [30.3208, 120.1420], landmark: "拱宸桥", type: "bridge", hotspots: ["拱宸桥", "大运河", "武林广场"] },
      { name: "滨江区", center: [30.2084, 120.2110], landmark: "杭州之门", type: "twintower", hotspots: ["杭州之门", "滨江科技城", "奥体中心"] },
      { name: "余杭区", center: [30.3790, 120.0307], landmark: "良渚博物院", type: "museum", hotspots: ["良渚博物院", "未来科技城", "梦想小镇"] }
    ]
  },
  {
    name: "西安",
    code: "XIY",
    icon: "i-landmark-xian",
    color: 0xd2a663,
    map: { center: [108.9398, 34.3416], boundary: "./assets/maps/xian-districts.geojson", origin: [108.7516, 34.4471], originName: "咸阳机场" },
    summary: "覆盖历史文化路线、高新区商务到访、会展接待以及机场和高铁站交通衔接。",
    landmark: "城墙与钟鼓楼城市路线",
    hotspots: ["西安城墙", "钟楼", "大雁塔"],
    districts: [
      { name: "碑林区", center: [34.2610, 108.9470], landmark: "西安钟楼", type: "clocktower", hotspots: ["西安钟楼", "城墙", "碑林博物馆"] },
      { name: "雁塔区", center: [34.2193, 108.9642], landmark: "大雁塔", type: "pagoda", hotspots: ["大雁塔", "大唐不夜城", "高新区"] },
      { name: "莲湖区", center: [34.2692, 108.9392], landmark: "西安鼓楼", type: "pavilion", hotspots: ["西安鼓楼", "回民街", "广仁寺"] },
      { name: "未央区", center: [34.3295, 108.9471], landmark: "丹凤门", type: "gate", hotspots: ["丹凤门", "大明宫", "行政中心"] },
      { name: "灞桥区", center: [34.2023, 109.0402], landmark: "西安国际会展中心", type: "megacenter", hotspots: ["国际会展中心", "浐灞生态区", "奥体中心"] }
    ]
  },
  {
    name: "重庆",
    code: "CKG",
    icon: "i-landmark-chongqing",
    color: 0xc97862,
    asset: "./City/重庆.webp",
    map: { center: [106.5516, 29.563], boundary: "./assets/maps/chongqing-districts.geojson", origin: [106.6417, 29.7192], originName: "江北机场" },
    summary: "适合山地城市路线、商务会面、会展接待、景点向导和机场高铁站衔接服务。",
    landmark: "解放碑与两江城市路线",
    hotspots: ["解放碑", "洪崖洞", "重庆来福士"],
    districts: [
      { name: "渝中区", center: [29.5647, 106.5790], landmark: "重庆来福士", type: "sail", hotspots: ["重庆来福士", "解放碑", "洪崖洞"] },
      { name: "江北区", center: [29.5788, 106.5777], landmark: "重庆大剧院", type: "theatre", hotspots: ["重庆大剧院", "江北嘴", "观音桥"] },
      { name: "南岸区", center: [29.5375, 106.5770], landmark: "南滨双子塔", type: "twintower", hotspots: ["南滨双子塔", "南滨路", "弹子石"] },
      { name: "沙坪坝区", center: [29.5814, 106.4568], landmark: "磁器口牌坊", type: "arch", hotspots: ["磁器口", "三峡广场", "大学城"] },
      { name: "九龙坡区", center: [29.5058, 106.4350], landmark: "重庆西站", type: "station", hotspots: ["重庆西站", "杨家坪", "黄桷坪"] }
    ]
  },
  {
    name: "武汉",
    code: "WUH",
    icon: "i-landmark-wuhan",
    color: 0xd9a55e,
    asset: "./City/武汉.webp",
    map: { center: [114.3055, 30.5928], boundary: "./assets/maps/wuhan-city.geojson", origin: [114.2081, 30.7766], originName: "天河机场", cityOnly: true },
    summary: "武汉现开放城市级预约，具体服务区县、集合地点和路线由客服根据需求人工确认。",
    landmark: "黄鹤楼与长江城市路线",
    hotspots: ["黄鹤楼", "武汉天地", "汉口站"],
    districts: []
  },
  {
    name: "苏州",
    code: "SZV",
    icon: "i-landmark-suzhou",
    color: 0x78b9a8,
    asset: "./City/苏州.webp",
    map: { center: [120.5853, 31.2989], boundary: "./assets/maps/suzhou-city.geojson", origin: [120.642, 31.421], originName: "苏州北站", cityOnly: true },
    summary: "苏州现开放城市级预约，具体服务区县、集合地点和路线由客服根据需求人工确认。",
    landmark: "东方之门与古城路线",
    hotspots: ["东方之门", "金鸡湖", "苏州站"],
    districts: []
  },
  {
    name: "南京",
    code: "NKG",
    icon: "i-landmark-nanjing",
    color: 0xd5aa65,
    asset: "./City/南京.webp",
    map: { center: [118.7969, 32.0603], boundary: "./assets/maps/nanjing-city.geojson", origin: [118.862, 31.742], originName: "禄口机场", cityOnly: true },
    summary: "南京现开放城市级预约，具体服务区县、集合地点和路线由客服根据需求人工确认。",
    landmark: "紫峰大厦与金陵城市路线",
    hotspots: ["紫峰大厦", "新街口", "南京南站"],
    districts: []
  },
  {
    name: "长沙",
    code: "CSX",
    icon: "i-landmark-changsha",
    color: 0xd58f62,
    asset: "./City/长沙.webp",
    map: { center: [112.9388, 28.2282], boundary: "./assets/maps/changsha-city.geojson", origin: [113.22, 28.19], originName: "黄花机场", cityOnly: true },
    summary: "长沙现开放城市级预约，具体服务区县、集合地点和路线由客服根据需求人工确认。",
    landmark: "橘子洲与湘江城市路线",
    hotspots: ["橘子洲", "五一广场", "长沙南站"],
    districts: []
  }
];

const stage = document.querySelector("#city-map.world-hero");
const canvas = document.querySelector("#cityWorldCanvas");
const fallback = document.querySelector("#worldFallback");
const intro = document.querySelector("#worldIntro");
const skipIntro = document.querySelector("#worldSkip");
const introStatus = document.querySelector("#worldIntroStatus");
const cityName = document.querySelector("#worldLocationCityName");
const cityCode = document.querySelector("#worldCityCode");
const citySequence = document.querySelector("#worldCitySequence");
const cityTotal = document.querySelector("#worldCityTotal");
const summary = document.querySelector("#worldLocationSummary");
const currentCityLabel = document.querySelector("#worldCurrentCity");
const previousCityLabel = document.querySelector("#worldPreviousCity");
const nextCityLabel = document.querySelector("#worldNextCity");
const districtList = document.querySelector("#worldDistrictList");
const districtAxis = document.querySelector(".world-district-axis");
const coreType = document.querySelector("#worldCoreType");
const coreLabel = document.querySelector("#worldCoreLabel");
const coreIcon = document.querySelector("#worldCoreIcon");
const mapLock = document.querySelector("#worldMapLock");
const landmarkList = document.querySelector("#worldLandmarkList");
const confirmLocation = document.querySelector("#worldConfirmLocation");
const live = document.querySelector("#locationLive");
const cityImageStage = document.querySelector("#cityImageStage");
const cityImageFront = document.querySelector("#cityImageFront");
const cityImageBack = document.querySelector("#cityImageBack");
const cityRealMapStage = document.querySelector("#cityRealMapStage");
const cityRealMap = document.querySelector("#cityRealMap");
const cityMapStatus = document.querySelector(".city-map-status span");

let activeCity = 0;
let activeDistrict = 0;
let pointerStart = null;
let wheelDistance = 0;
let wheelResetTimer = 0;
let introFinished = false;
let sceneApi = null;

function indexWrap(value, length) {
  return (value + length) % length;
}

function selectedLocation() {
  const city = cities[activeCity];
  return { city, district: city.districts[activeDistrict] || null };
}

function renderInterface() {
  const { city, district } = selectedLocation();
  const previous = cities[indexWrap(activeCity - 1, cities.length)];
  const next = cities[indexWrap(activeCity + 1, cities.length)];

  cityName.textContent = city.name;
  cityCode.textContent = city.code;
  citySequence.textContent = String(activeCity + 1).padStart(2, "0");
  cityTotal.textContent = String(cities.length).padStart(2, "0");
  summary.textContent = city.summary;
  currentCityLabel.textContent = city.name;
  previousCityLabel.textContent = previous.name;
  nextCityLabel.textContent = next.name;
  const cityOnly = !district;
  coreType.textContent = "城市地标";
  coreLabel.textContent = city.landmark || `${city.name}城市路线`;
  coreIcon.setAttribute("href", `#${city.icon}`);
  mapLock.textContent = cityOnly ? `${city.name}已锁定 · 区县由客服确认` : `${city.name} · ${district.name}已锁定`;
  confirmLocation.textContent = cityOnly ? `按${city.name}提交预约` : `按${district.name}提交预约`;
  districtAxis.classList.toggle("is-city-only", cityOnly);
  districtAxis.setAttribute("aria-hidden", String(cityOnly));

  const hotspots = cityOnly ? city.hotspots : district.hotspots;
  landmarkList.replaceChildren(...hotspots.map((hotspot, index) => {
    const item = document.createElement("span");
    item.className = index === 0 ? "active" : "";
    item.textContent = hotspot;
    return item;
  }));

  districtList.replaceChildren(...city.districts.map((districtItem, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.worldDistrictIndex = String(index);
    button.className = index === activeDistrict ? "active" : "";
    button.setAttribute("aria-label", `选择${districtItem.name}`);
    button.setAttribute("aria-pressed", String(index === activeDistrict));
    button.innerHTML = `<i></i><span>${districtItem.name}</span>`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      activeDistrict = index;
      renderInterface();
    });
    return button;
  }));

  const accent = stage.classList.contains("map-ready") ? 0xd7aa5d : city.color;
  stage.style.setProperty("--world-accent", `#${accent.toString(16).padStart(6, "0")}`);
  sceneApi?.setLocation(activeCity, activeDistrict);
}

function changeCity(step) {
  activeCity = indexWrap(activeCity + step, cities.length);
  activeDistrict = 0;
  renderInterface();
  const city = cities[activeCity];
  live.textContent = city.districts.length
    ? `已切换到${city.name}，上下滑动可进入区县层级。`
    : `已切换到${city.name}，当前仅开放城市级预约，区县由客服确认。`;
}

function changeDistrict(step) {
  const districts = cities[activeCity].districts;
  if (!districts.length) return false;
  const next = activeDistrict + step;
  if (next < 0 || next >= districts.length) return false;
  activeDistrict = next;
  renderInterface();
  live.textContent = `已进入${districts[activeDistrict].name}，地标已切换为${districts[activeDistrict].landmark}。`;
  return true;
}

function continueToContent() {
  document.querySelector("#categories")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindControls() {
  const booking = document.querySelector("#bookingForm");
  booking?.elements.city?.addEventListener("change", () => {
    if (booking.elements.area) booking.elements.area.value = "";
  });

  document.querySelectorAll("[data-world-city-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      changeCity(Number(button.dataset.worldCityStep));
    });
  });
  document.querySelectorAll("[data-world-district-step]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      changeDistrict(Number(button.dataset.worldDistrictStep));
    });
  });

  stage.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") changeCity(-1);
    if (event.key === "ArrowRight") changeCity(1);
    if (event.key === "ArrowUp") changeDistrict(-1);
    if (event.key === "ArrowDown" && !changeDistrict(1)) continueToContent();
  });

  stage.addEventListener("wheel", (event) => {
    if (!introFinished) return;
    if (stage.classList.contains("map-ready")) return;
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY) * 0.72;
    const distance = horizontal ? event.deltaX : event.deltaY;
    const districtCount = cities[activeCity].districts.length;
    if (!horizontal && districtCount === 0) return;
    const atExit = !horizontal && distance > 0 && activeDistrict === districtCount - 1;
    if (atExit) return;

    event.preventDefault();
    wheelDistance += distance;
    window.clearTimeout(wheelResetTimer);
    wheelResetTimer = window.setTimeout(() => { wheelDistance = 0; }, 170);
    if (Math.abs(wheelDistance) < 46) return;
    const step = wheelDistance > 0 ? 1 : -1;
    wheelDistance = 0;
    if (horizontal) changeCity(step);
    else changeDistrict(step);
  }, { passive: false });

  stage.addEventListener("pointerdown", (event) => {
    if (!introFinished || (event.pointerType === "mouse" && event.button !== 0)) return;
    if (stage.classList.contains("map-ready")) return;
    if (event.target.closest("button, a, input, select, textarea")) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener("pointerup", (event) => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 50) return;
    if (Math.abs(deltaX) > Math.abs(deltaY)) changeCity(deltaX < 0 ? 1 : -1);
    else if (!changeDistrict(deltaY < 0 ? 1 : -1) && deltaY < 0) continueToContent();
  });

  confirmLocation.addEventListener("click", () => {
    const { city, district } = selectedLocation();
    if (booking?.elements.city) booking.elements.city.value = city.name;
    if (booking?.elements.area) booking.elements.area.value = district?.name || "";
    const filterCity = document.querySelector("#filterCity");
    if (filterCity && [...filterCity.options].some((option) => option.value === city.name)) {
      filterCity.value = city.name;
      filterCity.dispatchEvent(new Event("change", { bubbles: true }));
    }
    document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof showToast === "function") {
      const location = district ? `${city.name} · ${district.name}` : `${city.name}（区县由客服确认）`;
      showToast(`已选择${location}，请补充预约信息。`, 4200);
    }
  });
}

function finishIntro() {
  if (introFinished) return;
  introFinished = true;
  intro.classList.add("is-finished");
  stage.classList.add("is-ready");
  sceneApi?.finishIntro();
  try {
    sessionStorage.setItem("dipei:world-intro", "seen");
  } catch {
    // Storage can be unavailable in private or embedded browser modes.
  }
  window.setTimeout(() => { intro.hidden = true; }, 800);
}

function setupIntro() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const deepLink = window.location.hash && window.location.hash !== "#home";
  let alreadySeen = false;
  try {
    alreadySeen = sessionStorage.getItem("dipei:world-intro") === "seen";
  } catch {
    alreadySeen = false;
  }

  if (reduceMotion || deepLink || alreadySeen) {
    intro.hidden = true;
    introFinished = true;
    stage.classList.add("is-ready");
    sceneApi?.finishIntro(true);
    return;
  }

  stage.classList.remove("is-ready");
  intro.hidden = false;
  intro.classList.add("is-active");
  window.setTimeout(() => { introStatus.textContent = "正在连接本地接应路线"; }, 850);
  window.setTimeout(() => { introStatus.textContent = "城市服务网络已就绪"; }, 1800);
  window.setTimeout(finishIntro, 3400);
  skipIntro.addEventListener("click", finishIntro, { once: true });
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = value * 16807 % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const MAP_SCALE = 2.35;

let landmarkFacadeTexture;

function getLandmarkFacadeTexture() {
  if (landmarkFacadeTexture) return landmarkFacadeTexture;
  const facade = document.createElement("canvas");
  facade.width = 192;
  facade.height = 384;
  const context = facade.getContext("2d");
  context.fillStyle = "#102d58";
  context.fillRect(0, 0, facade.width, facade.height);
  const random = seededRandom(25091);
  for (let row = 0; row < 24; row += 1) {
    for (let column = 0; column < 9; column += 1) {
      const lit = random() > 0.48;
      context.fillStyle = lit ? `rgba(255, ${198 + Math.floor(random() * 40)}, 132, ${0.62 + random() * 0.32})` : "rgba(67, 133, 221, 0.56)";
      context.fillRect(8 + column * 20, 8 + row * 16, 12, 7);
    }
  }
  landmarkFacadeTexture = new THREE.CanvasTexture(facade);
  landmarkFacadeTexture.colorSpace = THREE.SRGBColorSpace;
  landmarkFacadeTexture.wrapS = THREE.RepeatWrapping;
  landmarkFacadeTexture.wrapT = THREE.RepeatWrapping;
  landmarkFacadeTexture.repeat.set(1.4, 1.1);
  return landmarkFacadeTexture;
}

function createLandmark(district, cityColor, seed) {
  const group = new THREE.Group();
  const color = new THREE.Color(cityColor);
  const facade = getLandmarkFacadeTexture();
  const solid = new THREE.MeshPhysicalMaterial({
    color: 0x4f84c8,
    map: facade,
    emissiveMap: facade,
    emissive: 0x3f69a9,
    emissiveIntensity: 0.78,
    metalness: 0.56,
    roughness: 0.2,
    clearcoat: 0.72,
    clearcoatRoughness: 0.18
  });
  const glow = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x17211f, metalness: 0.72, roughness: 0.32 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xb7aa8e, emissive: 0x2b251b, roughness: 0.72, metalness: 0.08 });
  const redWall = new THREE.MeshStandardMaterial({ color: 0x7d3328, emissive: 0x210908, roughness: 0.58, metalness: 0.12 });
  const roof = new THREE.MeshStandardMaterial({ color: 0x24483f, emissive: 0x071713, roughness: 0.4, metalness: 0.38 });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffc96d, transparent: true, opacity: 0.92 });

  const addMesh = (geometry, material, position = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    if (material !== glow && material !== dark) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 28), edgeMaterial);
      mesh.add(edges);
    }
    group.add(mesh);
    return mesh;
  };

  addMesh(new THREE.CylinderGeometry(1.65, 1.8, 0.18, 48), dark, [0, 0.09, 0]);

  if (district.type === "pearl") {
    addMesh(new THREE.CylinderGeometry(0.28, 0.48, 4.6, 24), solid, [0, 2.3, 0]);
    addMesh(new THREE.SphereGeometry(1.05, 32, 24), solid, [0, 1.45, 0]);
    addMesh(new THREE.SphereGeometry(0.62, 28, 20), solid, [0, 3.45, 0]);
    addMesh(new THREE.TorusGeometry(1.15, 0.08, 10, 48), glow, [0, 1.45, 0]).rotation.x = Math.PI / 2;
    addMesh(new THREE.TorusGeometry(0.72, 0.05, 10, 48), glow, [0, 3.45, 0]).rotation.x = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.055, 0.1, 2.5, 12), glow, [0, 5.6, 0]);
  } else if (district.type === "canton") {
    const towerGeometry = new THREE.CylinderGeometry(0.72, 0.95, 6.2, 24, 18, true);
    const positions = towerGeometry.attributes.position;
    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      const y = positions.getY(vertex);
      const normalized = y / 6.2 + 0.5;
      const waist = 0.48 + Math.abs(normalized - 0.5) * 1.05;
      positions.setX(vertex, positions.getX(vertex) * waist);
      positions.setZ(vertex, positions.getZ(vertex) * waist);
    }
    const tower = addMesh(towerGeometry, new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.86 }), [0, 3.1, 0]);
    tower.rotation.y = 0.22;
    addMesh(new THREE.CylinderGeometry(0.11, 0.18, 5.6, 14), solid, [0, 2.9, 0]);
    addMesh(new THREE.CylinderGeometry(0.025, 0.06, 1.8, 8), glow, [0, 7.1, 0]);
  } else if (district.type === "skyscraper") {
    const towerGeometry = new THREE.CylinderGeometry(1, 1, 6.2, 4, 20, false);
    const towerPositions = towerGeometry.attributes.position;
    for (let vertex = 0; vertex < towerPositions.count; vertex += 1) {
      const normalized = towerPositions.getY(vertex) / 6.2 + 0.5;
      const waist = 0.62 + Math.pow(Math.abs(normalized - 0.52) * 2, 1.35) * 0.48;
      towerPositions.setX(vertex, towerPositions.getX(vertex) * waist);
      towerPositions.setZ(vertex, towerPositions.getZ(vertex) * waist);
    }
    towerGeometry.computeVertexNormals();
    const tower = addMesh(towerGeometry, solid, [0, 3.2, 0]);
    tower.rotation.y = Math.PI / 4;
    const outline = new THREE.LineSegments(
      new THREE.EdgesGeometry(towerGeometry, 24),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.48 })
    );
    outline.position.y = 3.2;
    outline.rotation.y = Math.PI / 4;
    group.add(outline);
    addMesh(new THREE.CylinderGeometry(0.16, 0.3, 1.25, 4), glow, [0, 6.85, 0]).rotation.y = Math.PI / 4;
    addMesh(new THREE.CylinderGeometry(0.025, 0.08, 1.35, 8), glow, [0, 8.15, 0]);
  } else if (district.type === "steppedtower") {
    addMesh(new THREE.BoxGeometry(1.6, 2.2, 1.3), solid, [0, 1.18, 0]);
    addMesh(new THREE.BoxGeometry(1.34, 2.0, 1.12), solid, [0, 3.25, 0]);
    addMesh(new THREE.BoxGeometry(1.02, 1.7, 0.92), solid, [0, 5.05, 0]);
    addMesh(new THREE.CylinderGeometry(0.05, 0.13, 1.8, 8), glow, [0, 6.8, 0]);
  } else if (["pagoda", "temple", "pavilion"].includes(district.type)) {
    const levels = district.type === "pagoda" ? 4 : district.type === "pavilion" ? 3 : 2;
    for (let level = 0; level < levels; level += 1) {
      const width = 2.7 - level * 0.42;
      const baseY = 0.35 + level * 0.86;
      addMesh(new THREE.BoxGeometry(width * 0.72, 0.55, width * 0.6), redWall, [0, baseY + 0.27, 0]);
      addMesh(new THREE.CylinderGeometry(0.2, width * 0.72, 0.3, 4), roof, [0, baseY + 0.72, 0]).rotation.y = Math.PI / 4;
    }
    addMesh(new THREE.SphereGeometry(0.09, 12, 12), glow, [0, levels * 0.86 + 0.45, 0]);
  } else if (district.type === "gate" || district.type === "arch") {
    addMesh(new THREE.BoxGeometry(3.7, 0.65, 0.75), district.type === "arch" ? stone : redWall, [0, 0.52, 0]);
    if (district.type === "arch") {
      addMesh(new THREE.BoxGeometry(0.45, 2.5, 0.55), stone, [-1.25, 1.45, 0]);
      addMesh(new THREE.BoxGeometry(0.45, 2.5, 0.55), stone, [1.25, 1.45, 0]);
      addMesh(new THREE.BoxGeometry(3.1, 0.42, 0.62), roof, [0, 2.55, 0]);
    } else {
      addMesh(new THREE.BoxGeometry(2.7, 1.15, 1.05), redWall, [0, 1.35, 0]);
      addMesh(new THREE.CylinderGeometry(0.35, 1.95, 0.42, 4), roof, [0, 2.15, 0]).rotation.y = Math.PI / 4;
    }
  } else if (district.type === "stupa") {
    addMesh(new THREE.CylinderGeometry(1.05, 1.35, 0.55, 32), stone, [0, 0.45, 0]);
    addMesh(new THREE.SphereGeometry(0.92, 32, 20), stone, [0, 1.38, 0]);
    addMesh(new THREE.ConeGeometry(0.52, 2.5, 24), stone, [0, 3.08, 0]);
    addMesh(new THREE.SphereGeometry(0.11, 12, 12), glow, [0, 4.42, 0]);
  } else if (district.type === "station") {
    addMesh(new THREE.BoxGeometry(4.6, 1.25, 1.5), solid, [0, 0.82, 0]);
    const canopy = addMesh(new THREE.CylinderGeometry(1.35, 1.35, 4.9, 32, 1, false, 0, Math.PI), glow, [0, 1.47, 0]);
    canopy.rotation.z = Math.PI / 2;
    canopy.rotation.y = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(2.4, 0.42, 0.18), dark, [0, 1.0, 0.84]);
  } else if (district.type === "clocktower") {
    addMesh(new THREE.BoxGeometry(1.3, 4.5, 1.25), redWall, [0, 2.35, 0]);
    addMesh(new THREE.CylinderGeometry(0.1, 1.05, 1.0, 4), roof, [0, 5.05, 0]).rotation.y = Math.PI / 4;
    const clock = addMesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 32), glow, [0, 3.35, 0.67]);
    clock.rotation.x = Math.PI / 2;
  } else if (district.type === "cathedral") {
    addMesh(new THREE.BoxGeometry(2.6, 2.5, 1.65), stone, [0, 1.35, 0]);
    [-0.9, 0.9].forEach((x) => {
      addMesh(new THREE.BoxGeometry(0.65, 3.7, 0.72), stone, [x, 2.05, 0]);
      addMesh(new THREE.ConeGeometry(0.48, 1.55, 4), roof, [x, 4.67, 0]).rotation.y = Math.PI / 4;
    });
  } else if (district.type === "broadcast") {
    addMesh(new THREE.CylinderGeometry(0.18, 0.42, 5.4, 20), solid, [0, 2.7, 0]);
    addMesh(new THREE.SphereGeometry(0.74, 32, 20), solid, [0, 3.55, 0]).scale.y = 0.5;
    addMesh(new THREE.TorusGeometry(0.88, 0.06, 10, 48), glow, [0, 3.55, 0]).rotation.x = Math.PI / 2;
    addMesh(new THREE.CylinderGeometry(0.03, 0.1, 2.6, 10), glow, [0, 6.55, 0]);
  } else if (district.type === "museum") {
    addMesh(new THREE.BoxGeometry(4.5, 0.85, 2.1), stone, [0, 0.58, 0]);
    const roofLeft = addMesh(new THREE.BoxGeometry(2.25, 0.18, 2.35), roof, [-1.05, 1.15, 0]);
    const roofRight = addMesh(new THREE.BoxGeometry(2.25, 0.18, 2.35), roof, [1.05, 1.15, 0]);
    roofLeft.rotation.z = -0.13;
    roofRight.rotation.z = 0.13;
    for (let column = -3; column <= 3; column += 1) addMesh(new THREE.CylinderGeometry(0.06, 0.07, 0.72, 8), dark, [column * 0.5, 0.58, 1.1]);
  } else if (district.type === "megacenter") {
    addMesh(new THREE.BoxGeometry(5.4, 1.35, 2.6), solid, [0, 0.85, 0]);
    const crown = addMesh(new THREE.CylinderGeometry(1.7, 2.7, 0.65, 48, 1, false, 0, Math.PI), roof, [0, 1.72, 0]);
    crown.rotation.z = Math.PI / 2;
    crown.rotation.y = Math.PI / 2;
    addMesh(new THREE.BoxGeometry(3.6, 0.35, 0.15), glow, [0, 0.95, 1.34]);
  } else if (district.type === "theatre") {
    const hall = addMesh(new THREE.CylinderGeometry(1.45, 2.5, 1.7, 6), solid, [0, 0.95, 0]);
    hall.rotation.y = Math.PI / 6;
    const roofShell = addMesh(new THREE.CylinderGeometry(0.25, 2.65, 0.8, 6), roof, [0, 2.05, 0]);
    roofShell.rotation.y = Math.PI / 6;
    addMesh(new THREE.BoxGeometry(3.6, 0.11, 0.12), glow, [0, 1.08, 1.25]);
  } else if (district.type === "bridge") {
    addMesh(new THREE.BoxGeometry(4.8, 0.28, 0.72), stone, [0, 1.25, 0]);
    [-1.35, 1.35].forEach((x) => addMesh(new THREE.BoxGeometry(0.48, 1.7, 0.68), stone, [x, 0.85, 0]));
    const arch = addMesh(new THREE.TorusGeometry(1.55, 0.15, 10, 64, Math.PI), stone, [0, 1.2, 0]);
    arch.rotation.z = Math.PI;
  } else if (district.type === "twintower") {
    [-1.0, 1.0].forEach((x) => {
      const tower = addMesh(new THREE.CylinderGeometry(0.42, 0.72, 5.8, 5), solid, [x, 3.0, 0]);
      tower.rotation.y = x * 0.15;
      addMesh(new THREE.CylinderGeometry(0.04, 0.12, 1.1, 8), glow, [x, 6.45, 0]);
    });
    addMesh(new THREE.BoxGeometry(2.2, 0.36, 0.65), solid, [0, 3.85, 0]);
  } else if (district.type === "sail") {
    [-1.35, -0.45, 0.45, 1.35].forEach((x, towerIndex) => {
      const height = 4.4 + towerIndex * 0.45;
      const tower = addMesh(new THREE.CylinderGeometry(0.28, 0.58, height, 5), solid, [x, height / 2, 0]);
      tower.rotation.z = (towerIndex - 1.5) * -0.035;
    });
    const skyBridge = addMesh(new THREE.BoxGeometry(4.4, 0.55, 0.82), solid, [0, 5.45, 0]);
    skyBridge.rotation.z = -0.08;
    addMesh(new THREE.BoxGeometry(3.5, 0.08, 0.9), glow, [0, 5.48, 0.02]);
  } else if (district.type === "stadium") {
    const bowl = addMesh(new THREE.TorusGeometry(1.9, 0.34, 12, 64), glow, [0, 0.72, 0]);
    bowl.rotation.x = Math.PI / 2;
    bowl.scale.z = 0.65;
    addMesh(new THREE.CylinderGeometry(1.45, 1.75, 0.65, 48), solid, [0, 0.45, 0]).scale.z = 0.66;
    for (let rib = 0; rib < 12; rib += 1) {
      const angle = rib / 12 * Math.PI * 2;
      const mast = addMesh(new THREE.CylinderGeometry(0.025, 0.045, 2.35, 6), glow, [Math.cos(angle) * 1.68, 1.62, Math.sin(angle) * 1.05]);
      mast.rotation.z = Math.cos(angle) * 0.35;
    }
  } else if (district.type === "ferris") {
    const wheel = addMesh(new THREE.TorusGeometry(2.25, 0.08, 10, 72), glow, [0, 3.0, 0]);
    wheel.rotation.y = Math.PI / 2;
    for (let spoke = 0; spoke < 12; spoke += 1) {
      const angle = spoke / 12 * Math.PI * 2;
      const beam = addMesh(new THREE.CylinderGeometry(0.025, 0.025, 2.2, 6), glow, [0, 3 + Math.sin(angle) * 1.1, Math.cos(angle) * 1.1]);
      beam.rotation.x = angle;
    }
    [-0.9, 0.9].forEach((z) => addMesh(new THREE.CylinderGeometry(0.08, 0.13, 3.4, 8), solid, [0, 1.5, z]).rotation.z = z * 0.28);
  }

  group.scale.setScalar(district.type === "canton" || district.type === "skyscraper" ? 0.82 : 0.95);
  group.rotation.y = (seed % 7) * 0.035;
  return group;
}

function createMapLabel(text, color) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 256;
  labelCanvas.height = 72;
  const context = labelCanvas.getContext("2d");
  context.clearRect(0, 0, 256, 72);
  context.fillStyle = "rgba(3, 10, 9, 0.78)";
  context.fillRect(50, 12, 156, 48);
  context.strokeStyle = `#${color.toString(16).padStart(6, "0")}`;
  context.strokeRect(50.5, 12.5, 155, 47);
  context.fillStyle = "#f6f7f4";
  context.font = '600 26px "Microsoft YaHei"';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, 128, 36);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(4.2, 1.18, 1);
  return sprite;
}

const MAP_ZOOM = 13;
const MAP_TILE_SIZE = 15;
const mapTextureLoader = new THREE.TextureLoader();

function createMapBase() {
  const base = new THREE.Mesh(new THREE.PlaneGeometry(90, 74, 1, 1), new THREE.MeshStandardMaterial({
    color: 0x06110f,
    emissive: 0x020504,
    roughness: 0.94,
    metalness: 0.08
  }));
  base.rotation.x = -Math.PI / 2;
  base.position.y = -1.66;
  return base;
}

function lonLatToTile([lat, lon], zoom = MAP_ZOOM) {
  const scale = 2 ** zoom;
  const latitude = THREE.MathUtils.clamp(lat, -85.0511, 85.0511) * Math.PI / 180;
  return {
    x: (lon + 180) / 360 * scale,
    y: (1 - Math.asinh(Math.tan(latitude)) / Math.PI) / 2 * scale
  };
}

function createMapTileLayer(district) {
  const layer = new THREE.Group();
  const center = lonLatToTile(district.center);
  const originX = Math.floor(center.x) - 1;
  const originY = Math.floor(center.y) - 1;
  const materials = [];

  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      const tileX = originX + column;
      const tileY = originY + row;
      const material = new THREE.MeshBasicMaterial({
        color: 0x173b70,
        transparent: true,
        opacity: 0,
        depthWrite: false
      });
      const tile = new THREE.Mesh(new THREE.PlaneGeometry(MAP_TILE_SIZE + 0.025, MAP_TILE_SIZE + 0.025), material);
      tile.rotation.x = -Math.PI / 2;
      tile.position.set((tileX - center.x) * MAP_TILE_SIZE, -1.55, (tileY - center.y) * MAP_TILE_SIZE);
      layer.add(tile);
      materials.push(material);

      mapTextureLoader.load(
        `https://tile.openstreetmap.org/${MAP_ZOOM}/${tileX}/${tileY}.png`,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = 4;
          material.map = texture;
          material.color.set(0x315f9e);
          material.needsUpdate = true;
        },
        undefined,
        () => { material.color.set(0x0c2447); }
      );
    }
  }

  layer.userData.materials = materials;
  layer.userData.targetOpacity = 0.84;
  layer.userData.removing = false;
  return layer;
}

function createCityWorld(city, index) {
  const group = new THREE.Group();
  group.position.set(city.position[0] * MAP_SCALE, 0, city.position[1] * MAP_SCALE);
  const random = seededRandom(1807 + index * 913);
  const color = new THREE.Color(city.color);

  const terrainGeometry = new THREE.CircleGeometry(7.8, 96);
  const positions = terrainGeometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const distance = Math.sqrt(x * x + y * y);
    const height = Math.sin(x * 0.58 + index) * 0.13 + Math.cos(y * 0.52 - index) * 0.11;
    positions.setZ(i, height - Math.max(0, distance - 5) * 0.035);
  }
  terrainGeometry.computeVertexNormals();
  const terrain = new THREE.Mesh(terrainGeometry, new THREE.MeshStandardMaterial({
    color: color.clone().multiplyScalar(0.12),
    emissive: color.clone().multiplyScalar(0.055),
    roughness: 0.9,
    metalness: 0.18,
    transparent: true,
    opacity: 0.14,
    depthWrite: false
  }));
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -1.35;
  group.add(terrain);

  const wire = new THREE.Mesh(terrainGeometry, new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity: 0.05,
    depthWrite: false
  }));
  wire.rotation.copy(terrain.rotation);
  wire.position.y = -1.32;
  group.add(wire);

  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: color.clone().multiplyScalar(0.16),
    emissive: color.clone().multiplyScalar(0.09),
    roughness: 0.55,
    metalness: 0.72
  });
  const buildings = new THREE.Group();
  for (let i = 0; i < 28; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 3.6 + random() * 4.1;
    const width = 0.18 + random() * 0.44;
    const depth = 0.18 + random() * 0.44;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.72;
    let height = 0.35 + Math.pow(random(), 2) * 2.8;
    if (Math.abs(x) < 2.6 && z > 0) height *= 0.28;
    const building = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), buildingMaterial);
    building.position.set(x, -1.18 + height / 2, z);
    building.rotation.y = -angle + (random() - 0.5) * 0.3;
    buildings.add(building);
  }
  group.add(buildings);

  const landmark = createLandmark(city, index);
  landmark.position.y = -1.18;
  group.add(landmark);

  const mapLabel = createMapLabel(city.name, city.color);
  mapLabel.position.set(0, 0.1, -5.6);
  group.add(mapLabel);

  const rings = new THREE.Group();
  rings.position.y = -1.22;
  [2.5, 3.35, 4.35].forEach((radius, ringIndex) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018 + ringIndex * 0.008, 8, 160), new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.28 - ringIndex * 0.055
    }));
    ring.rotation.set(Math.PI / 2, 0, ringIndex * 0.18);
    rings.add(ring);
  });
  group.add(rings);

  const districtNodes = new THREE.Group();
  districtNodes.position.y = -0.78;
  city.districts.forEach((district, districtIndex) => {
    const angle = districtIndex / city.districts.length * Math.PI * 2 - Math.PI / 2;
    const node = new THREE.Group();
    node.position.set(Math.cos(angle) * 4.6, 0, Math.sin(angle) * 3.5);
    const line = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 6), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.35 }));
    line.position.y = 0.7;
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 12), new THREE.MeshBasicMaterial({ color }));
    dot.position.y = 1.42;
    node.add(line, dot);
    node.userData.dot = dot;
    districtNodes.add(node);
  });
  group.add(districtNodes);

  const routeMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.52 });
  const routeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, -0.85, 4),
    new THREE.Vector3(-6, 0.2, -2),
    new THREE.Vector3(-1.5, -0.2, 1.8),
    new THREE.Vector3(3.2, 0.55, -1.4),
    new THREE.Vector3(9.5, -0.75, 3)
  ]);
  const route = new THREE.Mesh(new THREE.TubeGeometry(routeCurve, 120, 0.035, 6, false), routeMaterial);
  group.add(route);
  const routePulse = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: 0xfff2c9 }));
  group.add(routePulse);

  const coreLight = new THREE.PointLight(color, 10, 16, 2);
  coreLight.position.set(0, 3.4, 1);
  group.add(coreLight);

  group.userData = {
    landmark,
    landmarkBaseY: landmark.position.y,
    rings,
    districtNodes,
    routeCurve,
    routePulse,
    coreLight,
    mapLabel,
    terrain,
    wire,
    targetLandmarkScale: 0.42,
    cityIndex: index
  };
  return group;
}

function createCityScene(city, index) {
  const group = new THREE.Group();
  const color = new THREE.Color(city.color);
  const random = seededRandom(3203 + index * 617);
  const buildingMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d2b55,
    emissive: 0x061b3c,
    roughness: 0.38,
    metalness: 0.78,
    transparent: true,
    opacity: 0.9
  });
  const buildings = new THREE.Group();
  const blockGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cityBlocks = new THREE.InstancedMesh(blockGeometry, buildingMaterial, 150);
  const cityOutlines = new THREE.InstancedMesh(blockGeometry, new THREE.MeshBasicMaterial({
    color: 0x2874cf,
    wireframe: true,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), 150);
  const blockTransform = new THREE.Object3D();
  let placedBlocks = 0;
  for (let row = 0; row < 10; row += 1) {
    for (let column = 0; column < 15; column += 1) {
      const x = (column - 7) * 1.82 + (random() - 0.5) * 0.48;
      const z = (row - 5) * 1.72 + (random() - 0.5) * 0.48;
      if (Math.abs(x) < 3.25 && Math.abs(z) < 4.25) continue;
      const width = 0.42 + random() * 0.7;
      const depth = 0.42 + random() * 0.72;
      const height = 0.24 + Math.pow(random(), 2) * 1.7;
      blockTransform.position.set(x, -1.5 + height / 2, z);
      blockTransform.scale.set(width, height, depth);
      blockTransform.rotation.set(0, (random() - 0.5) * 0.18, 0);
      blockTransform.updateMatrix();
      cityBlocks.setMatrixAt(placedBlocks, blockTransform.matrix);
      cityOutlines.setMatrixAt(placedBlocks, blockTransform.matrix);
      placedBlocks += 1;
    }
  }
  cityBlocks.count = placedBlocks;
  cityOutlines.count = placedBlocks;
  cityBlocks.instanceMatrix.needsUpdate = true;
  cityOutlines.instanceMatrix.needsUpdate = true;
  buildings.add(cityBlocks, cityOutlines);
  group.add(buildings);

  const routeNetwork = new THREE.Group();
  const routeEnds = [
    [-14, -1.33, -7], [14, -1.33, -6], [-13, -1.33, 7], [13, -1.33, 7], [0, -1.33, -11]
  ];
  routeEnds.forEach((end, routeIndex) => {
    const routeColor = routeIndex % 2 === 0 ? 0xffb84f : 0x2f7dff;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -1.31, 0),
      new THREE.Vector3(end[0] * 0.38 + (routeIndex - 2) * 0.5, -1.3, end[2] * 0.34),
      new THREE.Vector3(end[0] * 0.72 - (routeIndex % 2 ? 1.1 : -0.7), -1.31, end[2] * 0.7),
      new THREE.Vector3(...end)
    ], false, "centripetal");
    const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.13, 8, false), new THREE.MeshBasicMaterial({
      color: routeColor,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, 0.033, 8, false), new THREE.MeshBasicMaterial({
      color: routeColor,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    routeNetwork.add(halo, core);
  });
  [2.0, 2.65, 3.35].forEach((radius, ringIndex) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, ringIndex === 0 ? 0.055 : 0.025, 10, 96), new THREE.MeshBasicMaterial({
      color: ringIndex === 1 ? 0x1f78ff : 0xffb547,
      transparent: true,
      opacity: 0.84 - ringIndex * 0.13,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.28;
    routeNetwork.add(ring);
  });
  group.add(routeNetwork);

  const landmarks = city.districts.map((district, districtIndex) => {
    const landmark = createLandmark(district, city.color, index * 10 + districtIndex);
    landmark.position.y = -1.46;
    landmark.scale.setScalar(0.001);
    group.add(landmark);
    return landmark;
  });

  const labels = city.districts.map((district) => {
    const label = createMapLabel(district.name, city.color);
    label.position.set(0, 0.15, -5.2);
    label.material.opacity = 0;
    group.add(label);
    return label;
  });

  const coreLight = new THREE.PointLight(0xffbd61, 0, 20, 2);
  coreLight.position.set(0, 3.8, 1);
  group.add(coreLight);
  group.visible = false;
  group.userData = { buildings, landmarks, labels, routeNetwork, coreLight, cityIndex: index };
  return group;
}

function createMapWorld() {
  const maplibre = window.maplibregl;
  if (!maplibre || !cityRealMapStage || !cityRealMap) throw new Error("Real map runtime unavailable");

  const boundaryCache = new Map();
  let ready = false;
  let requestedCity = activeCity;
  let requestedDistrict = activeDistrict;
  let shownCity = activeCity;
  let updateToken = 0;
  let movingTimer = 0;
  let mapMarkers = [];

  const map = new maplibre.Map({
    container: cityRealMap,
    center: cities[0].map.center,
    zoom: 9.45,
    pitch: 44,
    bearing: -10,
    attributionControl: false,
    fadeDuration: 120,
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors"
        },
        tone: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]]]
            }
          }
        }
      },
      layers: [
        {
          id: "brand-background",
          type: "background",
          paint: { "background-color": "#031126" }
        },
        {
          id: "osm-base",
          type: "raster",
          source: "osm",
          paint: {
            "raster-saturation": -0.72,
            "raster-contrast": 0.28,
            "raster-brightness-min": 0.03,
            "raster-brightness-max": 0.58,
            "raster-fade-duration": 100
          }
        },
        {
          id: "brand-tone",
          type: "fill",
          source: "tone",
          paint: { "fill-color": "#03152d", "fill-opacity": 0.66 }
        }
      ]
    }
  });

  map.on("error", () => {
    // Tile requests can be canceled during camera moves or page navigation.
  });

  function loadBoundary(city) {
    if (!boundaryCache.has(city.map.boundary)) {
      boundaryCache.set(city.map.boundary, fetch(city.map.boundary).then((response) => {
        if (!response.ok) throw new Error(`Map boundary HTTP ${response.status}`);
        return response.json();
      }));
    }
    return boundaryCache.get(city.map.boundary);
  }

  function districtPoint(city, district) {
    return district ? [district.center[1], district.center[0]] : city.map.center;
  }

  function routeData(city, district) {
    const destination = districtPoint(city, district);
    const midpoint = [
      city.map.origin[0] + (destination[0] - city.map.origin[0]) * 0.56,
      city.map.origin[1] + (destination[1] - city.map.origin[1]) * 0.42
    ];
    return {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: [city.map.origin, midpoint, destination] }
    };
  }

  function clearMarkers() {
    mapMarkers.forEach((marker) => marker.remove());
    mapMarkers = [];
  }

  function addMarker(point, title, detail, type) {
    const element = document.createElement("div");
    element.className = `city-map-marker ${type}`;
    const dot = document.createElement("i");
    const copy = document.createElement("span");
    const strong = document.createElement("strong");
    const small = document.createElement("small");
    strong.textContent = title;
    small.textContent = detail;
    copy.append(strong, small);
    element.append(dot, copy);
    mapMarkers.push(new maplibre.Marker({ element, anchor: "bottom" }).setLngLat(point).addTo(map));
  }

  function finishMovement(token) {
    if (token !== updateToken) return;
    cityRealMapStage.classList.remove("is-moving");
  }

  async function applyLocation(cityIndex, districtIndex, immediate = false) {
    if (!ready) return;
    const token = ++updateToken;
    const city = cities[cityIndex];
    const district = city.districts[districtIndex] || null;
    const cityChanged = cityIndex !== shownCity;
    shownCity = cityIndex;
    cityRealMapStage.classList.add("is-moving");
    cityMapStatus.textContent = cityChanged ? `正在前往${city.name}` : `正在定位${district?.name || city.name}`;

    try {
      const boundary = await loadBoundary(city);
      if (token !== updateToken) return;
      map.getSource("city-boundaries").setData(boundary);
      const selectedName = district?.mapName || district?.name || `${city.name}市`;
      const filter = ["==", ["get", "name"], selectedName];
      map.setFilter("selected-area-fill", filter);
      map.setFilter("selected-area-extrusion", filter);
      map.setFilter("selected-area-line", filter);
      map.getSource("service-route").setData(routeData(city, district));

      clearMarkers();
      addMarker(city.map.origin, city.map.originName, "接应起点", "origin");
      addMarker(districtPoint(city, district), district?.landmark || city.landmark, district?.name || "城市服务范围", "destination");

      const destination = districtPoint(city, district);
      map.flyTo({
        center: destination,
        zoom: district ? (cityChanged ? 10.45 : 11.15) : 9.55,
        pitch: district ? 49 : 42,
        bearing: cityIndex % 2 === 0 ? -12 : 14,
        duration: immediate ? 0 : (cityChanged ? 1050 : 760),
        essential: true
      });

      window.clearTimeout(movingTimer);
      movingTimer = window.setTimeout(() => finishMovement(token), 3200);
      map.once("idle", () => finishMovement(token));
    } catch (error) {
      console.warn("Map boundary unavailable:", error.message);
      cityRealMapStage.classList.remove("is-moving");
    }
  }

  map.once("style.load", () => {
    map.addSource("city-boundaries", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({ id: "area-fill", type: "fill", source: "city-boundaries", paint: { "fill-color": "#155070", "fill-opacity": 0.09 } });
    map.addLayer({ id: "area-line", type: "line", source: "city-boundaries", paint: { "line-color": "#56a4c5", "line-width": 1, "line-opacity": 0.5 } });
    map.addLayer({ id: "selected-area-fill", type: "fill", source: "city-boundaries", paint: { "fill-color": "#d7aa5d", "fill-opacity": 0.27 } });
    map.addLayer({ id: "selected-area-extrusion", type: "fill-extrusion", source: "city-boundaries", paint: { "fill-extrusion-color": "#c99342", "fill-extrusion-height": 760, "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.14 } });
    map.addLayer({ id: "selected-area-line", type: "line", source: "city-boundaries", paint: { "line-color": "#ffd890", "line-width": 3, "line-blur": 0.25 } });
    map.addSource("service-route", { type: "geojson", data: routeData(cities[0], cities[0].districts[0]) });
    map.addLayer({ id: "service-route-glow", type: "line", source: "service-route", paint: { "line-color": "#d7aa5d", "line-width": 10, "line-opacity": 0.22, "line-blur": 6 } });
    map.addLayer({ id: "service-route", type: "line", source: "service-route", paint: { "line-color": "#ffd890", "line-width": 2.7, "line-dasharray": [2.2, 1.3] } });
    ready = true;
    stage.classList.add("use-real-map", "map-ready");
    stage.style.setProperty("--world-accent", "#d7aa5d");
    applyLocation(requestedCity, requestedDistrict, true);
    window.setTimeout(() => map.resize(), 60);
  });

  const resizeObserver = new ResizeObserver(() => map.resize());
  resizeObserver.observe(stage);

  return {
    setLocation(cityIndex, districtIndex) {
      requestedCity = cityIndex;
      requestedDistrict = districtIndex;
      applyLocation(cityIndex, districtIndex);
    },
    finishIntro() {}
  };
}

function createImageWorld({ warm = true } = {}) {
  if (!stage || !cityImageStage || !cityImageFront || !cityImageBack) throw new Error("Image city stage unavailable");
  stage.classList.add("use-image-world");
  let frontLayer = cityImageFront;
  let backLayer = cityImageBack;
  let shownCity = activeCity;
  let shownDistrict = activeDistrict;
  let transitionTimer = 0;
  let loadToken = 0;
  const preloadCache = new Map();

  const sourceFor = (cityIndex, districtIndex) => {
    const city = cities[cityIndex];
    const district = city.districts[districtIndex];
    return district?.asset || city.asset || (district ? `./City/${city.name}-${district.name}.webp` : "./assets/hero-city.jpg");
  };

  const setFallback = (layer) => {
    layer.src = "./assets/hero-city.jpg";
  };

  const preloadSource = (source, priority = "low") => {
    if (preloadCache.has(source)) return preloadCache.get(source);
    const promise = new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.fetchPriority = priority;
      image.onload = async () => {
        try {
          await image.decode();
        } catch {
          // A completed load is sufficient when explicit decoding is unavailable.
        }
        resolve(source);
      };
      image.onerror = () => resolve("./assets/hero-city.jpg");
      image.src = source;
    });
    preloadCache.set(source, promise);
    return promise;
  };

  const warmNearby = (cityIndex, districtIndex) => {
    const city = cities[cityIndex];
    const immediate = [
      sourceFor(cityIndex, Math.max(0, districtIndex - 1)),
      sourceFor(cityIndex, Math.min(Math.max(city.districts.length - 1, 0), districtIndex + 1)),
      sourceFor(indexWrap(cityIndex - 1, cities.length), 0),
      sourceFor(indexWrap(cityIndex + 1, cities.length), 0)
    ];
    immediate.forEach((source) => preloadSource(source));

    const warmCity = () => {
      city.districts.forEach((_, index) => preloadSource(sourceFor(cityIndex, index)));
    };
    if ("requestIdleCallback" in window) window.requestIdleCallback(warmCity, { timeout: 1000 });
    else window.setTimeout(warmCity, 250);
  };

  frontLayer.addEventListener("error", () => setFallback(frontLayer));
  backLayer.addEventListener("error", () => setFallback(backLayer));
  const initialSource = sourceFor(shownCity, shownDistrict);
  frontLayer.src = initialSource;
  frontLayer.dataset.source = frontLayer.src;
  preloadSource(initialSource, "high");
  if (warm) warmNearby(shownCity, shownDistrict);

  function settleTransition() {
    if (!transitionTimer) return;
    window.clearTimeout(transitionTimer);
    transitionTimer = 0;
    if (backLayer.classList.contains("is-active")) {
      const previousFront = frontLayer;
      frontLayer = backLayer;
      backLayer = previousFront;
    }
    frontLayer.className = "city-image-layer is-active";
    backLayer.className = "city-image-layer";
  }

  function setLocation(cityIndex, districtIndex) {
    const source = sourceFor(cityIndex, districtIndex);
    if (cityIndex === shownCity && districtIndex === shownDistrict && frontLayer.getAttribute("src")) return;
    settleTransition();

    const cityChanged = cityIndex !== shownCity;
    const forwardDistance = indexWrap(cityIndex - shownCity, cities.length);
    const direction = cityChanged
      ? (forwardDistance <= cities.length / 2 ? 1 : -1)
      : (districtIndex >= shownDistrict ? 1 : -1);
    const enteringClass = cityChanged
      ? (direction > 0 ? "from-right" : "from-left")
      : (direction > 0 ? "from-bottom" : "from-top");
    const exitingClass = cityChanged
      ? (direction > 0 ? "to-left" : "to-right")
      : (direction > 0 ? "to-top" : "to-bottom");
    shownCity = cityIndex;
    shownDistrict = districtIndex;
    const token = ++loadToken;
    preloadSource(source, "high").then((readySource) => {
      if (token !== loadToken) return;
      backLayer.className = `city-image-layer is-entering ${enteringClass}`;
      backLayer.src = readySource;
      backLayer.dataset.source = readySource;
      backLayer.getBoundingClientRect();
      window.requestAnimationFrame(() => {
        if (token !== loadToken) return;
        frontLayer.className = `city-image-layer is-active is-exiting ${exitingClass}`;
        backLayer.classList.add("is-active");
      });
      transitionTimer = window.setTimeout(() => {
        transitionTimer = 0;
        const previousFront = frontLayer;
        frontLayer = backLayer;
        backLayer = previousFront;
        frontLayer.className = "city-image-layer is-active";
        backLayer.className = "city-image-layer";
      }, 540);
      if (warm) warmNearby(cityIndex, districtIndex);
    });
  }

  return { setLocation, finishIntro() {} };
}

function createWorld() {
  if (!stage || !canvas || !window.WebGLRenderingContext) throw new Error("WebGL unavailable");

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(stage.clientWidth, stage.clientHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020817);
  scene.fog = new THREE.FogExp2(0x020817, 0.012);
  const camera = new THREE.PerspectiveCamera(48, stage.clientWidth / stage.clientHeight, 0.1, 160);
  camera.position.set(-10, 17, 34);

  scene.add(new THREE.HemisphereLight(0x6ea9ff, 0x01030b, 1.75));
  const keyLight = new THREE.DirectionalLight(0xffca72, 2.65);
  keyLight.position.set(-8, 14, 8);
  scene.add(keyLight);

  scene.add(createMapBase());

  const cityGroups = cities.map((city, index) => {
    const group = createCityScene(city, index);
    scene.add(group);
    return group;
  });

  const cameraTarget = new THREE.Vector3(0, -0.35, 0);
  const desiredPosition = new THREE.Vector3(0, 12.2, 19.5);
  const mapLayers = [];
  let introProgress = 0;
  let introDone = false;
  let cameraLift = 0;
  let previousCityIndex = activeCity;
  let previousDistrictIndex = activeDistrict;
  let currentMapKey = "";
  let lastFrameTime = performance.now();
  let elapsed = 0;

  function removeMapLayer(layer) {
    scene.remove(layer);
    layer.children.forEach((tile) => {
      tile.geometry.dispose();
      tile.material.map?.dispose();
      tile.material.dispose();
    });
  }

  function switchMap(cityIndex, districtIndex) {
    const key = `${cityIndex}:${districtIndex}`;
    if (key === currentMapKey) return;
    const cityChanged = cityIndex !== previousCityIndex;
    const direction = cityChanged
      ? (cityIndex > previousCityIndex || (previousCityIndex === cities.length - 1 && cityIndex === 0) ? 1 : -1)
      : (districtIndex >= previousDistrictIndex ? 1 : -1);
    const entering = createMapTileLayer(cities[cityIndex].districts[districtIndex]);
    entering.position.x = cityChanged ? direction * 14 : 0;
    entering.position.z = cityChanged ? 0 : direction * 11;
    entering.userData.targetX = 0;
    entering.userData.targetZ = 0;
    mapLayers.forEach((layer) => {
      layer.userData.removing = true;
      layer.userData.targetOpacity = 0;
      layer.userData.targetX = cityChanged ? -direction * 14 : 0;
      layer.userData.targetZ = cityChanged ? 0 : -direction * 11;
    });
    scene.add(entering);
    mapLayers.push(entering);
    currentMapKey = key;
  }

  function setLocation(cityIndex, districtIndex) {
    const locationChanged = cityIndex !== previousCityIndex || districtIndex !== previousDistrictIndex;
    const selectedLandmarkScale = stage.clientWidth <= 700 ? 0.82 : stage.clientWidth <= 980 ? 1.05 : 1.65;
    if (locationChanged) cameraLift = 1;
    switchMap(cityIndex, districtIndex);
    cityGroups.forEach((group, index) => {
      const isActiveCity = index === cityIndex;
      group.visible = isActiveCity;
      group.userData.landmarks.forEach((landmark, landmarkIndex) => {
        landmark.userData.targetScale = isActiveCity && landmarkIndex === districtIndex ? selectedLandmarkScale : 0.001;
      });
      group.userData.labels.forEach((label, labelIndex) => {
        label.userData.targetOpacity = isActiveCity && labelIndex === districtIndex ? 1 : 0;
      });
      group.userData.coreLight.intensity = isActiveCity ? 13 : 0;
    });
    previousCityIndex = cityIndex;
    previousDistrictIndex = districtIndex;
  }

  function finishWorldIntro(immediate = false) {
    introDone = true;
    if (immediate) {
      camera.position.copy(desiredPosition);
      introProgress = 1;
    }
  }

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    cityGroups.forEach((group) => {
      group.position.z = width <= 700 ? 2.6 : width <= 980 ? 1.2 : 0;
    });
    setLocation(activeCity, activeDistrict);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(stage);

  function animate(frameTime) {
    const currentFrameTime = Number.isFinite(frameTime) ? frameTime : performance.now();
    const delta = Math.min(Math.max((currentFrameTime - lastFrameTime) / 1000, 0), 0.05);
    lastFrameTime = currentFrameTime;
    elapsed += delta;
    if (!introDone) {
      introProgress = Math.min(1, introProgress + delta * 0.27);
      const eased = 1 - Math.pow(1 - introProgress, 3);
      camera.position.x = THREE.MathUtils.lerp(-10, desiredPosition.x, eased);
      camera.position.z = THREE.MathUtils.lerp(34, desiredPosition.z, eased);
      camera.position.y = THREE.MathUtils.lerp(16, desiredPosition.y, eased);
    } else {
      cameraLift = THREE.MathUtils.lerp(cameraLift, 0, 1 - Math.pow(0.025, delta));
      const liftedPosition = desiredPosition.clone();
      liftedPosition.y += cameraLift * 5.5;
      camera.position.lerp(liftedPosition, 1 - Math.pow(0.003, delta));
    }
    camera.lookAt(cameraTarget);

    for (let layerIndex = mapLayers.length - 1; layerIndex >= 0; layerIndex -= 1) {
      const layer = mapLayers[layerIndex];
      layer.position.x = THREE.MathUtils.lerp(layer.position.x, layer.userData.targetX, 1 - Math.pow(0.006, delta));
      layer.position.z = THREE.MathUtils.lerp(layer.position.z, layer.userData.targetZ, 1 - Math.pow(0.006, delta));
      let highestOpacity = 0;
      layer.userData.materials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, layer.userData.targetOpacity, 1 - Math.pow(0.004, delta));
        highestOpacity = Math.max(highestOpacity, material.opacity);
      });
      if (layer.userData.removing && highestOpacity < 0.008) {
        removeMapLayer(layer);
        mapLayers.splice(layerIndex, 1);
      }
    }

    cityGroups.forEach((group, cityIndex) => {
      if (!group.visible) return;
      group.userData.landmarks.forEach((landmark, landmarkIndex) => {
        const targetScale = landmark.userData.targetScale ?? 0.001;
        const nextScale = THREE.MathUtils.lerp(landmark.scale.x, targetScale, 1 - Math.pow(0.0015, delta));
        landmark.scale.setScalar(nextScale);
        landmark.position.y = -1.46 + Math.sin(elapsed * 0.78 + landmarkIndex) * 0.07;
        landmark.rotation.y += delta * 0.075;
      });
      group.userData.labels.forEach((label) => {
        label.material.opacity = THREE.MathUtils.lerp(label.material.opacity, label.userData.targetOpacity ?? 0, 1 - Math.pow(0.002, delta));
      });
    });
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
  setLocation(activeCity, activeDistrict);
  return { setLocation, finishIntro: finishWorldIntro };
}

if (stage) {
  renderInterface();
  bindControls();
  try {
    const imageWorld = createImageWorld({ warm: !window.maplibregl });
    if (window.maplibregl) {
      try {
        const mapWorld = createMapWorld();
        sceneApi = {
          setLocation(cityIndex, districtIndex) {
            imageWorld.setLocation(cityIndex, districtIndex);
            mapWorld.setLocation(cityIndex, districtIndex);
          },
          finishIntro(force) {
            imageWorld.finishIntro(force);
            mapWorld.finishIntro(force);
          }
        };
      } catch (mapError) {
        console.warn("Real map unavailable, using city images:", mapError.message);
        sceneApi = imageWorld;
      }
    } else {
      sceneApi = imageWorld;
    }
    renderInterface();
  } catch (error) {
    console.warn("City scene unavailable:", error.message);
    stage.classList.add("no-webgl", "is-ready");
    fallback.hidden = false;
  }
  setupIntro();
}
