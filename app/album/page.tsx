import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "相册",
};

export default async function AlbumPage() {
  const posts = await getBlogPosts(500);
  const photos = posts.flatMap((p) =>
    p.image_urls.map((url, i) => ({
      url,
      id: p.id,
      title: p.title,
      key: `${p.id}-${i}`,
    }))
  );
  const ratios = ["aspect-[4/3]", "aspect-square", "aspect-[3/4]"];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">相册</h1>
        <p className="text-ink-soft">生活照片，共 {photos.length} 张。</p>
      </header>

      {photos.length === 0 ? (
        <div className="note-card px-6 py-16 text-center text-ink-soft">
          相册还空着，写文章时带上照片，它们会出现在这里。
        </div>
      ) : (
        <div className="masonry">
          {photos.map((ph, i) => (
            <div key={ph.key} className="masonry-item">
              <Link
                href={`/posts/${ph.id}`}
                className="group block overflow-hidden rounded-2xl border border-line bg-paper-deep"
              >
                <div className={`w-full overflow-hidden ${ratios[i % ratios.length]}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ph.url}
                    alt={ph.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
