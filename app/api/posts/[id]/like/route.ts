import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireMember } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json({ error: "登录后才能点赞" }, { status: 401 });
  }
  const { id } = await params;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("likes")
    .select("user_id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("likes")
      .delete()
      .eq("post_id", id)
      .eq("user_id", user.id);
  } else {
    await supabase.from("likes").insert({ post_id: id, user_id: user.id });
  }

  const { count } = await supabase
    .from("likes")
    .select("user_id", { count: "exact", head: true })
    .eq("post_id", id);

  return NextResponse.json({ liked: !existing, count: count ?? 0 });
}
