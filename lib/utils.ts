import type { MarkdownHeading, Post } from "@/lib/types";
import { SITE } from "@/lib/constants";

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}年${shifted.getUTCMonth() + 1}月${shifted.getUTCDate()}日`;
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}.${String(shifted.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}.${String(shifted.getUTCDate()).padStart(2, "0")}`;
}

export function formatYearMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 7);
  const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  return `${shifted.getUTCFullYear()}年${shifted.getUTCMonth() + 1}月`;
}

export function postDate(post: {
  occurred_at: string | null;
  created_at: string;
}): string {
  return post.occurred_at ?? post.created_at;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const shifted = new Date(d.getTime() + 8 * 60 * 60 * 1000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${formatDate(iso)} ${hh}:${mm}`;
}

// 去掉 Markdown 标记，得到纯文本（用于摘要与搜索）
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(text: string, max = 90): string {
  const clean = stripMarkdown(text);
  return clean.length > max ? `${clean.slice(0, max)}...` : clean;
}

// 文章摘要：优先用填写的摘要，否则从正文提取
export function postSummary(post: Post, max = 120): string {
  if (post.summary && post.summary.trim()) return post.summary.trim();
  return excerpt(post.content, max);
}

// 文章分类：优先用填写的分类，否则用第一个标签，再否则默认
export function postCategory(post: Post): string {
  if (post.category && post.category.trim()) return post.category.trim();
  if (post.tags && post.tags.length > 0) return post.tags[0];
  return SITE.defaultCategory;
}

// 阅读时长估算：按每分钟 400 字
export function readingMinutes(content: string): number {
  const chars = stripMarkdown(content).length;
  return Math.max(1, Math.round(chars / 400));
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

// 从 Markdown 提取标题，生成目录
export function extractHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = [];
  const lines = markdown.split("\n");
  const seen = new Map<string, number>();
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].trim();
    if (!text) continue;
    const base = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\u4e00-\u9fa5a-zA-Z0-9]+/gu, "-")
      .replace(/^-+|-+$/g, "");
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;
    headings.push({ id, level, text });
  }
  return headings;
}

export type VideoInfo =
  | { type: "bilibili"; embedUrl: string }
  | { type: "youtube"; embedUrl: string }
  | { type: "link"; url: string };

export function parseVideoUrl(url: string): VideoInfo {
  const trimmed = url.trim();

  const biliMatch = trimmed.match(
    /(?:bilibili\.com\/video\/|b23\.tv\/)([A-Za-z0-9]+)/
  );
  if (biliMatch && /^BV/i.test(biliMatch[1])) {
    return {
      type: "bilibili",
      embedUrl: `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&page=1&high_quality=1&danmaku=0`,
    };
  }

  const ytWatch = trimmed.match(/youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/);
  const ytShort = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  const ytId = ytWatch?.[1] ?? ytShort?.[1];
  if (ytId) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}`,
    };
  }

  return { type: "link", url: trimmed };
}
