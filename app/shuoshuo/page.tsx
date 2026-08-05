import type { Metadata } from "next";
import ShuoshuoFeed from "@/components/ShuoshuoFeed";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "碎碎念",
};

export default async function ShuoshuoPage() {
  const user = await getSessionUser();
  const currentUser = user
    ? { id: user.id, username: user.username, role: user.role }
    : null;
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl text-ink">碎碎念</h1>
        <p className="text-ink-soft">
          简短随手记，像小纸条一样的生活片段。
        </p>
      </header>
      <ShuoshuoFeed currentUser={currentUser} />
    </div>
  );
}
