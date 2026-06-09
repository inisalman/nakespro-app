# MVP-SPEC — NakesPro App (Paket Hemat)

**Repo:** `inisalman/nakespro-app`
**Domain:** `app.nakespro.id`
**Versi:** 1.0
**Tanggal:** Juni 2026
**Pemilik:** Salman Al Farisi
**Status:** MVP — Fase 1 Paket Hemat

---

## 1. Ringkasan Produk

**NakesPro App** mengelola flow pemesanan **Paket Hemat** — paket website template dengan harga terjangkau (Rp25-39rb/bln).

**Flow:**
Login Google → Bayar QRIS → Isi form detail website + foto → Salman build → Live di `{nama}.nakespro.id`

**Paket yang ditangani:**
- **Hemat Bulanan:** Rp39.000/bulan (ditagih bulanan)
- **Hemat Tahunan:** Rp25.000/bulan (ditagih Rp300.000/tahun)

**Paket lain (via WhatsApp, tidak di app ini):**
- Advance (custom design) — konsultasi manual via WA
- Enterprise (multi-site, integrasi) — konsultasi manual via WA

---

## 2. Arsitektur Domain Split

```
nakespro.id (Landing)
├── Paket Hemat CTA → "Daftar Sekarang" → app.nakespro.id
├── Paket Advance CTA → WhatsApp (manual)
└── Paket Enterprise CTA → WhatsApp (manual)

app.nakespro.id (App — repo ini)
├── /auth/login → Google OAuth
├── /register → Pilih Hemat (bulanan/tahunan)
├── /templates → Galeri 4 template (pilih)
├── /payment/[orderId] → QRIS + amount unik
├── /form/[orderId] → Detail website + foto
├── /dashboard → Progress client
└── /admin → Admin Salman

{nama}.nakespro.id (Client Website)
├── Powered by template pilihan
├── Content dari form input client
└── Hosted di Easypanel
```

---

## 3. Pricing & Billing

| Paket | Bulanan | Tahunan | Billing |
|---|---|---|---|
| **Hemat** | Rp39.000 | Rp300.000/tahun (Rp25rb/bln) | QRIS manual tiap periode |

**Catatan:**
- Tagihan bulanan: Rp39.000 + order ID (misal Rp39.015)
- Tagihan tahunan: Rp300.000 + order ID (misal Rp300.021)
- Telat bayar: website dinonaktifkan sementara (bisa diaktifkan lagi setelah bayar)

---

## 3.1 Katalog Template

Client pilih satu dari 4 template setelah register (sebelum bayar). Semua template responsive & dioptimasi untuk profil nakes/homecare.

| ID | Nama | Karakter | Cocok untuk |
|---|---|---|---|
| `modern-light` | Modern Light | Bersih, terang, profesional | Praktik mandiri, klinik kecil |
| `modern-dark` | Modern Dark | Elegan, gelap, premium | Layanan premium, homecare eksklusif |
| `playful-geometry` | Playful Geometry | Ceria, bentuk geometris, warna berani | Layanan anak, fisioterapi, wellness |
| `calm-warm` | Calm & Warm | Hangat, lembut, menenangkan | Perawatan lansia, mental health, home nursing |

**Catatan:**
- Preview tiap template ditampilkan di galeri `/templates` (screenshot/live demo)
- Template tersimpan sebagai koleksi di repo `nakespro-templates`
- Template bisa diganti via admin/WA selama build belum dimulai
- `templateId` di Order menentukan template yang dipakai saat build

---

## 4. User Flow (MVP)

```
1. Client buka nakespro.id → klik "Daftar Sekarang" (Paket Hemat)
2. Redirect ke app.nakespro.id/register?package=hemat
3. Login dengan Google (OAuth) — akun otomatis dibuat
4. Pilih billing: bulanan (Rp39rb) atau tahunan (Rp25rb/bln)
5. Pilih template (galeri 4 pilihan):
   - Modern Light, Modern Dark, Playful Geometry, Calm & Warm
   - Lihat preview tiap template → pilih satu → buat Order
6. Halaman pembayaran:
   - Generate totalAmount = baseAmount + uniqueCode
   - Bulanan: Rp39.000 + order ID = Rp39.015 (misal)
   - Tahunan: Rp300.000 + order ID = Rp300.021 (misal)
   - Tampilkan QRIS static
   - Client bayar → pergi / logout
7. Client isi form detail (SUBMIT KAPAN AJA, gak gate):
   - Nama homecare/praktik
   - Deskripsi / tentang
   - Layanan: nakes / homecare / keduanya
   - Upload foto (nakes, ruangan, alat, hasil kerja)
   - Kontak: nomor WA, jam praktik, lokasi, Google Maps embed
8. Client submit form → Salman terima notifikasi (WA)
9. Salman confirm payment (admin panel) → mulai build
10. Selesai → Salman deploy ke {nama}.nakespro.id → kirim link via WA
11. Client login dashboard → lihat website link
12. Setiap periode (bulan/tahun): pengingat bayar via WA → ulangi step 6
```

**Catatan:**
- Urutan: Login → Pilih Billing → Pilih Template → Bayar → Isi Form → Build
- Form bisa disubmit SEBELUM atau SESUDAH pembayaran
- Template bisa diganti via admin/WA sebelum build dimulai

---

## 4.1 Renewal Flow (Pembayaran Berulang)

**Siklus renewal:**
```
1. Order dibuat dengan nextBillingDate = createdAt + billingCycle (30 hari untuk monthly, 365 hari untuk yearly)
2. Tiap hari cron cek Order mana yang mendekati/lewat nextBillingDate
3. Order status "active" & nextBillingDate ≤ hari ini → masuk daftar "Perlu Reminder" di admin panel
4. Admin (Salman) kirim WA ke client: "Tagihan Anda untuk {websiteName} siap dibayar: Rp[amount]. QRIS: [link]"
5. Client bayar QRIS → notifikasi ke admin
6. Admin confirm payment di admin panel → update paymentStatus = "paid", hitung nextBillingDate baru
7. Website tetap aktif, order berlanjut
8. Telat bayar >7 hari (grace period) → website dinonaktifkan sementara (maintenance page, atau 503)
9. Setelah bayar → website aktif lagi, nextBillingDate di-update
```

**Di Admin Panel:**
- Widget "Orders Perlu Reminder" → list order dengan nextBillingDate ≤ hari ini
- Kolom status tiap order: "Active" (bayar on-time), "Pending Payment" (overdue tapi <7 hari), "Suspended" (overdue >7 hari)
- Action: mark as paid, update nextBillingDate, suspend/unsuspend website

**Implementasi:**
- Field `nextBillingDate` di Order → di-set saat order dibuat atau saat confirm payment
- Cron job (harian, mis. jam 06:00 pagi): query Order `WHERE nextBillingDate ≤ NOW() AND paymentStatus != 'paid'` → tampilin di admin panel
- Field `isActive` atau `suspendedAt` di Order → untuk track status website (active/suspended)
- Saat build selesai & website live → set `isActive = true`

---

## 5. Halaman & Routes (app.nakespro.id)

| Route | Akses | Fungsi |
|---|---|---|
| `/auth/login` | Publik | Login dengan Google |
| `/auth/callback` | Publik | OAuth callback |
| `/register` | Auth | Pilih billing (bulanan/tahunan) |
| `/templates` | Auth | Galeri 4 template + preview → pilih → buat Order |
| `/payment/[orderId]` | Auth | QRIS + amount unik |
| `/form/[orderId]` | Auth | Form detail (3 steps) + upload foto |
| `/dashboard` | Auth | Progress: payment, form, website link |
| `/admin` | Salman | List orders, confirm payment, update status |
| `/admin/orders/[id]` | Salman | Detail order + admin notes |

### 5.1 Admin Auth — Email Whitelist

Akses `/admin/*` dibatasi via **email whitelist** (cocok untuk MVP, tanpa role system).

```
1. Admin login pakai Google OAuth (sama seperti client biasa)
2. Middleware /admin/* cek: session.user.email ∈ ADMIN_EMAILS
3. Kalau cocok → akses admin panel
4. Kalau tidak → redirect ke /dashboard (atau 403)
```

**Implementasi:**
- Env var `ADMIN_EMAILS` = daftar email dipisah koma (mis. `salman@nakespro.id,salman.alt@gmail.com`)
- Cek di middleware Next.js (`middleware.ts`) untuk semua route `/admin/*`
- Tidak perlu field `role` di tabel User untuk MVP — whitelist cukup
- Migrasi ke role-based nanti kalau ada admin/staff tambahan

---

## 6. Data Model

### 6.1 Tabel: `User`

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  image         String?            // Google profile picture
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  orders        Order[]
}
```

### 6.2 Tabel: `Order`

```prisma
model Order {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  // Paket: Hemat saja (untuk MVP)
  packageType   String   @default("hemat") // "hemat"
  
  // Template pilihan (dipilih setelah register, sebelum bayar)
  templateId    String             // "modern-light" | "modern-dark" | "playful-geometry" | "calm-warm"
  
  // Billing
  billingCycle  String             // "monthly" | "yearly"
  baseAmount    Int                // 39000 (monthly) | 300000 (yearly)
  uniqueCode    Int                // order ID (1-999)
  totalAmount   Int                // baseAmount + uniqueCode
  paymentStatus String   @default("pending") // pending | paid | cancelled
  nextBillingDate DateTime?        // Kapan tagihan berikutnya
  lastPaidAt    DateTime?          // Kapan terakhir bayar dikonfirmasi
  
  // Status website (untuk renewal/suspend)
  isActive      Boolean  @default(false) // true saat website live & bayar lancar
  suspendedAt   DateTime?          // Diisi saat website dinonaktifkan (telat bayar >7 hari)
  
  // Detail website (diisi client via form)
  websiteName   String?            // Nama homecare/praktik
  description   String?            // Deskripsi / tentang
  serviceType   String?            // "nakes" | "homecare" | "both"
  waNumber      String?            // Nomor WA
  practiceHours String?            // "Senin-Sabtu, 08:00-17:00"
  location      String?            // Alamat / lokasi
  googleMaps    String?            // Embed URL
  
  // Foto-foto
  photos        OrderPhoto[]
  
  // Status build (lihat section 6.4 untuk transisi)
  buildStatus   String   @default("awaiting_payment")
  // awaiting_payment → payment_confirmed → designing → review → done
  
  // Subdomain website
  subdomain     String?            // "nama" dari "nama.nakespro.id"
  websiteUrl    String?            // Full URL: https://nama.nakespro.id
  
  // Notes dari Salman
  adminNotes    String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 6.3 Tabel: `OrderPhoto`

```prisma
model OrderPhoto {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  
  category  String             // "nakes" | "ruangan" | "alat" | "hasil"
  url       String             // URL foto di storage
  caption   String?
  
  createdAt DateTime @default(now())
}
```

### 6.4 Build Status — Transisi & Dashboard Client

`buildStatus` melacak progress order dari bayar sampai website live. Sebagian transisi otomatis, sebagian manual oleh Salman.

| Status | Arti | Dipicu oleh | Otomatis/Manual |
|---|---|---|---|
| `awaiting_payment` | Order dibuat, belum bayar | Order dibuat (setelah pilih template) | Otomatis |
| `payment_confirmed` | Bayar dikonfirmasi Salman | Salman klik "Confirm Payment" di admin | Manual |
| `designing` | Salman lagi bangun website | Salman klik "Mulai Build" di admin | Manual |
| `review` | Website siap, nunggu cek client | Salman klik "Kirim untuk Review" | Manual |
| `done` | Website live di subdomain | Salman klik "Publish" (set websiteUrl + isActive) | Manual |

**Catatan transisi:**
- Form bisa diisi client kapan aja, GAK ngubah buildStatus (independen)
- `payment_confirmed` butuh dua syarat ideal: bayar masuk + form sudah diisi. Tapi Salman bisa override (mis. follow-up form via WA)
- `review` opsional — Salman bisa langsung ke `done` kalau yakin

**Tampilan di Dashboard Client (`/dashboard`):**

Stepper visual horizontal/vertical yang nunjukin posisi order sekarang:

```
[✓] Pembayaran    [✓] Dikonfirmasi    [●] Sedang Dibuat    [ ] Review    [ ] Live
     lunas             oleh tim            estimasi 2-3 hari
```

- Step yang udah lewat → centang hijau
- Step aktif sekarang → highlight (dot/pulse)
- Step belum tercapai → abu-abu
- Mapping status ke label client-friendly:
  - `awaiting_payment` → "Menunggu Pembayaran"
  - `payment_confirmed` → "Pembayaran Dikonfirmasi"
  - `designing` → "Website Sedang Dibuat"
  - `review` → "Siap Direview"
  - `done` → "Website Live" + tombol "Kunjungi Website" (ke websiteUrl)
- Kalau ada `adminNotes` yang relevan → tampilin sebagai catatan dari tim (opsional)

---

## 7. Stack Teknis

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (`nakespro_template` di `askep_postgres`) |
| ORM | Prisma v7 |
| Auth | Better Auth / NextAuth.js (Google OAuth) |
| File Upload | Cloudflare R2 (server-route upload via `/api/upload`) |
| File Storage | 10GB free tier (permanent), egress unlimited |
| Payment | QRIS static (manual confirm) |
| Deploy | Easypanel (service `askep_nakespro-app`) |
| Domain | `app.nakespro.id` + wildcard `*.nakespro.id` |

---

## 7.1 File Upload — Cloudflare R2

**Metode:** Server-route upload (client → Next.js API → R2). Dipilih untuk MVP karena lebih sederhana & aman: kredensial R2 tidak pernah ke-expose ke browser, validasi (tipe file, ukuran, kompresi) terpusat di server.

**Alur:**
```
1. Client pilih foto di /form/[orderId] (input file, multiple)
2. Browser POST multipart/form-data → POST /api/upload
3. Server (Next.js route handler):
   a. Validasi: auth user, tipe (jpg/png/webp), ukuran (maks 5MB/foto)
   b. (Opsional) kompres/resize via sharp sebelum simpan
   c. PutObject ke R2 via @aws-sdk/client-s3 (S3-compatible)
   d. Key: orders/{orderId}/{category}/{uuid}.{ext}
   e. Simpan row OrderPhoto (url, category, caption) ke Postgres
4. Server balikin URL publik → client render preview
```

**Konfigurasi R2:**
| Item | Nilai |
|---|---|
| Bucket | `nakespro-uploads` |
| Akses publik | Via custom domain `cdn.nakespro.id` (R2 public bucket / custom domain) |
| SDK | `@aws-sdk/client-s3` (endpoint R2: `https://<accountid>.r2.cloudflarestorage.com`) |
| Env | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL` |

**Batasan upload (MVP):**
- Format: JPG, PNG, WEBP
- Ukuran maks: 5MB per foto
- Maks foto per order: 20 (cukup untuk nakes, ruangan, alat, hasil kerja)

**Kenapa server-route, bukan pre-signed URL?**
- MVP: validasi & kompresi terpusat lebih mudah di-maintain
- Kredensial R2 tidak ke-expose ke client
- Trade-off: foto lewat server (sedikit beban bandwidth VPS), tapi untuk volume MVP (foto kecil, jarang) ini negligible
- Bisa migrasi ke pre-signed URL nanti kalau volume upload naik

---

## 8. Roadmap MVP (Fase 1)

### Sprint 1 — Setup & Auth (3-4 hari)
- [ ] Next.js 16 + Prisma + Tailwind v4
- [ ] Google OAuth (Better Auth)
- [ ] Database schema
- [ ] Landing redirect ke app

### Sprint 2 — Core Flow (5-7 hari)
- [ ] Register: pilih bulanan/tahunan
- [ ] Payment QRIS halaman
- [ ] Form detail (3 steps)
- [ ] File upload

### Sprint 3 — Dashboard & Admin (4-5 hari)
- [ ] Client dashboard (progress + link website)
- [ ] Admin panel (list orders, confirm payment)
- [ ] WA notification

### Sprint 4 — Deploy (2-3 hari)
- [ ] Easypanel setup
- [ ] DNS wildcard
- [ ] E2E testing

**Total:** ~2-3 minggu untuk MVP.

---

## 9. Keputusan (Final)

| # | Topik | Keputusan |
|---|---|---|
| 1 | Paket di app | Hemat saja (Rp25-39rb/bln). Advance & Enterprise via WA manual |
| 2 | Billing | Bulanan (Rp39rb) atau Tahunan (Rp300rb) |
| 3 | Payment | QRIS manual + unique amount, confirm manual Salman |
| 4 | Renewal | QRIS manual tiap periode (bulanan/tahunan) |
| 5 | Telat bayar | Website dinonaktifkan sementara (bisa diaktifkan lagi setelah bayar) |
| 6 | Form submission | GAK GATE — submit kapan aja |
| 7 | File storage | Cloudflare R2 (server-route upload, 10GB free permanent + egress unlimited) |
| 8 | Template selection | Client pilih sendiri di app (4 template) setelah register, sebelum bayar |
| 9 | Urutan flow | Login → Pilih Billing → Pilih Template → Bayar → Isi Form → Build |
| 10 | Admin auth | Email whitelist via env `ADMIN_EMAILS`, dicek di middleware. Tanpa role system |
| 11 | Renewal reminder | Cron harian flag order jatuh tempo di admin panel; Salman kirim WA manual. Grace period 7 hari sebelum suspend |
| 12 | Build status | Client lihat progress via stepper di dashboard. 5 status: awaiting_payment → payment_confirmed → designing → review → done. Transisi manual oleh Salman (kecuali awaiting_payment) |

---

*Untuk flow lengkap, lihat PRD.md*