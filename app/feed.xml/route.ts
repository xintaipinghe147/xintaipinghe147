import { getBlogPosts } from "@/lib/data";
import { SITE } from "@/lib/constants";
import { postDate, postSummary } from "@/lib/utils";

export const dynamic = "force-dynamic";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getBlogPosts(50);
  const base = "https://xintaipinghe147.vercel.app";
  const items = posts
    .map((p) => {
      const date = new Date(postDate(p));
      const pubDate = Number.isNaN(date.getTime())
        ? new Date().toUTCString()
        : date.toUTCString();
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${base}/posts/${p.id}</link>
      <guid>${base}/posts/${p.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(postSummary(p, 160))}</description>
      <category>${escapeXml(p.category ?? "")}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>zh-cn</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
