"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function approveUser(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role: "member" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function revokeUser(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === admin.id) return;
  const supabase = await createClient();
  await supabase.from("profiles").update({ role: "pending" }).eq("id", userId);
  revalidatePath("/admin");
}

export async function deletePost(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const postId = String(formData.get("postId") ?? "");
  if (!postId) return;
  const supabase = await createClient();
  await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/admin");
}

export async function deleteComment(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) return;
  const commentId = String(formData.get("commentId") ?? "");
  if (!commentId) return;
  const supabase = await createClient();
  await supabase.from("comments").delete().eq("id", commentId);
  revalidatePath("/admin");
}
