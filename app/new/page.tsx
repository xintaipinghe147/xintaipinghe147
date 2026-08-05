import Link from "next/link";
import { redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { getSessionUser } from "@/lib/auth";

export default async function NewPostPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "member") {
    return (
      <div className="note-card mx-auto max-w-md p-8 text-center">
        <div className="pin" aria-hidden />
        <h1 className="text-xl font-bold">还没有发布权限</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          你的账号正在等待站长批准。批准之后，就可以在这里发布自己的游记了。
        </p>
        <Link href="/" className="btn-ghost mt-5">
          回到首页
        </Link>
      </div>
    );
  }
  return <PostForm userId={user.id} />;
}
