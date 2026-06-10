"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const TEMPLATES = [
  "modern-light",
  "modern-dark",
  "playful-geometry",
  "calm-warm",
] as const;

export async function selectTemplate(
  templateId: string,
  billingCycle: "monthly" | "yearly"
) {
  // Get session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/auth/login");
  }

  // Validate template
  if (!TEMPLATES.includes(templateId as any)) {
    throw new Error("Invalid template");
  }

  // Validate billing cycle
  if (!["monthly", "yearly"].includes(billingCycle)) {
    throw new Error("Invalid billing cycle");
  }

  // Get base amount
  const baseAmount = billingCycle === "monthly" ? 39000 : 300000;

  // Generate unique code (3 digit number)
  const uniqueCode = Math.floor(Math.random() * 1000);
  const totalAmount = baseAmount + uniqueCode;

  // Create Order
  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      packageType: "hemat",
      templateId,
      billingCycle,
      baseAmount,
      uniqueCode,
      totalAmount,
      paymentStatus: "pending",
      buildStatus: "awaiting_payment",
    },
  });

  // Redirect to payment
  redirect(`/payment/${order.id}`);
}
