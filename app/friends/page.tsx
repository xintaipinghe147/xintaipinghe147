import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { FRIENDS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "友链",
};

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">友链</h1>
        <p className="text-ink-soft">
          一些朋友的小窝。想交换友链，去留言板告诉我吧。
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {FRIENDS.map((f) => (
          <a
            key={f.name}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="note-card group flex items-start justify-between gap-3 p-6 transition-transform hover:-translate-y-1"
          >
            <div>
              <h2 className="font-display text-xl text-ink transition-colors group-hover:text-accent">
                {f.name}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
            <ArrowSquareOut
              size={18}
              weight="duotone"
              className="mt-1 shrink-0 text-accent transition-transform group-hover:translate-x-0.5"
            />
          </a>
        ))}
      </div>

      <div className="note-card relative p-6">
        <div className="pin" aria-hidden />
        <h2 className="font-display text-xl text-ink">想交换友链？</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          在留言板留下你的博客名字和地址，我会去看看，然后把你加进来。
        </p>
        <Link href="/board" className="btn-ghost mt-4">
          去留言板
        </Link>
      </div>
    </div>
  );
}
