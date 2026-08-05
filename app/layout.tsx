import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export const metadata: Metadata = {
  title: "我的旅行手账",
  description: "用世界地图记录每一次出发，写下属于我的旅行手账。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('journal-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen text-ink antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6">
          {children}
        </main>
        <ThemeSwitcher />
        <footer className="pb-8 text-center text-sm text-ink-soft/70">
          <p>把走过的路，写成一册手账</p>
          <p className="mt-1 text-xs text-ink-soft/50">
            版本 {process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
        </footer>
      </body>
    </html>
  );
}
