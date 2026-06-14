"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyAdmin } from "@/lib/telegram";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { WebsiteFormSchema } from "@/lib/validations";

export async function submitWebsiteForm(
  orderId: string,
  formData: {
    websiteName: string;
    description: string;
    serviceType: "nakes" | "homecare" | "both";
    waNumber: string;
    practiceHours?: string;
    location?: string;
    googleMaps?: string;
  }
) {
  // Get session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate form data
  const validation = WebsiteFormSchema.safeParse(formData);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Data tidak valid",
    };
  }

  // Fetch order and validate ownership
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  // Update order with form data
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      websiteName: validation.data.websiteName,
      description: validation.data.description,
      serviceType: validation.data.serviceType,
      waNumber: validation.data.waNumber,
      practiceHours: validation.data.practiceHours,
      location: validation.data.location,
      googleMaps: validation.data.googleMaps,
    },
  });

  // Send Telegram notification to admin
  await notifyAdmin(`📝 Form Website Disubmit

Order ID: ${orderId}
Website: ${updatedOrder.websiteName}
Layanan: ${updatedOrder.serviceType}
Kontak WA: ${updatedOrder.waNumber}
Template: ${updatedOrder.templateId}

Client telah mengisi detail website. Siap untuk mulai build.

Link Admin: https://app.nakespro.id/admin/orders/${orderId}`);

  return { success: true };
}
