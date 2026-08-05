import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/types";

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email,
    username: profile?.username ?? user.email.split("@")[0] ?? "旅人",
    role: profile?.role ?? "pending",
    created_at: profile?.created_at ?? new Date().toISOString(),
  };
});

export async function requireUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

export async function requireMember(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || (user.role !== "admin" && user.role !== "member")) return null;
  return user;
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
