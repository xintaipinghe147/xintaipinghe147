import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const supabase = await createClient();
  let query = supabase
    .from("checkins")
    .select("id, user_id, date, note, created_at, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    query = query.eq("date", date);
  }
  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "member")) {
    return NextResponse.json(
      { error: "登录并获得批准后才能打卡" },
      { status: 401 }
    );
  }
  const body = await request.json();
  const note = String(body.note ?? "").trim().slice(0, 80);
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checkins")
    .upsert(
      { user_id: user.id, date: dateStr, note },
      { onConflict: "user_id,date" }
    )
    .select("id, user_id, date, note, created_at, profiles(username)")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "打卡失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
  return NextResponse.json({ item: data });
}
