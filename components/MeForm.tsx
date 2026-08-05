"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  initialUsername: string;
  initialBio: string;
  initialAvatarUrl: string | null;
};

export default function MeForm({
  userId,
  initialUsername,
  initialBio,
  initialAvatarUrl,
}: Props) {
  const supabase = createClient();
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadAvatar(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("只能上传图片文件");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("头像请控制在 5MB 以内");
      return;
    }
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `avatars/${userId}-${Date.now()}.${ext}`;
    const { data, error: uploadError } = await supabase.storage
      .from("images")
      .upload(path, file, { upsert: true });
    if (uploadError || !data) {
      setError("头像上传失败：" + (uploadError?.message ?? "未知错误"));
      return;
    }
    const { data: pub } = supabase.storage
      .from("images")
      .getPublicUrl(data.path);
    setAvatarUrl(pub.publicUrl);
  }

  async function save() {
    setError("");
    setInfo("");
    const cleanName = username.trim().slice(0, 20);
    if (!cleanName) {
      setError("昵称不能为空");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanName,
          bio: bio.trim().slice(0, 200),
          avatar_url: avatarUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "保存失败，请稍后再试");
        return;
      }
      setInfo("已保存 ✓");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="note-card relative p-6">
      <div className="tape" aria-hidden />
      <h2 className="mb-4 text-lg font-bold">编辑个人资料</h2>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-deep/60 text-2xl">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="头像" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>👤</span>
          )}
        </div>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) uploadAvatar(e.target.files[0]);
            }}
            className="block max-w-[220px] text-xs text-ink-soft file:mr-2 file:rounded-full file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:text-accent-ink"
          />
          <p className="mt-1 text-xs text-ink-soft">上传一张头像（5MB 以内）</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm text-ink-soft">昵称</label>
          <input
            className="field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-soft">
            一句话介绍自己
          </label>
          <textarea
            className="field resize-none"
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="比如：喜欢在旅行中收集日落"
            maxLength={200}
          />
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-accent-soft/30 px-3 py-2 text-sm text-accent">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="mt-3 rounded-lg bg-paper-deep/70 px-3 py-2 text-sm text-ink">
          {info}
        </p>
      ) : null}

      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="btn-primary mt-4"
      >
        {busy ? "保存中…" : "保存资料"}
      </button>
    </div>
  );
}
