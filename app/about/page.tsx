import type { Metadata } from "next";
import { BookOpen, Camera, ChatCircleDots, Coffee, Footprints, Leaf } from "@phosphor-icons/react/dist/ssr";
import { getBlogPosts, getAllProfiles } from "@/lib/data";
import { ABOUT, SITE } from "@/lib/constants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "关于我",
};

const HOBBY_ICONS = [Footprints, BookOpen, Camera, Coffee, Leaf, ChatCircleDots];

export default async function AboutPage() {
  const [posts, profiles] = await Promise.all([getBlogPosts(1000), getAllProfiles()]);
  const owner = profiles.find((p) => p.role === "admin") ?? profiles[0] ?? null;
  const avatar = owner?.avatar_url || ABOUT.avatar;

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <header className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-deep shadow-[0_10px_30px_rgba(90,72,52,0.12)]">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={ABOUT.name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-3xl text-accent">
              {ABOUT.name.slice(0, 1)}
            </span>
          )}
        </div>
        <h1 className="font-display mt-5 text-4xl text-ink">{ABOUT.name}</h1>
        <p className="mt-1 text-sm text-ink-soft">{SITE.name}的主人</p>
      </header>

      <section className="note-card relative p-7 sm:p-8">
        <div className="tape" aria-hidden />
        <h2 className="font-display text-2xl text-ink">关于我</h2>
        <p className="mt-4 leading-relaxed text-ink">{ABOUT.intro}</p>
        <p className="mt-4 font-serif text-accent">{ABOUT.quote}</p>
      </section>

      <section>
        <h2 className="font-display mb-4 text-2xl text-ink">爱好</h2>
        <div className="flex flex-wrap gap-2.5">
          {ABOUT.hobbies.map((h, i) => {
            const Icon = HOBBY_ICONS[i % HOBBY_ICONS.length];
            return (
              <span key={h} className="chip">
                <Icon size={15} weight="duotone" className="text-accent" />
                {h}
              </span>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="note-card p-5 text-center">
          <p className="font-display text-3xl text-accent">{posts.length}</p>
          <p className="mt-1 text-xs text-ink-soft">篇文章</p>
        </div>
        <div className="note-card p-5 text-center">
          <p className="font-display text-3xl text-accent">
            {new Set(posts.map((p) => postDateYear(p))).size}
          </p>
          <p className="mt-1 text-xs text-ink-soft">写作年份</p>
        </div>
        <div className="note-card p-5 text-center">
          <p className="font-display text-3xl text-accent">
            {new Set(posts.flatMap((p) => p.tags)).size}
          </p>
          <p className="mt-1 text-xs text-ink-soft">用过的标签</p>
        </div>
      </section>
    </div>
  );
}

function postDateYear(post: { occurred_at: string | null; created_at: string }) {
  return (post.occurred_at ?? post.created_at).slice(0, 4);
}
