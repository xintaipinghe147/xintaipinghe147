import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";
import { POST_TAGS } from "@/lib/constants";

export async function POST(request: Request) {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json({ error: "登录并获批后才能发布日记" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim().slice(0, 80);
  const location_name = String(body.location_name ?? "").trim().slice(0, 40);
  const content = String(body.content ?? "").trim().slice(0, 20000);
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

  if (!content) {
    return NextResponse.json({ error: "日记正文不能为空" }, { status: 400 });
  }
  if (
    (lat === null) !== (lng === null) ||
    (lat !== null && !Number.isFinite(lat)) ||
    (lng !== null && !Number.isFinite(lng))
  ) {
    return NextResponse.json({ error: "经纬度需要一起填写" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      title,
      location_name,
      lat,
      lng,
      content,
      image_urls,
      video_url,
      tags,
      occurred_at,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "发布失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
  return NextResponse.json({ id: data.id });
}
