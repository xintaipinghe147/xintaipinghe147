import { createClient } from "@/lib/supabase/server";
import type { Comment, Post, Shuoshuo } from "@/lib/types";
import { postCategory, postDate, postSummary } from "@/lib/utils";

type PostRow = {
  id: string;
  author_id: string;
  title: string;
  location_name: string;
  lat: number | null;
  lng: number | null;
  content: string;
  summary: string | null;
  category: string | null;
  image_urls: string[];
  video_url: string | null;
  status: "published" | "pending";
  tags: string[];
  occurred_at: string | null;
  created_at: string;
  updated_at: string;
  views: number | null;
  profiles: { username: string } | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

function normalizePost(row: PostRow): Post {
  const post: Post = {
    id: row.id,
    author_id: row.author_id,
    title: row.title,
    location_name: row.location_name,
    lat: row.lat,
    lng: row.lng,
    content: row.content,
    summary: row.summary ?? null,
    category: row.category ?? null,
    image_urls: row.image_urls ?? [],
    video_url: row.video_url,
    status: row.status,
    tags: row.tags ?? [],
    occurred_at: row.occurred_at ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author_username: row.profiles?.username ?? "博主",
    like_count: row.likes?.[0]?.count ?? 0,
    comment_count: row.comments?.[0]?.count ?? 0,
    // 阅读数：有 views 字段用 views，没有则用喜欢数兜底
    views: row.views ?? row.likes?.[0]?.count ?? 0,
  };
  // 让摘要、分类在读取时就计算好
  post.summary = postSummary(post, 120);
  post.category = postCategory(post);
  return post;
}

const POST_SELECT = "*, profiles(username), likes(count), comments(count)";

async function queryPublished(
  orderColumn: string,
  limit: number
): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .order(orderColumn, { ascending: false })
    .limit(limit);

  if (!error && data) {
    return (data ?? []).map((row) => normalizePost(row as PostRow));
  }

  const { data: plain, error: plainError } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order(orderColumn, { ascending: false })
    .limit(limit);
  if (plainError) {
    console.error("queryPublished", plainError.message);
    return [];
  }
  return (plain ?? []).map((row) =>
    normalizePost({ ...(row as PostRow), profiles: null, likes: [], comments: [] })
  );
}

// 博客文章列表：按发布日期倒序
export async function getBlogPosts(limit = 200): Promise<Post[]> {
  return queryPublished("occurred_at", limit);
}

// 兼容旧调用：按创建时间倒序
export async function getPublishedPosts(limit = 100): Promise<Post[]> {
  return queryPublished("created_at", limit);
}

export async function getPost(id: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (!error && data) {
    return normalizePost(data as PostRow);
  }

  const { data: plain, error: plainError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (plainError || !plain) return null;
  return normalizePost({
    ...(plain as PostRow),
    profiles: null,
    likes: [],
    comments: [],
  });
}

export async function getPostsByAuthor(
  authorId: string,
  includePending = false
): Promise<Post[]> {
  const supabase = await createClient();
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!includePending) query = query.eq("status", "published");

  const { data, error } = await query;
  if (!error && data) {
    return (data ?? []).map((row) => normalizePost(row as PostRow));
  }

  const plainQuery = supabase
    .from("posts")
    .select("*")
    .eq("author_id", authorId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (!includePending) plainQuery.eq("status", "published");

  const { data: plain, error: plainError } = await plainQuery;
  if (plainError) {
    console.error("getPostsByAuthor", plainError.message);
    return [];
  }
  return (plain ?? []).map((row) =>
    normalizePost({ ...(row as PostRow), profiles: null, likes: [], comments: [] })
  );
}

// 上一篇 / 下一篇：按发布日期排序的相邻文章
export async function getPrevNext(
  post: Post
): Promise<{ prev: Post | null; next: Post | null }> {
  const posts = await getBlogPosts(500);
  const date = postDate(post);
  const sorted = posts.slice().sort((a, b) => {
    return new Date(postDate(b)).getTime() - new Date(postDate(a)).getTime();
  });
  const idx = sorted.findIndex((p) => p.id === post.id);
  if (idx < 0) return { prev: null, next: null };
  return { prev: sorted[idx - 1] ?? null, next: sorted[idx + 1] ?? null };
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
    author_username: row.profiles?.username ?? "访客",
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

  if (!error && data) {
    return (data ?? []).map((row) => normalizeComment(row as CommentRow));
  }

  const { data: plain, error: plainError } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (plainError) {
    console.error("getComments", plainError.message);
    return [];
  }
  return (plain ?? []).map((row) =>
    normalizeComment({ ...(row as CommentRow), profiles: null })
  );
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

// 碎碎念：短动态流
export async function getShuoshuo(limit = 100): Promise<Shuoshuo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shuoshuo")
    .select("*, profiles(username)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getShuoshuo", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({
    id: row.id as string,
    author_id: row.author_id as string,
    content: row.content as string,
    created_at: row.created_at as string,
    author_username: (row.profiles as { username: string } | null)?.username ?? "博主",
  }));
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

// 新建/更新文章：优先带 summary/category 等新字段，
// 若数据库还没跑升级脚本（字段不存在），自动去掉新字段重试。
export async function insertPost(row: Record<string, unknown>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert(row)
    .select("id")
    .single();
  if (!error || !data) {
    return { id: (data?.id as string | undefined) ?? null, error };
  }
  const fallback = { ...row };
  delete fallback.summary;
  delete fallback.category;
  delete fallback.views;
  const retry = await supabase
    .from("posts")
    .insert(fallback)
    .select("id")
    .single();
  return { id: (retry.data?.id as string | undefined) ?? null, error: retry.error };
}

export async function updatePost(id: string, row: Record<string, unknown>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .update(row)
    .eq("id", id)
    .select("id")
    .single();
  if (!error || !data) {
    return { id: (data?.id as string | undefined) ?? null, error };
  }
  const fallback = { ...row };
  delete fallback.summary;
  delete fallback.category;
  delete fallback.views;
  const retry = await supabase
    .from("posts")
    .update(fallback)
    .eq("id", id)
    .select("id")
    .single();
  return { id: (retry.data?.id as string | undefined) ?? null, error: retry.error };
}

// 阅读数 +1（views 字段不存在时返回 null，前端保持原值）
export async function bumpViews(postId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("views")
    .eq("id", postId)
    .maybeSingle();
  if (!data) return null; // 没有 views 字段时静默失败
  const current = Number((data as { views?: number }).views ?? 0);
  await supabase
    .from("posts")
    .update({ views: current + 1 })
    .eq("id", postId);
  return current + 1;
}
