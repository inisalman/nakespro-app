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
    fullName: string;
    websiteName: string;
    subdomain: string;
    description: string;
    serviceTypes: string[];
    waNumber: string;
    practiceHours?: string;
    location?: string;
    googleMaps?: string;
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const validation = WebsiteFormSchema.safeParse(formData);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    return {
      success: false,
      error: firstError?.message || "Data tidak valid",
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    return { success: false, error: "Order tidak ditemukan" };
  }

  if (order.userId !== session.user.id) {
    return { success: false, error: "Unauthorized access" };
  }

  const subdomain = validation.data.subdomain.toLowerCase();

  const subdomainTaken = await prisma.order.findFirst({
    where: {
      subdomain,
      NOT: { id: orderId },
    },
    select: { id: true },
  });

  if (subdomainTaken) {
    return { success: false, error: "Subdomain sudah digunakan, pilih yang lain" };
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      fullName: validation.data.fullName,
      websiteName: validation.data.websiteName,
      subdomain,
      description: validation.data.description,
      serviceType: validation.data.serviceTypes.join(", "),
      waNumber: validation.data.waNumber,
      practiceHours: validation.data.practiceHours,
      location: validation.data.location,
      googleMaps: validation.data.googleMaps,
    },
  });

  await notifyAdmin(`📝 Form Website Disubmit

Order ID: ${orderId}
Nama: ${updatedOrder.fullName}
Website: ${updatedOrder.websiteName}
Subdomain: ${updatedOrder.subdomain}.nakespro.id
Layanan: ${updatedOrder.serviceType}
Kontak WA: ${updatedOrder.waNumber}
Template: ${updatedOrder.templateId}

Client telah mengisi detail website. Siap untuk mulai build.

Link Admin: https://app.nakespro.id/admin/orders/${orderId}`);

  return { success: true };
}
