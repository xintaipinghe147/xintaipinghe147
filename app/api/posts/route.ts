import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json({ error: "登录并获批后才能发布游记" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim().slice(0, 80);
  const location_name = String(body.location_name ?? "").trim().slice(0, 40);
  const content = String(body.content ?? "").trim().slice(0, 20000);
  const lat = Number(body.lat);
  const lng = Number(body.lng);
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

  if (!title || !location_name || !content) {
    return NextResponse.json({ error: "标题、地点和正文不能为空" }, { status: 400 });
  }
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "请填写有效的坐标" }, { status: 400 });
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
