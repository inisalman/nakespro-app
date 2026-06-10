import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PaymentClient from "./payment-client";

const TEMPLATE_NAMES: Record<string, string> = {
  "modern-light": "Modern Light",
  "modern-dark": "Modern Dark",
  "playful-geometry": "Playful Geometry",
  "calm-warm": "Calm & Warm",
};

export default async function PaymentPage({
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

  // If already paid, redirect to form
  if (order.paymentStatus === "paid") {
    redirect(`/form/${orderId}`);
  }

  const templateName = TEMPLATE_NAMES[order.templateId] || order.templateId;

  return (
    <PaymentClient
      order={{
        id: order.id,
        templateId: order.templateId,
        templateName,
        billingCycle: order.billingCycle,
        baseAmount: order.baseAmount,
        uniqueCode: order.uniqueCode,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
      }}
    />
  );
}
