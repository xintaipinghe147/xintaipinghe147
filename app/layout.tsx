import type { Metadata } from "next";
import "./globals.css";
import "./fonts.css";
import Nav from "@/components/Nav";
import BackToTop from "@/components/BackToTop";
import { SITE, THEME_KEY } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.dataset.theme='dark'}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-[100dvh] text-ink antialiased">
        <div className="grain" aria-hidden />
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-line py-10">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <p className="font-display text-lg text-ink">
              {SITE.name}
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              把日子过成喜欢的样子，然后写下来。
            </p>
            <p className="mt-3 text-xs text-ink-soft/80">
              喜欢的话，去留言板说说话吧。
            </p>
          </div>
        </footer>
        <BackToTop />
      </body>
    </html>
  );
}
