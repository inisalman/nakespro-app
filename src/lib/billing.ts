/**
 * Helper perhitungan siklus langganan.
 *
 * Dipakai oleh admin (publish website) dan client (perpanjang langganan).
 * Sebelumnya private di src/app/actions/admin.ts, dipindah ke sini agar
 * bisa di-share antar module.
 */

export type BillingCycle = "monthly" | "yearly";

/**
 * Tambah satu interval langganan (1 bulan / 1 tahun) dari tanggal tertentu.
 * Tidak memutasi input.
 */
export function addBillingInterval(from: Date, cycle: string): Date {
  const next = new Date(from);
  if (cycle === "yearly") {
    next.setFullYear(next.getFullYear() + 1);
  } else {
    next.setMonth(next.getMonth() + 1);
  }
  return next;
}
