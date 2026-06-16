import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import RegisterClient from "./register-client";

export default async function RegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full flex-1">
      <RegisterClient userEmail={session.user.email} />
    </div>
  );
}
