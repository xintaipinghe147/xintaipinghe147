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
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <span aria-hidden>✈</span>
          <span>我的旅行手账</span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-5">
          <Link href="/" className="nav-link hidden sm:inline">
            足迹地图
          </Link>
          <Link href="/#latest" className="nav-link hidden sm:inline">
            最新日记
          </Link>
          <Link href="/timeline" className="nav-link hidden sm:inline">
            时间线
          </Link>
          {user ? (
            <>
              {user.role === "member" || user.role === "admin" ? (
                <Link href="/new" className="nav-link">
                  写日记
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
                className="rounded-full border border-accent px-4 py-1.5 text-sm text-accent transition-colors hover:bg-accent hover:text-white"
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
