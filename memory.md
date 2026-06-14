# Memory — Perubahan Belum Di-commit

Catatan kerja per **2026-06-14**. Dokumen ini merangkum semua perubahan yang
sudah dikerjakan tapi **belum di-commit** ke git, supaya konteksnya tidak hilang.

## Ringkasan

Inti perubahan: **penataan ulang daftar template website**, penambahan field
`palette`, dan menjadikan **deskripsi singkat sebagai field wajib** di form.
Disertai migrasi Prisma untuk menyelaraskan database dengan schema baru.

---

## 1. Perubahan Template

Daftar template lama diganti agar lebih sesuai positioning nakes/homecare.

| Lama                | Baru             | Karakter                         |
| ------------------- | ---------------- | -------------------------------- |
| `modern-dark`       | `clean-medical`  | Klinis, rapi, tepercaya          |
| `playful-geometry`  | `friendly-care`  | Ceria, hangat, ramah keluarga    |
| `modern-light`      | (tetap)          | —                                |
| `calm-warm`         | (tetap)          | —                                |

File terdampak:
- `src/app/templates/page.tsx` — kartu template di-rename, deskripsi & warna
  diperbarui. Logika styling khusus `modern-dark` (teks putih di atas bg gelap)
  dihapus karena template gelap sudah tidak ada.
- `src/app/actions/register.ts` — konstanta `TEMPLATES` disesuaikan.

## 2. Field `palette` (baru)

- `prisma/schema.prisma` — `Order` dapat kolom baru `palette String?` (nullable).
- `src/app/actions/register.ts` — ditambahkan map `DEFAULT_PALETTE` yang
  mengisi palette otomatis dari default tiap template (untuk MVP, client hanya
  memilih template, palette diisi otomatis):
  - `modern-light`  → `neutral`
  - `clean-medical` → `bright-health`
  - `calm-warm`     → `terracotta`
  - `friendly-care` → `sunny`
  - Saat `selectTemplate`, `palette` di-set dari `DEFAULT_PALETTE[templateId]`.

## 3. Deskripsi jadi field wajib

Sebelumnya `description` opsional, sekarang wajib diisi.

- `src/lib/validations.ts` — `description` jadi `min(1)` `max(500)` (tidak lagi
  `.optional()`). `practiceHours` dinaikkan dari `max(100)` → `max(200)`.
  `googleMaps` diberi batas `max(1000)`.
- `src/app/actions/form.ts` — tipe param `description` jadi wajib (bukan `?`).
- `src/app/form/[orderId]/form-client.tsx`:
  - Validasi client: tolak submit kalau deskripsi kosong
    ("Deskripsi singkat wajib diisi").
  - Label diberi tanda wajib `*` (merah).
  - `description` dikirim langsung (tidak lagi `|| undefined`).
  - `maxLength` field practice hours dinaikkan `100` → `200`.

## 4. Hapus kolom `category` di OrderPhoto

- `prisma/schema.prisma` — kolom `category String` dihapus dari `OrderPhoto`.
- Tidak ada lagi referensi `category` di `src/`.

---

## 5. Migrasi Database (penting)

Kondisi awal: database dibuat lewat `prisma db push` **tanpa history migrasi**,
tapi sudah berisi data nyata (**3 Order, 1 User**). Migrasi `0_init` ada di
folder tapi belum tercatat sebagai applied, sehingga `migrate dev` minta reset
(destruktif).

Langkah yang diambil (non-destruktif):
1. `prisma migrate resolve --applied 0_init` — baseline: tandai `0_init` sebagai
   sudah-applied karena isinya cocok dengan DB live.
2. `prisma migrate dev --name add_palette_remove_photo_category` — buat migrasi
   diff baru.

Migrasi baru: `prisma/migrations/20260614113130_add_palette_remove_photo_category/`

```sql
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "palette" TEXT;
-- AlterTable
ALTER TABLE "OrderPhoto" DROP COLUMN "category";
```

Verifikasi: 3 Order tetap utuh. `OrderPhoto` punya 0 baris, jadi drop `category`
tidak menghilangkan data apa pun.

---

## 6. File untracked lain

- `prisma/schema-old.prisma` — backup schema **sebelum** perubahan ini. Beda
  persis 2 baris dari schema sekarang (belum ada `palette`, masih ada
  `category`). Tidak dipakai build → **aman dihapus**.
- `prisma/migrations/` — folder migrasi baru (untracked), perlu di-commit.

## 7. Status verifikasi

- `npm run build` → **sukses** (`✓ Compiled successfully`), TypeScript lolos.
- `package-lock.json` berubah: beberapa dependency (`@types/react`, `csstype`,
  `typescript`) bergeser dari `devOptional`/peer ke `dev`.

## 8. TODO sebelum commit

- [ ] Putuskan nasib `prisma/schema-old.prisma` (aman dihapus — cuma backup).
- [ ] Pastikan asset/preview template baru (`clean-medical`, `friendly-care`)
      sudah tersedia di repo template (`nakespro-template`).
- [ ] Commit folder `prisma/migrations/`.
