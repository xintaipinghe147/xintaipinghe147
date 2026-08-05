import Link from "next/link";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Post } from "@/lib/types";

export default function PrevNext({
  prev,
  next,
}: {
  prev: Post | null;
  next: Post | null;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`/posts/${prev.id}`}
          className="note-card group flex items-start gap-3 p-5 transition-transform hover:-translate-y-0.5"
        >
          <ArrowLeft
            size={18}
            weight="bold"
            className="mt-1 shrink-0 text-accent transition-transform group-hover:-translate-x-1"
          />
          <div className="min-w-0">
            <p className="text-xs text-ink-soft">上一篇</p>
            <p className="mt-1 line-clamp-2 font-bold text-ink group-hover:text-accent">
              {prev.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/posts/${next.id}`}
          className="note-card group flex items-start gap-3 p-5 text-right transition-transform hover:-translate-y-0.5"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xs text-ink-soft">下一篇</p>
            <p className="mt-1 line-clamp-2 font-bold text-ink group-hover:text-accent">
              {next.title}
            </p>
          </div>
          <ArrowRight
            size={18}
            weight="bold"
            className="mt-1 shrink-0 text-accent transition-transform group-hover:translate-x-1"
          />
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </div>
  );
}
