import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import AppShell from "@/components/AppShell";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400;1,8..60,500&family=Noto+Serif+SC:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen text-ink antialiased">
        <AppShell nav={<Nav />} themeSwitcher={<ThemeSwitcher />}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
