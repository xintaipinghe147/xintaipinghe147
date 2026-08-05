"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.trim() || password.length < 6) {
      setError("请填写邮箱，密码至少 6 位");
      return;
    }
    if (!isLogin) {
      if (!username.trim()) {
        setError("请给自己取一个昵称");
        return;
      }
      if (password !== confirm) {
        setError("两次输入的密码不一致");
        return;
      }
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/auth/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "操作失败，请稍后再试");
        return;
      }
      if (data.needConfirm) {
        setInfo("注册成功！请前往邮箱点击确认链接，然后回来登录。");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="note-card relative mx-auto max-w-md p-8">
      <div className="tape" aria-hidden />
      <div className="stamp">{isLogin ? "欢迎回来" : "加入旅程"}</div>
      <h1 className="mt-5 text-2xl font-bold">
        {isLogin ? "登录旅行手账" : "注册旅行手账"}
      </h1>
      {isLogin ? null : (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          注册后可以点赞、留言；经过站长批准后，还能发布自己的游记。
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {isLogin ? null : (
          <div>
            <label className="mb-1 block text-sm text-ink-soft">昵称</label>
            <input
              className="field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="别人会看到的名字"
              maxLength={20}
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-ink-soft">邮箱</label>
          <input
            className="field"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-ink-soft">密码</label>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 6 位"
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
        </div>
        {isLogin ? null : (
          <div>
            <label className="mb-1 block text-sm text-ink-soft">
              再输入一次密码
            </label>
            <input
              className="field"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="确认密码"
              autoComplete="new-password"
            />
          </div>
        )}

        {error ? (
          <p className="rounded-lg bg-accent-soft/30 px-3 py-2 text-sm text-accent">
            {error}
          </p>
        ) : null}
        {info ? (
          <p className="rounded-lg bg-paper-deep/70 px-3 py-2 text-sm text-ink">
            {info}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? "请稍候…" : isLogin ? "登录" : "注册"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-soft">
        {isLogin ? (
          <>
            还没有账号？{" "}
            <Link href="/signup" className="text-accent underline underline-offset-4">
              去注册
            </Link>
          </>
        ) : (
          <>
            已经有账号？{" "}
            <Link href="/login" className="text-accent underline underline-offset-4">
              去登录
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
