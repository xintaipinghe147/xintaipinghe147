"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MarkdownView from "@/components/MarkdownView";
import type { Post } from "@/lib/types";
import { POST_TAGS, SITE } from "@/lib/constants";

type Props = {
  userId: string;
  post?: Post | null;
};

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

const CATEGORY_OPTIONS = [...SITE.categories, SITE.defaultCategory];

export default function PostForm({ userId, post }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? SITE.defaultCategory);
  const [summary, setSummary] = useState(post?.summary ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [images, setImages] = useState<{ url: string; name: string }[]>(
    post?.image_urls.map((u) => ({ url: u, name: u.split("/").pop() ?? u })) ?? []
  );
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [occurredAt, setOccurredAt] = useState(post?.occurred_at ?? todayStr());
  const [videoUrl, setVideoUrl] = useState(post?.video_url ?? "");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 旧文章可能带坐标，编辑时原样保留，不发新坐标
  const lat = post?.lat ?? null;
  const lng = post?.lng ?? null;
  const location_name = post?.location_name ?? "";

  async function uploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError("");
    const allowed = files.length + images.length;
    if (allowed > 9) {
      setError("一次最多上传 9 张图片");
      return;
    }
    const uploaded: { url: string; name: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError("只能上传图片文件");
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("单张图片请控制在 10MB 以内");
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data, error: uploadError } = await supabase.storage
        .from("images")
        .upload(path, file, { upsert: false });
      if (uploadError || !data) {
        setError(`图片上传失败：${uploadError?.message ?? "未知错误"}`);
        continue;
      }
      const { data: pub } = supabase.storage
        .from("images")
        .getPublicUrl(data.path);
      uploaded.push({ url: pub.publicUrl, name: file.name });
    }
    setImages((prev) => [...prev, ...uploaded]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((i) => i.url !== url));
  }

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("请写下标题");
      return;
    }
    if (!content.trim()) {
      setError("请写下正文");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
        method: post ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          summary: summary.trim() || null,
          content: content.trim(),
          image_urls: images.map((i) => i.url),
          tags,
          occurred_at: occurredAt || null,
          video_url: videoUrl.trim() || null,
          lat,
          lng,
          location_name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.id) {
        setError(data?.error ?? "发布失败，请稍后再试");
        return;
      }
      router.push(`/posts/${data.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <div className="note-card relative p-6 sm:p-8">
        <div className="tape" aria-hidden />
        <h1 className="font-display mb-5 text-2xl text-ink">
          {post ? "编辑文章" : "写一篇文章"}
        </h1>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-bold text-ink">
              标题
            </label>
            <input
              id="title"
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="给这篇文章起个名字"
              maxLength={80}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="mb-1.5 block text-sm font-bold text-ink">
                日期
              </label>
              <input
                id="date"
                className="field"
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                max={todayStr()}
              />
              <p className="mt-1 text-xs text-ink-soft">
                默认今天，可以改成想记录的那一天。
              </p>
            </div>
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-bold text-ink">
                分类
              </label>
              <select
                id="category"
                className="field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="summary" className="mb-1.5 block text-sm font-bold text-ink">
              摘要
            </label>
            <textarea
              id="summary"
              className="field resize-y"
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="不填的话会自动从正文开头提取"
              maxLength={240}
            />
          </div>
        </div>
      </div>

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">正文</h2>
          <button
            type="button"
            onClick={() => setPreview((v) => !v)}
            className="btn-ghost px-4 py-1.5 text-sm"
          >
            {preview ? "返回编辑" : "预览"}
          </button>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-ink-soft">
          支持 Markdown 排版：用 # 写标题，**加粗**，*斜体*，&gt; 引用，- 列表，
          ![图片说明](图片链接) 插入网络图片，适合写读书笔记和随笔。
        </p>
        {preview ? (
          <div className="note-card p-6">
            <MarkdownView content={content} />
          </div>
        ) : (
          <textarea
            className="field min-h-[320px] resize-y font-[inherit] leading-[1.9]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"# 小标题\n\n写正文内容，支持 Markdown。\n\n- 可以写列表\n- 可以引用\n\n> 也可以写引用"}
            maxLength={40000}
          />
        )}
      </div>

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <h2 className="mb-1 text-lg font-bold">标签（最多 6 个）</h2>
        <p className="mb-3 text-xs text-ink-soft">
          给文章贴上主题，方便按标签筛选。
        </p>
        <div className="flex flex-wrap gap-2">
          {POST_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                disabled={!active && tags.length >= 6}
                className={`chip ${active ? "chip-active" : ""} disabled:opacity-40`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <h2 className="mb-4 text-lg font-bold">插图（可选）</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => uploadImages(e.target.files)}
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:text-accent-ink"
        />
        <p className="mt-2 text-xs text-ink-soft">
          第一张会成为封面。单张不超过 10MB，一次最多 9 张。
        </p>
        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((img) => (
              <div key={img.url} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-20 w-full rounded-xl border border-line object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.url)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-ink shadow"
                  aria-label="移除图片"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <h2 className="mb-4 text-lg font-bold">视频（可选）</h2>
        <input
          className="field"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="粘贴 B 站或 YouTube 视频链接"
        />
      </div>

      {error ? (
        <p className="rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "保存中..." : post ? "保存修改" : "发布文章"}
        </button>
        <button
          type="button"
          onClick={() => router.push(post ? `/posts/${post.id}` : "/")}
          className="btn-ghost"
        >
          取消
        </button>
      </div>
    </form>
  );
}
