import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";
import { insertPost } from "@/lib/data";
import { POST_TAGS, SITE } from "@/lib/constants";

const ALLOWED_CATEGORIES = [
  ...SITE.categories,
  SITE.defaultCategory,
] as string[];

function cleanCategory(value: unknown, tags: string[]): string {
  const raw = String(value ?? "").trim();
  if (ALLOWED_CATEGORIES.includes(raw)) return raw;
  if (tags.length > 0 && ALLOWED_CATEGORIES.includes(tags[0])) return tags[0];
  return SITE.defaultCategory;
}

export async function POST(request: Request) {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json(
      { error: "登录并获批准后才能发布文章" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim().slice(0, 80);
  const content = String(body.content ?? "").trim().slice(0, 40000);
  const summary = String(body.summary ?? "").trim().slice(0, 240);
  const location_name = String(body.location_name ?? "").trim().slice(0, 40);
  const lat = body.lat === null || body.lat === undefined || body.lat === ""
    ? null
    : Number(body.lat);
  const lng = body.lng === null || body.lng === undefined || body.lng === ""
    ? null
    : Number(body.lng);
  const occurred_at =
    typeof body.occurred_at === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.occurred_at)
      ? body.occurred_at
      : null;
  const video_url =
    typeof body.video_url === "string" && body.video_url.trim()
      ? body.video_url.trim().slice(0, 300)
      : null;
  const image_urls = Array.isArray(body.image_urls)
    ? body.image_urls
        .filter((u: unknown) => typeof u === "string")
        .slice(0, 9)
        .map((u: string) => u.slice(0, 500))
    : [];
  const tags = Array.isArray(body.tags)
    ? body.tags
        .filter(
          (t: unknown) =>
            typeof t === "string" &&
            (POST_TAGS as readonly string[]).includes(t.trim())
        )
        .slice(0, 6)
        .map((t: string) => t.trim())
    : [];
  const category = cleanCategory(body.category, tags);

  if (!title || !content) {
    return NextResponse.json(
      { error: "标题和正文都不能为空" },
      { status: 400 }
    );
  }

  const result = await insertPost({
    author_id: user.id,
    title,
    summary: summary || null,
    category,
    location_name,
    lat,
    lng,
    content,
    image_urls,
    video_url,
    tags,
    occurred_at,
  });

  if (result.error || !result.id) {
    return NextResponse.json(
      { error: `发布失败：${result.error?.message ?? "未知错误"}` },
      { status: 500 }
    );
  }
  return NextResponse.json({ id: result.id });
}
