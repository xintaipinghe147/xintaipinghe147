import { NextResponse } from "next/server";
import { requireMember } from "@/lib/auth";
import { getBlogPosts } from "@/lib/data";
import { postDate, postSummary } from "@/lib/utils";

// 导出全部文章备份（JSON）
export async function GET() {
  const user = await requireMember();
  if (!user) {
    return NextResponse.json({ error: "登录后即可导出" }, { status: 401 });
  }
  const posts = await getBlogPosts(1000);
  const data = posts.map((p) => ({
    title: p.title,
    date: postDate(p),
    category: p.category,
    tags: p.tags,
    summary: postSummary(p, 240),
    content: p.content,
    images: p.image_urls,
    created_at: p.created_at,
    views: p.views,
  }));
  const filename = `blog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
