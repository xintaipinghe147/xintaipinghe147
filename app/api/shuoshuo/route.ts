import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shuoshuo")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    return NextResponse.json({ items: [] });
  }
  return NextResponse.json({
    items: (data ?? []).map((row) => ({
      id: row.id,
      author_id: row.author_id,
      content: row.content,
      created_at: row.created_at,
      author_username: row.profiles?.username ?? "博主",
    })),
  });
}

export async function POST(request: Request) {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json(
      { error: "登录并获批准后才能碎碎念" },
      { status: 401 }
    );
  }
  const body = await request.json();
  const content = String(body.content ?? "").trim().slice(0, 200);
  if (!content) {
    return NextResponse.json({ error: "写点什么再发布" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shuoshuo")
    .insert({ author_id: user.id, content })
    .select("id, author_id, content, created_at")
    .single();
  if (error || !data) {
    return NextResponse.json(
      { error: `发布失败：${error?.message ?? "未知错误"}` },
      { status: 500 }
    );
  }
  return NextResponse.json({
    item: { ...data, author_username: user.username },
  });
}
