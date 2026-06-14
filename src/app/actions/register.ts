"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const TEMPLATES = [
  "modern-light",
  "clean-medical",
  "calm-warm",
  "friendly-care",
] as const;

// Palette default tiap template (id preset default di repo nakespro-template).
// Untuk MVP, client memilih template; palette diisi otomatis dari default ini.
const DEFAULT_PALETTE: Record<(typeof TEMPLATES)[number], string> = {
  "modern-light": "neutral",
  "clean-medical": "bright-health",
  "calm-warm": "terracotta",
  "friendly-care": "sunny",
};

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
      palette: DEFAULT_PALETTE[templateId as (typeof TEMPLATES)[number]],
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
