import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ClientSidebar from "@/components/dashboard/ClientSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",") ?? [];
  const isAdmin = adminEmails.includes(session.user.email);

  // Ambil order terbaru user untuk sidebar badge.
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 1,
    select: { packageType: true, isActive: true },
  });

  const plan = orders[0]?.packageType === "hemat" ? "Starter" as const : "Profesional" as const;
  const status = orders[0]?.isActive ? "Aktif" as const : "Belum Aktif" as const;

  const subscription = { plan, status };

  return (
    <div className="flex min-h-screen bg-neutral-50 w-full">
      {/* Sidebar Navigation */}
      <ClientSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
        }}
        isAdmin={isAdmin}
        subscription={subscription}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full lg:ml-0 pt-16 lg:pt-0">
        {/* On mobile, pt-16 gives space for the fixed hamburger menu */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
