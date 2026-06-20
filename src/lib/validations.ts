import { z } from "zod";

export const PaymentClaimSchema = z.object({
  orderId: z.string().cuid(),
});

export const WebsiteFormSchema = z.object({
  fullName: z.string().min(2, "Nama lengkap minimal 2 karakter").max(100),
  websiteName: z.string().min(3, "Nama website minimal 3 karakter").max(100),
  subdomain: z
    .string()
    .min(3, "Subdomain minimal 3 karakter")
    .max(30, "Subdomain maksimal 30 karakter")
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      "Subdomain hanya boleh huruf kecil, angka, dan tanda hubung"
    ),
  description: z
    .string()
    .min(1, "Deskripsi wajib diisi")
    .max(500, "Deskripsi maksimal 500 karakter"),
  serviceTypes: z
    .array(z.string().min(1).max(50))
    .min(1, "Minimal 1 tipe layanan")
    .max(20, "Maksimal 20 tipe layanan"),
  waNumber: z
    .string()
    .regex(/^628\d{9,12}$/, "Format nomor WA harus 628xxx (9-12 digit)"),
  practiceHours: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  googleMaps: z.string().url("URL Google Maps tidak valid").max(1000).optional().or(z.literal("")),
});

export const ReportItemSchema = z.object({
  name: z.string().min(1, "Nama item wajib diisi").max(100),
  qty: z.number().int("Jumlah harus angka bulat").min(1, "Jumlah minimal 1"),
  price: z.number().int("Harga harus angka bulat").min(0, "Harga minimal 0"),
});

export const ReportSchema = z.object({
  patientName: z
    .string()
    .min(2, "Nama pasien minimal 2 karakter")
    .max(100),
  patientWaNumber: z
    .string()
    .regex(/^628\d{9,12}$/, "Format nomor WA harus 628xxx (9-12 digit)"),
  actionDate: z
    .string()
    .refine((v) => !isNaN(Date.parse(v)), "Tanggal tindakan tidak valid"),
  actionType: z.string().min(1, "Jenis tindakan wajib diisi").max(100),
  actionDescription: z.string().max(1000).optional(),
  items: z
    .array(ReportItemSchema)
    .min(1, "Minimal 1 item biaya"),
  notes: z.string().max(1000).optional(),
});

export type PaymentClaimInput = z.infer<typeof PaymentClaimSchema>;
export type WebsiteFormInput = z.infer<typeof WebsiteFormSchema>;
export type ReportInput = z.infer<typeof ReportSchema>;
export type ReportItem = z.infer<typeof ReportItemSchema>;
