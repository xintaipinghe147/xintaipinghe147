import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { username, bio, avatar_url } = await request.json();
  const cleanUsername = String(username ?? "").trim().slice(0, 20);
  const cleanBio = String(bio ?? "").trim().slice(0, 200);
  const cleanAvatar =
    typeof avatar_url === "string" && avatar_url.trim()
      ? avatar_url.trim().slice(0, 500)
      : null;

  if (!cleanUsername) {
    return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .neq("id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "这个昵称已经被使用了" }, { status: 400 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username: cleanUsername, bio: cleanBio, avatar_url: cleanAvatar })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "保存失败：" + error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
