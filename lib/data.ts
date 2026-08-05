import { createClient } from "@/lib/supabase/server";
import type { Comment, Post } from "@/lib/types";

type PostRow = {
  id: string;
  author_id: string;
  title: string;
  location_name: string;
  lat: number;
  lng: number;
  content: string;
  image_urls: string[];
  video_url: string | null;
  status: "published" | "pending";
  tags: string[];
  created_at: string;
  updated_at: string;
  profiles: { username: string } | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

function normalizePost(row: PostRow): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    location_name: row.location_name,
    lat: row.lat,
    lng: row.lng,
    content: row.content,
    image_urls: row.image_urls ?? [],
    video_url: row.video_url,
    status: row.status,
    tags: row.tags ?? [],
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_username: row.profiles?.username ?? "旅人",
    like_count: row.likes?.[0]?.count ?? 0,
    comment_count: row.comments?.[0]?.count ?? 0,
  };
}

export async function getPublishedPosts(limit = 100): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(username), likes(count), comments(count)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPublishedPosts", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizePost(row as PostRow));
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(username), likes(count), comments(count)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return normalizePost(data as PostRow);
}

export async function getPostsByAuthor(
  authorId: string,
  includePending = false
): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select("*, profiles(username), likes(count), comments(count)")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!includePending) query = query.eq("status", "published");

  const { data, error } = await query;
  if (error) {
    console.error("getPostsByAuthor", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizePost(row as PostRow));
}

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: { username: string } | null;
};

function normalizeComment(row: CommentRow): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    content: row.content,
    created_at: row.created_at,
    author_username: row.profiles?.username ?? "旅人",
  };
}

export async function getComments(postId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) {
    console.error("getComments", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeComment(row as CommentRow));
}

export async function getRecentComments(limit = 100): Promise<Comment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentComments", error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeComment(row as CommentRow));
}

export async function getPendingProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "pending")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("getPendingProfiles", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAllProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.error("getAllProfiles", error.message);
    return [];
  }
  return data ?? [];
}

export async function isPostLiked(
  postId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("likes")
    .select("user_id")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}
