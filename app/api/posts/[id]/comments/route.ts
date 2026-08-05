import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json({ error: "登录后才能留言" }, { status: 401 });
  }
  const { id } = await params;
  const { content } = await request.json();
  const clean = String(content ?? "").trim().slice(0, 1000);
  if (!clean) {
    return NextResponse.json({ error: "留言不能为空" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: id, author_id: user.id, content: clean })
    .select("*, profiles(username)")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "留言失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
  return NextResponse.json({
    comment: {
      id: data.id,
      post_id: data.post_id,
      author_id: data.author_id,
      content: data.content,
      created_at: data.created_at,
      author_username: data.profiles?.username ?? "旅人",
    },
  });
}
