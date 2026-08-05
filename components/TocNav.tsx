import type { MarkdownHeading } from "@/lib/types";
import { ListDashes } from "@phosphor-icons/react/dist/ssr";

export default function TocNav({ headings }: { headings: MarkdownHeading[] }) {
  if (headings.length < 2) return null;
  return (
    <nav
      aria-label="文章目录"
      className="note-card sticky top-24 max-h-[70vh] overflow-auto p-5"
    >
      <p className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
        <ListDashes size={16} weight="duotone" className="text-accent" />
        目录
      </p>
      <ul className="space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block text-sm leading-snug text-ink-soft transition-colors hover:text-accent ${
                h.level === 3 ? "pl-4" : ""
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
