export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  // 统一按中国时区显示，保证服务端与浏览器渲染一致
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

export function excerpt(text: string, max = 90): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
