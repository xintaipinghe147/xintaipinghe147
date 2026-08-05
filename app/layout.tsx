import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import Nav from "@/components/Nav";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export const metadata: Metadata = {
  title: "友达手账 · 共同友情手账记录",
  description: "和朋友们一起写手账、日常打卡、分享照片、互相留言。",
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
        <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6">
          {children}
        </main>
        <ThemeSwitcher />
        <footer className="pb-8 text-center text-sm text-ink-soft/70">
          <p>把每一天的小日子，一起写进这本手账。</p>
          <p className="mt-1 text-xs text-ink-soft/50">
            版本 {process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
        </footer>
      </body>
    </html>
  );
}
