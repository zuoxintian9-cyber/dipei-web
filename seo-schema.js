(() => {
  const pageData = {
    "/beijing.html": ["北京本地陪同、商务接待与机场高铁接送", "北京", "本地陪同服务", 500, "开放城市", "/cities.html"],
    "/shanghai.html": ["上海商务接待、城市陪同与交通枢纽衔接", "上海", "本地陪同服务", 400, "开放城市", "/cities.html"],
    "/guangzhou.html": ["广州办事协助、商务接待与琶洲展会陪同", "广州", "本地陪同服务", 350, "开放城市", "/cities.html"],
    "/shenzhen.html": ["深圳展会陪同、商务接待与城市协助", "深圳", "本地陪同服务", 600, "开放城市", "/cities.html"],
    "/business.html": ["商务接待陪同服务", "中国首批开放城市", "商务接待", 350, "服务分类", "/services.html"],
    "/travel-guide.html": ["城市旅游向导与文化路线陪同", "中国首批开放城市", "旅游向导", 300, "服务分类", "/services.html"],
    "/airport.html": ["机场高铁接送陪同与抵达协助", "中国首批开放城市", "机场高铁接送", 300, "服务分类", "/services.html"]
  };

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  const item = pageData[pathname];
  if (!item) return;

  const [name, area, serviceType, minPrice, parentName, parentPath] = item;
  const origin = "https://www.dipeikehu.com";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name,
        serviceType,
        areaServed: area,
        url: `${origin}${pathname}`,
        provider: {
          "@type": "Organization",
          name: "地陪客户",
          url: `${origin}/`
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "CNY",
          price: minPrice,
          description: "参考起步价格，最终根据日期、时长、区域和具体需求由客服确认。"
        }
      },
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

  const node = document.createElement("script");
  node.type = "application/ld+json";
  node.textContent = JSON.stringify(schema);
  document.head.append(node);
})();
