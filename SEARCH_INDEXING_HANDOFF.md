# 搜索平台最终交接

更新日期：2026-07-11

站点技术文件、站点地图和 IndexNow 已由项目自动维护。下面两项必须由站长本人登录对应平台后生成专属验证令牌，项目无法代替账号所有者预先生成。

## Google Search Console

1. 登录 Search Console，新增网域资源 `dipeikehu.com`。
2. 复制 Google 提供的 DNS TXT 验证记录。
3. 在域名服务商的 DNS 管理中新增该 TXT 记录，回到 Search Console 点击验证。
4. 验证成功后提交 `https://www.dipeikehu.com/sitemap.xml`。

## 百度搜索资源平台

1. 登录百度搜索资源平台，添加站点 `https://www.dipeikehu.com`。
2. 选择文件验证或 HTML 标签验证，复制平台生成的专属文件/标签。
3. 将专属内容交给项目维护者部署，或按平台说明放入站点根目录。
4. 验证成功后提交 `https://www.dipeikehu.com/sitemap.xml`，并启用普通收录。

## 已自动完成

- `robots.txt` 声明站点地图并屏蔽 `/api/`。
- `sitemap.xml` 包含 31 个可公开收录 URL，不含动态服务能力详情。
- IndexNow 密钥文件和批量提交脚本已配置。
- 首页及 14 个城市/服务落地页具备规范链接、描述和结构化数据。
