"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function AppShell({
  nav,
  themeSwitcher,
  children,
}: {
  nav: ReactNode;
  themeSwitcher: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  // 首页是全新的全屏落地页，不套用普通页面的顶栏/页脚/宽度限制
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <>
      {nav}
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6">
        {children}
      </main>
      {themeSwitcher}
      <footer className="pb-8 text-center text-sm text-ink-soft/70">
        <p>把走过的路，写成一册手账</p>
        <p className="mt-1 text-xs text-ink-soft/50">
          版本 {process.env.NEXT_PUBLIC_APP_VERSION}
        </p>
      </footer>
    </>
  );
}
