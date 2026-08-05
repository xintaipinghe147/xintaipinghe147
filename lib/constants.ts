// 站点基础配置：改这里就能改全站名称、简介、友链等

export const SITE = {
  name: "拾光小札",
  shortName: "拾光",
  tagline: "记录生活、读书与碎念的小地方",
  description:
    "一个温柔的个人生活博客，写随笔、读书笔记、碎碎念，也收藏照片与时光。",
  author: "小拾",
  since: 2026,
  // 文章默认分类与可选分类
  categories: ["生活", "读书", "碎念"],
  defaultCategory: "随笔",
  // 相册、归档、RSS 等地址
  feedUrl: "/feed.xml",
} as const;

// 发文时可选的标签（自由组合，最多 6 个）
export const POST_TAGS = [
  "生活",
  "读书",
  "碎念",
  "随笔",
  "书摘",
  "观影",
  "散步",
  "四季",
  "食物",
  "朋友",
  "独处",
] as const;

// 友链：想交换友链的朋友博客，在这里增删
export const FRIENDS = [
  {
    name: "友达手账",
    desc: "朋友们的共同手账，一起写小日子。",
    url: "https://xintaipinghe147.vercel.app",
  },
  {
    name: "林间小径",
    desc: "记录山野与读书的博客。",
    url: "https://example.com",
  },
  {
    name: "纸船日记",
    desc: "折一只纸船，漂到对岸去。",
    url: "https://example.com",
  },
] as const;

// 关于我页面的内容
export const ABOUT = {
  avatar: "/logo.png",
  name: "小拾",
  intro:
    "喜欢散步、读书、拍照，偶尔写一点字。这里是我存放生活的地方：随笔、读书笔记、碎碎念，还有散落的照片。",
  hobbies: ["散步", "读书", "拍照", "逛书店", "喝茶", "发呆"],
  quote: "日子是一点一点攒起来的。",
} as const;

// 页面主题：light / dark / system
export type ThemeMode = "light" | "dark" | "system";
export const THEME_KEY = "blog-theme";
