import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PaymentInvoiceClient from "./payment-invoice-client";

export default async function PaymentInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/login");
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { order: true },
  });

  if (!invoice || invoice.userId !== session.user.id) {
    redirect("/dashboard/langganan?error=invoice_not_found");
  }

  if (invoice.status !== "pending") {
    redirect("/dashboard/langganan");
  }

  return (
    <div className="w-full flex-1">
      <PaymentInvoiceClient
        invoice={{
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          totalAmount: invoice.totalAmount,
          baseAmount: invoice.baseAmount,
          uniqueCode: invoice.uniqueCode,
          billingCycle: invoice.billingCycle,
          periodStart: invoice.periodStart.toISOString(),
          periodEnd: invoice.periodEnd.toISOString(),
          status: invoice.status,
        }}
        websiteName={invoice.order.websiteName}
      />
    </div>
  );
}
