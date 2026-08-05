import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, author_id, content, created_at, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "member")) {
    return NextResponse.json(
      { error: "登录并获得批准后才能留言" },
      { status: 401 }
    );
  }
  const body = await request.json();
  const content = String(body.content ?? "").trim().slice(0, 200);
  if (!content) {
    return NextResponse.json({ error: "留言内容不能为空" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({ author_id: user.id, content })
    .select("id, author_id, content, created_at, profiles(username)")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "留言失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
  return NextResponse.json({ item: data });
}
