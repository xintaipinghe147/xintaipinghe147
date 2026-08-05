import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", id)
    .maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "游记不存在" }, { status: 404 });
  }
  if (post.author_id !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "没有权限删除" }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    return NextResponse.json(
      { error: "删除失败：" + error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("author_id")
    .eq("id", id)
    .maybeSingle();
  if (!post) {
    return NextResponse.json({ error: "游记不存在" }, { status: 404 });
  }
  if (post.author_id !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "没有权限编辑" }, { status: 403 });
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

  const { data, error } = await supabase
    .from("posts")
    .update({
      title,
      location_name,
      lat,
      lng,
      content,
      image_urls,
      video_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "保存失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
  return NextResponse.json({ id: data.id });
}
