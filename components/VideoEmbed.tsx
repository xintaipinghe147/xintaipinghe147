import { parseVideoUrl } from "@/lib/utils";

export default function VideoEmbed({ url }: { url: string }) {
  const video = parseVideoUrl(url);

  if (video.type === "link") {
    return (
      <a
        href={video.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-accent underline underline-offset-4"
      >
        <span aria-hidden>▶</span> 在外部打开视频
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg border border-line bg-black/90">
      <iframe
        src={video.embedUrl}
        className="h-full w-full"
        allowFullScreen
        title="视频"
        loading="lazy"
      />
    </div>
  );
}
