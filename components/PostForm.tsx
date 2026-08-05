"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AmapPicker from "@/components/AmapPicker";
import type { Post } from "@/lib/types";

type Props = {
  userId: string;
  post?: Post | null;
};

export default function PostForm({ userId, post }: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState(post?.title ?? "");
  const [locationName, setLocationName] = useState(post?.location_name ?? "");
  const [lat, setLat] = useState<number | null>(post?.lat ?? null);
  const [lng, setLng] = useState<number | null>(post?.lng ?? null);
  const [content, setContent] = useState(post?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(post?.video_url ?? "");
  const [images, setImages] = useState<{ url: string; name: string }[]>(
    post?.image_urls.map((u) => ({ url: u, name: u.split("/").pop() ?? u })) ?? []
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        setError("图片上传失败：" + (uploadError?.message ?? "未知错误"));
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

  function pickLocation(lngPick: number, latPick: number) {
    setLng(Number(lngPick.toFixed(5)));
    setLat(Number(latPick.toFixed(5)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!title.trim() || !locationName.trim() || !content.trim()) {
      setError("请填写标题、地点名称和正文");
      return;
    }
    if (lat === null || lng === null) {
      setError("请在地图上点选足迹位置，或手动填写坐标");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
        method: post ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          location_name: locationName.trim(),
          lat,
          lng,
          content: content.trim(),
          video_url: videoUrl.trim() || null,
          image_urls: images.map((i) => i.url),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "发布失败，请稍后再试");
        return;
      }
      router.push(`/posts/${data.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="note-card relative p-6 sm:p-8">
        <div className="tape" aria-hidden />
        <h1 className="mb-5 text-2xl font-bold">
          {post ? "✎ 编辑这篇游记" : "✎ 写一篇游记"}
        </h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink-soft">标题</label>
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="比如：在洱海边发呆的三天"
              maxLength={80}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-ink-soft">
                地点名称
              </label>
              <input
                className="field"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="比如：大理 · 洱海"
                maxLength={40}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-ink-soft">纬度</label>
                <input
                  className="field"
                  type="number"
                  step="0.00001"
                  value={lat ?? ""}
                  onChange={(e) =>
                    setLat(e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder="25.59"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-ink-soft">经度</label>
                <input
                  className="field"
                  type="number"
                  step="0.00001"
                  value={lng ?? ""}
                  onChange={(e) =>
                    setLng(e.target.value === "" ? null : Number(e.target.value))
                  }
                  placeholder="100.25"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-ink-soft">
              在地图上点选足迹位置
            </label>
            <AmapPicker
              onPick={pickLocation}
              height={300}
              center={post ? [post.lng, post.lat] : null}
            />
            {lat !== null && lng !== null ? (
              <p className="mt-2 text-sm text-accent">
                已选坐标：{lat} , {lng}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                点击地图任意位置即可自动填入坐标
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <h2 className="mb-4 text-lg font-bold">正文</h2>
        <textarea
          className="field min-h-[220px] resize-y leading-[2]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={"写下旅途中的故事…\n\n可以分段，按下回车换行。尽量用文字讲出画面。"}
          maxLength={20000}
        />
      </div>

      <div className="note-card relative p-6 sm:p-8">
        <div className="pin" aria-hidden />
        <h2 className="mb-4 text-lg font-bold">照片（可选）</h2>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => uploadImages(e.target.files)}
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:text-white"
        />
        <p className="mt-2 text-xs text-ink-soft">
          单张不超过 10MB，一次最多 9 张，会占用网站的免费存储空间，建议选最精彩的。
        </p>
        {images.length > 0 ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {images.map((img) => (
              <div key={img.url} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="h-20 w-full rounded-lg border border-[rgba(150,128,92,0.35)] object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(img.url)}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-white shadow"
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
          placeholder="粘贴 B站 或 YouTube 视频链接，例如 https://www.bilibili.com/video/BVxxxxxxxx"
        />
        <p className="mt-2 text-xs text-ink-soft">
          视频请先传到 B站或 YouTube，再把链接贴在这里，网站会自动嵌入播放。
        </p>
      </div>

      {error ? (
        <p className="rounded-lg bg-accent-soft/30 px-4 py-3 text-sm text-accent">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "保存中…" : post ? "保存修改" : "发布游记"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="btn-ghost"
        >
          取消
        </button>
      </div>
    </form>
  );
}
