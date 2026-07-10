(() => {
  const pageData = {
    "/beijing.html": ["北京本地陪同、商务接待与机场高铁接送", "北京", "本地陪同服务", 500, "开放城市", "/cities.html"],
    "/shanghai.html": ["上海商务接待、城市陪同与交通枢纽衔接", "上海", "本地陪同服务", 400, "开放城市", "/cities.html"],
    "/guangzhou.html": ["广州办事协助、商务接待与琶洲展会陪同", "广州", "本地陪同服务", 350, "开放城市", "/cities.html"],
    "/shenzhen.html": ["深圳展会陪同、商务接待与城市协助", "深圳", "本地陪同服务", 600, "开放城市", "/cities.html"],
    "/chengdu.html": ["成都城市陪同、旅游向导与机场接送", "成都", "本地陪同服务", 300, "开放城市", "/cities.html"],
    "/hangzhou.html": ["杭州城市陪同、商务接待与旅游向导", "杭州", "本地陪同服务", 350, "开放城市", "/cities.html"],
    "/xian.html": ["西安旅游向导、文化路线与城市陪同", "西安", "本地陪同服务", 450, "开放城市", "/cities.html"],
    "/chongqing.html": ["重庆城市陪同与旅游向导内测预约", "重庆", "本地陪同服务内测预约", null, "开放城市", "/cities.html"],
    "/business.html": ["商务接待陪同服务", "中国首批开放城市", "商务接待", 350, "服务分类", "/services.html"],
    "/travel-guide.html": ["城市旅游向导与文化路线陪同", "中国首批开放城市", "旅游向导", 300, "服务分类", "/services.html"],
    "/airport.html": ["机场高铁接送陪同与抵达协助", "中国首批开放城市", "机场高铁接送", 300, "服务分类", "/services.html"],
    "/city-companion.html": ["城市陪同与本地路线协助", "中国开放城市", "城市陪同", 350, "服务分类", "/services.html"],
    "/errands.html": ["正规办事协助与现场流程陪同", "中国开放城市", "办事协助", 350, "服务分类", "/services.html"],
    "/expo.html": ["展会陪同、客户引导与现场协助", "中国开放城市", "展会陪同", 500, "服务分类", "/services.html"]
  };

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const origin = "https://www.dipeikehu.com";
  if (pathname === "/" || pathname === "/index.html") {
    const homeSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${origin}/#organization`,
          name: "地陪客户",
          url: `${origin}/`,
          logo: `${origin}/favicon.svg`,
          description: "正规本地陪同、商务接待、旅游向导、办事协助和机场高铁接送服务预约平台。"
        },
        {
          "@type": "WebSite",
          "@id": `${origin}/#website`,
          name: "地陪客户",
          url: `${origin}/`,
          inLanguage: "zh-CN",
          publisher: { "@id": `${origin}/#organization` }
        }
      ]
    };
    appendSchema(homeSchema);
    return;
  }
  const item = pageData[pathname];
  if (!item) return;

  const [name, area, serviceType, minPrice, parentName, parentPath] = item;
  const service = {
    "@type": "Service",
    name,
    serviceType,
    areaServed: area,
    url: `${origin}${pathname}`,
    provider: {
      "@type": "Organization",
      name: "地陪客户",
      url: `${origin}/`
    }
  };
  if (minPrice) {
    service.offers = {
      "@type": "Offer",
      priceCurrency: "CNY",
      price: minPrice,
      description: "参考起步价格，最终根据日期、时长、区域和具体需求由客服确认。"
    };
  }
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      service,
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首页", item: `${origin}/` },
          { "@type": "ListItem", position: 2, name: parentName, item: `${origin}${parentPath}` },
          { "@type": "ListItem", position: 3, name, item: `${origin}${pathname}` }
        ]
      }
    ]
  };

  appendSchema(schema);

  function appendSchema(value) {
    const node = document.createElement("script");
    node.type = "application/ld+json";
    node.textContent = JSON.stringify(value);
    document.head.append(node);
  }
})();
