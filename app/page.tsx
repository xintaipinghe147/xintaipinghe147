import { getSessionUser } from "@/lib/auth";
import Landing from "@/components/Landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUser();
  return <Landing user={user} />;
}
