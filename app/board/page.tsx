import type { Metadata } from "next";
import MessageBoard from "@/components/MessageBoard";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "留言板",
};

export default async function BoardPage() {
  const user = await getSessionUser();
  const currentUser = user
    ? { id: user.id, username: user.username, role: user.role }
    : null;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">留言板</h1>
        <p className="text-ink-soft">来了就留下句话吧。</p>
      </header>
      <MessageBoard currentUser={currentUser} />
    </div>
  );
}
