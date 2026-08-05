import Link from "next/link";
import { redirect } from "next/navigation";
import {
  MagnifyingGlass,
  PenNib,
  SignIn,
  SignOut,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ThemeToggle from "@/components/ThemeToggle";
import { SITE } from "@/lib/constants";

export default async function Nav() {
  const user = await getSessionUser();
  const canWrite = user?.role === "admin" || user?.role === "member";

  async function logout() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  const navLinks = [
    { href: "/", label: "首页", mobile: false },
    { href: "/blog", label: "文章", mobile: true },
    { href: "/album", label: "相册", mobile: false },
    { href: "/shuoshuo", label: "碎碎念", mobile: false },
    { href: "/timeline", label: "时间轴", mobile: false },
    { href: "/about", label: "关于", mobile: true },
    { href: "/friends", label: "友链", mobile: false },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            width={30}
            height={30}
            className="rounded-[10px] shadow-sm"
          />
          <span className="font-display truncate text-xl tracking-tight text-ink">
            {SITE.name}
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) =>
            link.mobile ? (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link rounded-full px-2.5 py-1.5 sm:px-3"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link hidden rounded-full px-3 py-1.5 md:inline"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/search"
            aria-label="搜索"
            title="搜索"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-all hover:scale-105 hover:text-accent active:scale-95"
          >
            <MagnifyingGlass size={17} weight="duotone" />
          </Link>
          <ThemeToggle />
          {user ? (
            <>
              {canWrite ? (
                <Link
                  href="/new"
                  className="hidden items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-sm font-bold text-accent-ink transition-all hover:scale-105 active:scale-95 sm:inline-flex"
                >
                  <PenNib size={15} weight="fill" />
                  写文章
                </Link>
              ) : null}
              <Link
                href="/me"
                aria-label="个人中心"
                title="个人中心"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-all hover:scale-105 hover:text-accent active:scale-95"
              >
                <UserCircle size={18} weight="duotone" />
              </Link>
              <form action={logout} className="hidden sm:block">
                <button
                  type="submit"
                  aria-label="退出登录"
                  title="退出登录"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line-strong text-ink-soft transition-all hover:scale-105 hover:text-accent active:scale-95"
                >
                  <SignOut size={16} weight="duotone" />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-1.5 rounded-full border border-line-strong px-3.5 py-2 text-sm font-bold text-ink transition-all hover:scale-105 hover:text-accent active:scale-95 sm:inline-flex"
              >
                <SignIn size={15} weight="duotone" />
                登录
              </Link>
              <Link
                href="/login"
                aria-label="登录"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong text-ink-soft transition-all hover:scale-105 hover:text-accent active:scale-95 sm:hidden"
              >
                <UserCircle size={18} weight="duotone" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
