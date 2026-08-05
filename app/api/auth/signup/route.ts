import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, password, username } = await request.json();
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof username !== "string"
  ) {
    return NextResponse.json({ error: "请填写完整信息" }, { status: 400 });
  }
  const cleanUsername = username.trim().slice(0, 20);
  if (!cleanUsername) {
    return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const supabase = await createClient();

  // 先检查昵称是否已被占用
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", cleanUsername)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "这个昵称已经被使用了" }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { username: cleanUsername } },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({
    ok: true,
    needConfirm: !data.session,
  });
}
