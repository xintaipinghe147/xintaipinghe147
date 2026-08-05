import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { getPost } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, post] = await Promise.all([getSessionUser(), getPost(id)]);
  if (!user) redirect("/login");
  if (!post) notFound();

  if (post.author_id !== user.id && user.role !== "admin") {
    return (
      <div className="note-card mx-auto max-w-md p-8 text-center">
        <div className="pin" aria-hidden />
        <h1 className="text-xl font-bold">不能编辑这篇日记</h1>
        <p className="mt-3 text-ink-soft">只有作者本人或站长可以编辑。</p>
        <Link href={`/posts/${post.id}`} className="btn-ghost mt-5">
          返回日记
        </Link>
      </div>
    );
  }

  return <PostForm userId={user.id} post={post} />;
}
