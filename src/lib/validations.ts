import { z } from "zod";

export const PaymentClaimSchema = z.object({
  orderId: z.string().cuid(),
});

export const WebsiteFormSchema = z.object({
  websiteName: z.string().min(3, "Nama website minimal 3 karakter").max(100),
  description: z
    .string()
    .min(1, "Deskripsi wajib diisi")
    .max(500, "Deskripsi maksimal 500 karakter"),
  serviceType: z.enum(["nakes", "homecare", "both"]),
  waNumber: z
    .string()
    .regex(/^628\d{9,12}$/, "Format nomor WA harus 628xxx (9-12 digit)"),
  practiceHours: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  googleMaps: z.string().url("URL Google Maps tidak valid").max(1000).optional().or(z.literal("")),
});

export type PaymentClaimInput = z.infer<typeof PaymentClaimSchema>;
export type WebsiteFormInput = z.infer<typeof WebsiteFormSchema>;
