import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import FormClient from "./form-client";

export default async function FormPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  // Fetch order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  // Validate order exists and belongs to user
  if (!order || order.userId !== session.user.id) {
    redirect("/dashboard?error=order_not_found");
  }

  // If payment not claimed yet, redirect to payment
  if (order.paymentStatus === "pending") {
    redirect(`/payment/${orderId}`);
  }

  return (
    <div className="w-full flex-1">
      <FormClient
        orderId={order.id}
        defaultFullName={order.fullName ?? session.user.name ?? ""}
      />
    </div>
  );
}
