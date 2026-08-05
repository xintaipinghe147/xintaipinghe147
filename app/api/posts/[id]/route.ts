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
