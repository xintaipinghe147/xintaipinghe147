import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  const user = await getSessionUser();

  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="友达手账"
            width={28}
            height={28}
            className="rounded-xl"
          />
          <span className="font-display text-lg font-bold text-ink">友达手账</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-5">
          <Link href="/" className="nav-link hidden sm:inline">
            首页
          </Link>
          <Link href="/timeline" className="nav-link hidden sm:inline">
            手账本
          </Link>
          <Link href="/#albums" className="nav-link hidden sm:inline">
            好友相册
          </Link>
          {user ? (
            <>
              {user.role === "member" || user.role === "admin" ? (
                <Link href="/new" className="nav-link">
                  写手账
                </Link>
              ) : null}
              {user.role === "admin" ? (
                <Link href="/admin" className="nav-link">
                  管理
                </Link>
              ) : null}
              <Link href="/me" className="nav-link">
                {user.username}
              </Link>
              <form action={logout}>
                <button type="submit" className="nav-link cursor-pointer">
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                登录
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-accent-ink transition-transform hover:scale-105"
              >
                注册
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
