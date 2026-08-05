# 旅行手账网站

一个手账风格的旅行日记社区：世界地图足迹 + 图文游记 + 点赞评论 + 注册发帖（管理员批准）。

## 技术栈

- Next.js（React 全栈框架）
- Supabase（账号、数据库、图片存储，免费额度）
- ECharts（世界足迹地图，地图数据打包在本地，不依赖外部瓦片）

## 本地开发

```bash
pnpm install
pnpm dev
```

需要先配置 `.env.local`（参考 `.env.example`），并在 Supabase 中执行 `supabase/schema.sql`。

## 部署

参考上线指南，部署到 Vercel 免费版即可。
