const galleryCities = [
  {
    name: "北京",
    code: "BJS",
    districts: [
      { name: "朝阳区", landmark: "中国尊 · 国贸 CBD", image: "./City/北京-朝阳区.webp" },
      { name: "海淀区", landmark: "佛香阁 · 中关村", image: "./City/北京-海淀区.webp" },
      { name: "东城区", landmark: "天安门城楼 · 故宫", image: "./City/北京-东城区.webp" },
      { name: "西城区", landmark: "白塔 · 金融街", image: "./City/北京-西城区.webp" },
      { name: "丰台区", landmark: "北京西站 · 丽泽商务区", image: "./City/北京-丰台区.webp" }
    ]
  },
  {
    name: "上海",
    code: "SHA",
    districts: [
      { name: "浦东新区", landmark: "东方明珠 · 陆家嘴", image: "./City/上海-浦东新区.webp" },
      { name: "黄浦区", landmark: "外滩钟楼 · 南京东路", image: "./City/上海-黄浦区.webp" },
      { name: "静安区", landmark: "静安寺 · 南京西路", image: "./City/上海-静安区.webp" },
      { name: "徐汇区", landmark: "徐家汇 · 西岸", image: "./City/上海-徐汇区.webp" },
      { name: "闵行区", landmark: "虹桥枢纽 · 虹桥商务区", image: "./City/上海-闵行区.webp" }
    ]
  }
];

const mapCities = [
  {
    name: "北京",
    code: "BJS",
    center: [116.4074, 39.9042],
    zoom: 9.4,
    boundary: "./assets/maps/beijing-districts.geojson",
    origin: [116.6031, 40.0799],
    originName: "首都机场",
    summary: "从首都机场到国贸 CBD，地图镜头会定位真实区域并高亮行政区边界。",
    districts: [
      { name: "朝阳区", center: [116.4864, 39.9215], landmark: "中国尊", route: [116.4551, 39.9185] },
      { name: "海淀区", center: [116.2981, 39.9593], landmark: "中关村", route: [116.3157, 39.9837] },
      { name: "东城区", center: [116.4188, 39.9175], landmark: "故宫", route: [116.3972, 39.9151] },
      { name: "西城区", center: [116.3668, 39.9153], landmark: "金融街", route: [116.3637, 39.9123] },
      { name: "丰台区", center: [116.287, 39.8636], landmark: "丽泽商务区", route: [116.3046, 39.8651] }
    ]
  },
  {
    name: "上海",
    code: "SHA",
    center: [121.4737, 31.2304],
    zoom: 9.6,
    boundary: "./assets/maps/shanghai-districts.geojson",
    origin: [121.8052, 31.1443],
    originName: "浦东机场",
    summary: "从浦东机场到陆家嘴和核心商圈，地图会展示真实城市位置与区域切换。",
    districts: [
      { name: "浦东新区", center: [121.5447, 31.2215], landmark: "陆家嘴", route: [121.4998, 31.2397] },
      { name: "黄浦区", center: [121.4903, 31.2228], landmark: "外滩", route: [121.4903, 31.2352] },
      { name: "静安区", center: [121.4482, 31.229], landmark: "静安寺", route: [121.4453, 31.2294] },
      { name: "徐汇区", center: [121.4375, 31.18], landmark: "徐家汇", route: [121.4352, 31.1923] },
      { name: "闵行区", center: [121.3817, 31.113], landmark: "虹桥枢纽", route: [121.3275, 31.2008] }
    ]
  }
];

const modeButtons = [document.querySelector("#modeBButton"), document.querySelector("#modeCButton")];
const modePanels = [document.querySelector("#modeB"), document.querySelector("#modeC")];
const toast = document.querySelector("#labToast");
let toastTimer = 0;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function switchMode(index) {
  modeButtons.forEach((button, buttonIndex) => {
    const active = buttonIndex === index;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  modePanels.forEach((panel, panelIndex) => {
    const active = panelIndex === index;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  if (index === 1) ensureMap();
}

modeButtons.forEach((button, index) => button.addEventListener("click", () => switchMode(index)));

const galleryViewport = document.querySelector("#galleryViewport");
const gallerySurface = document.querySelector("#modeB");
const galleryTrack = document.querySelector("#galleryTrack");
const galleryUi = document.querySelector("#galleryUi");
const galleryProgress = document.querySelector("#galleryProgress");
const galleryDistricts = document.querySelector("#galleryDistricts");
const cityPicker = document.querySelector("#cityPicker");
let galleryCityIndex = 0;
let galleryDistrictIndex = 0;
let galleryDrag = null;
let galleryLocked = false;

function wrapIndex(value, length) {
  return (value + length) % length;
}

function galleryLocation(cityIndex = galleryCityIndex, districtIndex = galleryDistrictIndex) {
  const city = galleryCities[cityIndex];
  return { city, district: city.districts[districtIndex] || city.districts[0] };
}

function gallerySlide(cityIndex, role) {
  const districtIndex = cityIndex === galleryCityIndex ? galleryDistrictIndex : 0;
  const { city, district } = galleryLocation(cityIndex, districtIndex);
  const slide = document.createElement("article");
  slide.className = `gallery-slide gallery-slide-${role}`;
  slide.dataset.city = city.name;
  slide.innerHTML = `<img src="${district.image}" alt="${city.name}${district.name}${district.landmark}城市服务场景" draggable="false" decoding="async" />`;
  return slide;
}

function renderGallerySlides() {
  const previous = wrapIndex(galleryCityIndex - 1, galleryCities.length);
  const next = wrapIndex(galleryCityIndex + 1, galleryCities.length);
  galleryTrack.replaceChildren(
    gallerySlide(previous, "previous"),
    gallerySlide(galleryCityIndex, "current"),
    gallerySlide(next, "next")
  );
  galleryTrack.classList.remove("animating");
  galleryTrack.style.transform = "translate3d(-33.333%, 0, 0)";
}

function renderGalleryInterface() {
  const { city, district } = galleryLocation();
  const other = galleryCities[wrapIndex(galleryCityIndex + 1, galleryCities.length)];
  document.querySelector("#galleryCityIndex").textContent = String(galleryCityIndex + 1).padStart(2, "0");
  document.querySelector("#galleryCityCode").textContent = city.code;
  document.querySelector("#galleryCityName").textContent = city.name;
  document.querySelector("#galleryDistrictName").textContent = district.name;
  document.querySelector("#galleryLandmark").textContent = district.landmark;
  document.querySelector("#galleryBook").textContent = `按${district.name}提交预约`;
  document.querySelector("#galleryPreviousCity").textContent = other.name;
  document.querySelector("#galleryCurrentCity").textContent = city.name;
  document.querySelector("#galleryNextCity").textContent = other.name;
  galleryProgress.style.transform = `translateY(${galleryCityIndex * 100}%)`;

  galleryDistricts.replaceChildren(...city.districts.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === galleryDistrictIndex ? "active" : "";
    button.textContent = item.name;
    button.addEventListener("click", () => changeGalleryDistrict(index));
    return button;
  }));
}

function preloadGalleryNearby() {
  const current = galleryCities[galleryCityIndex];
  const other = galleryCities[wrapIndex(galleryCityIndex + 1, galleryCities.length)];
  [
    current.districts[wrapIndex(galleryDistrictIndex - 1, current.districts.length)].image,
    current.districts[wrapIndex(galleryDistrictIndex + 1, current.districts.length)].image,
    other.districts[0].image
  ].forEach((source) => {
    const image = new Image();
    image.decoding = "async";
    image.src = source;
  });
}

function animateGalleryCity(step) {
  if (galleryLocked) return;
  galleryLocked = true;
  galleryUi.classList.add("copy-out");
  galleryTrack.classList.add("animating");
  galleryTrack.style.transform = step > 0 ? "translate3d(-66.666%, 0, 0)" : "translate3d(0, 0, 0)";
  window.setTimeout(() => {
    galleryCityIndex = wrapIndex(galleryCityIndex + step, galleryCities.length);
    galleryDistrictIndex = 0;
    renderGallerySlides();
    renderGalleryInterface();
    preloadGalleryNearby();
    requestAnimationFrame(() => galleryUi.classList.remove("copy-out"));
    galleryLocked = false;
  }, 470);
}

function changeGalleryDistrict(index) {
  if (index === galleryDistrictIndex || galleryLocked) return;
  galleryLocked = true;
  galleryUi.classList.add("copy-out");
  window.setTimeout(() => {
    galleryDistrictIndex = index;
    renderGallerySlides();
    renderGalleryInterface();
    preloadGalleryNearby();
    requestAnimationFrame(() => galleryUi.classList.remove("copy-out"));
    window.setTimeout(() => { galleryLocked = false; }, 180);
  }, 150);
}

gallerySurface.addEventListener("pointerdown", (event) => {
  if (galleryLocked || event.target.closest("button, a, dialog, .district-drawer")) return;
  galleryDrag = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, startTime: performance.now() };
  galleryViewport.classList.add("dragging");
  galleryTrack.classList.remove("animating");
  gallerySurface.setPointerCapture?.(event.pointerId);
});

gallerySurface.addEventListener("pointermove", (event) => {
  if (!galleryDrag || galleryDrag.id !== event.pointerId) return;
  galleryDrag.lastX = event.clientX;
  const delta = Math.max(-galleryViewport.clientWidth, Math.min(galleryViewport.clientWidth, event.clientX - galleryDrag.startX));
  const percent = -33.333 + (delta / galleryViewport.clientWidth) * 33.333;
  galleryTrack.style.transform = `translate3d(${percent}%, 0, 0)`;
});

function finishGalleryDrag(event) {
  if (!galleryDrag || galleryDrag.id !== event.pointerId) return;
  const delta = galleryDrag.lastX - galleryDrag.startX;
  const elapsed = Math.max(performance.now() - galleryDrag.startTime, 1);
  const velocity = delta / elapsed;
  galleryDrag = null;
  galleryViewport.classList.remove("dragging");
  const shouldChange = Math.abs(delta) > galleryViewport.clientWidth * 0.15 || Math.abs(velocity) > 0.55;
  if (shouldChange) animateGalleryCity(delta < 0 ? 1 : -1);
  else {
    galleryTrack.classList.add("animating");
    galleryTrack.style.transform = "translate3d(-33.333%, 0, 0)";
  }
}

gallerySurface.addEventListener("pointerup", finishGalleryDrag);
gallerySurface.addEventListener("pointercancel", finishGalleryDrag);
galleryViewport.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") animateGalleryCity(-1);
  if (event.key === "ArrowRight") animateGalleryCity(1);
  if (event.key === "ArrowUp") changeGalleryDistrict(wrapIndex(galleryDistrictIndex - 1, galleryCities[galleryCityIndex].districts.length));
  if (event.key === "ArrowDown") changeGalleryDistrict(wrapIndex(galleryDistrictIndex + 1, galleryCities[galleryCityIndex].districts.length));
});

document.querySelector("#galleryBook").addEventListener("click", () => {
  const { city, district } = galleryLocation();
  showToast(`样板选择：${city.name} · ${district.name}`);
});
document.querySelector("#openCityPicker").addEventListener("click", () => cityPicker.showModal());
document.querySelector("#closeCityPicker").addEventListener("click", () => cityPicker.close());
document.querySelectorAll("[data-gallery-city]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextIndex = Number(button.dataset.galleryCity);
    cityPicker.close();
    if (nextIndex !== galleryCityIndex) animateGalleryCity(nextIndex > galleryCityIndex ? 1 : -1);
  });
});

let map = null;
let mapReady = false;
let mapStarting = false;
let mapCityIndex = 0;
let mapDistrictIndex = 0;
let mapMarkers = [];
let mapMoveTimer = 0;
const boundaryCache = new Map();

function markMapMoving() {
  const stage = document.querySelector("#mapStage");
  stage.classList.add("is-moving");
  window.clearTimeout(mapMoveTimer);
  const finish = () => stage.classList.remove("is-moving");
  mapMoveTimer = window.setTimeout(finish, 4200);
  map?.once("idle", finish);
}

function routeGeoJson(city, district) {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [city.origin, district.route, district.center] },
    properties: {}
  };
}

async function loadBoundary(city) {
  if (!boundaryCache.has(city.boundary)) {
    boundaryCache.set(city.boundary, fetch(city.boundary).then((response) => {
      if (!response.ok) throw new Error(`Boundary HTTP ${response.status}`);
      return response.json();
    }));
  }
  return boundaryCache.get(city.boundary);
}

function renderMapInterface() {
  const city = mapCities[mapCityIndex];
  const district = city.districts[mapDistrictIndex];
  document.querySelector("#mapCityCode").textContent = city.code;
  document.querySelector("#mapCityName").textContent = city.name;
  document.querySelector("#mapDistrictName").textContent = district.name;
  document.querySelector("#mapSummary").textContent = city.summary;
  document.querySelector("#mapBook").textContent = `按${district.name}提交预约`;
  document.querySelectorAll("[data-map-city]").forEach((button, index) => button.classList.toggle("active", index === mapCityIndex));

  const list = document.querySelector("#mapDistricts");
  list.replaceChildren(...city.districts.map((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = index === mapDistrictIndex ? "active" : "";
    button.textContent = item.name;
    button.addEventListener("click", () => selectMapDistrict(index));
    return button;
  }));
}

function refreshMapMarkers() {
  mapMarkers.forEach((marker) => marker.remove());
  mapMarkers = [];
  const city = mapCities[mapCityIndex];
  const district = city.districts[mapDistrictIndex];
  [
    { point: city.origin, title: city.originName, detail: "交通接应起点" },
    { point: district.center, title: district.landmark, detail: `${district.name}服务地标` }
  ].forEach((item) => {
    const element = document.createElement("div");
    element.className = "map-marker";
    element.innerHTML = `<strong>${item.title}</strong><small>${item.detail}</small>`;
    mapMarkers.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat(item.point).addTo(map));
  });
}

function applyMapSelection(fly = true) {
  if (!mapReady) return;
  const city = mapCities[mapCityIndex];
  const district = city.districts[mapDistrictIndex];
  const filter = ["==", ["get", "name"], district.name];
  map.setFilter("district-selected-fill", filter);
  map.setFilter("district-selected-extrusion", filter);
  map.setFilter("district-selected-line", filter);
  map.getSource("service-route").setData(routeGeoJson(city, district));
  refreshMapMarkers();
  if (fly) {
    markMapMoving();
    map.flyTo({ center: district.center, zoom: 11.15, pitch: 48, bearing: mapCityIndex === 0 ? -12 : 18, duration: 1050, essential: true });
  }
}

async function selectMapCity(index) {
  if (index === mapCityIndex) return;
  mapCityIndex = index;
  mapDistrictIndex = 0;
  renderMapInterface();
  if (!mapReady) return;
  const city = mapCities[mapCityIndex];
  const boundary = await loadBoundary(city);
  map.getSource("districts").setData(boundary);
  markMapMoving();
  map.flyTo({ center: city.center, zoom: city.zoom, pitch: 42, bearing: 0, duration: 1250, essential: true });
  applyMapSelection(false);
}

function selectMapDistrict(index) {
  if (index === mapDistrictIndex) return;
  mapDistrictIndex = index;
  renderMapInterface();
  applyMapSelection(true);
}

async function ensureMap() {
  if (map) {
    window.setTimeout(() => map.resize(), 50);
    return;
  }
  if (mapStarting) return;
  mapStarting = true;
  const loading = document.querySelector("#mapLoading");
  const fallback = document.querySelector("#mapFallback");
  try {
    if (!window.maplibregl) throw new Error("MapLibre unavailable");
    const city = mapCities[mapCityIndex];
    const boundary = await loadBoundary(city);
    map = new maplibregl.Map({
      container: "realMap",
      center: city.center,
      zoom: city.zoom,
      pitch: 42,
      bearing: 0,
      attributionControl: true,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors"
          }
        },
        layers: [{
          id: "osm-base",
          type: "raster",
          source: "osm",
          paint: {
            "raster-saturation": -0.82,
            "raster-contrast": 0.32,
            "raster-brightness-min": 0.02,
            "raster-brightness-max": 0.42
          }
        }]
      }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-left");
    map.on("load", () => {
      map.addSource("districts", { type: "geojson", data: boundary });
      map.addLayer({ id: "district-fill", type: "fill", source: "districts", paint: { "fill-color": "#1d4f63", "fill-opacity": 0.08 } });
      map.addLayer({ id: "district-line", type: "line", source: "districts", paint: { "line-color": "rgba(105,210,197,.45)", "line-width": 1 } });
      map.addLayer({ id: "district-selected-fill", type: "fill", source: "districts", paint: { "fill-color": "#efbf69", "fill-opacity": 0.2 } });
      map.addLayer({ id: "district-selected-extrusion", type: "fill-extrusion", source: "districts", paint: { "fill-extrusion-color": "#d89d45", "fill-extrusion-height": 900, "fill-extrusion-base": 0, "fill-extrusion-opacity": 0.17 } });
      map.addLayer({ id: "district-selected-line", type: "line", source: "districts", paint: { "line-color": "#ffd890", "line-width": 3, "line-blur": 0.3 } });
      map.addSource("service-route", { type: "geojson", data: routeGeoJson(city, city.districts[0]) });
      map.addLayer({ id: "service-route-glow", type: "line", source: "service-route", paint: { "line-color": "#69d2c5", "line-width": 8, "line-opacity": 0.18, "line-blur": 5 } });
      map.addLayer({ id: "service-route", type: "line", source: "service-route", paint: { "line-color": "#8ff2e5", "line-width": 2.5, "line-dasharray": [2, 1.5] } });
      mapReady = true;
      applyMapSelection(false);
      loading.hidden = true;
      window.setTimeout(() => map.resize(), 50);
    });
    map.on("error", (event) => {
      if (!mapReady && event?.error) console.warn("Map loading:", event.error.message);
    });
    window.setTimeout(() => {
      if (!mapReady) {
        loading.hidden = true;
        fallback.hidden = false;
      }
    }, 9000);
  } catch (error) {
    loading.hidden = true;
    fallback.hidden = false;
    console.error(error);
  }
}

document.querySelectorAll("[data-map-city]").forEach((button, index) => button.addEventListener("click", () => selectMapCity(index)));
document.querySelector("#mapBook").addEventListener("click", () => {
  const city = mapCities[mapCityIndex];
  const district = city.districts[mapDistrictIndex];
  showToast(`样板选择：${city.name} · ${district.name}`);
});

renderGallerySlides();
renderGalleryInterface();
preloadGalleryNearby();
renderMapInterface();
