import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AuthTest } from "@/components/auth-test";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map(e => e.trim()) ?? [];
  const isAdmin = session ? adminEmails.includes(session.user.email) : false;

  const user = session
    ? {
        name: session.user.name || "Unknown",
        email: session.user.email,
        image: session.user.image || undefined,
      }
    : null;

  return <AuthTest user={user} isAdmin={isAdmin} />;
}
