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

## 4.2 Subdomain Provisioning

Subdomain `{nama}.nakespro.id` punya dua tahap: **reservasi nama** (otomatis saat client isi form) dan **go-live aktual** (saat Salman selesai build).

**Tahap 1 — Reservasi nama (otomatis):**
```
1. Saat isi form, client ketik nama subdomain (mis. "kliniksehat")
2. Sistem validasi real-time:
   - Format: lowercase, alfanumerik + tanda hubung, 3-30 karakter
   - Belum dipakai order lain (cek unik di tabel Order.subdomain)
   - Bukan reserved word (www, app, api, admin, mail, dll)
3. Valid → simpan ke Order.subdomain, set websiteUrl = https://{nama}.nakespro.id
4. Tampilkan preview: "Website kamu akan live di kliniksehat.nakespro.id"
```

**Tahap 2 — Go-live (saat build selesai):**
```
5. Salman selesai build website (manual/vibe coding)
6. Deploy ke Easypanel dengan host {nama}.nakespro.id
7. Set buildStatus = "done", isActive = true
8. Website live di subdomain
```

**Catatan teknis (DNS wildcard):**
- Set wildcard DNS `*.nakespro.id → VPS 96.9.231.66` di Cloudflare SEKALI
- Tiap subdomain baru otomatis resolve ke VPS tanpa nambah DNS record manual
- Easypanel yang handle routing per-subdomain ke service website client
- **Reservasi nama otomatis di app, tapi deploy aktual tetap manual oleh Salman** (konsisten dengan MVP build manual)

**Field di Order:**
- `subdomain` → nama yang direservasi (unik, validated)
- `websiteUrl` → full URL, di-set saat reservasi (https://{nama}.nakespro.id)
- `isActive` → false sampai Salman deploy & publish

---

## 4.3 Notifikasi Admin (WA/Telegram)

Salman dapat notifikasi otomatis saat ada event penting, biar gak perlu cek admin panel terus-terusan.

**Event yang trigger notifikasi:**
| Event | Isi notifikasi |
|---|---|
| Order baru dibuat | Nama client, paket, template pilihan |
| Client klaim sudah bayar | Order ID, jumlah (unique amount), link ke admin order |
| Form di-submit | Nama client, nama website, jumlah foto |
| Order jatuh tempo (renewal) | Nama client, website, jumlah tagihan |

**Pilihan channel:**
- **Telegram Bot** (rekomendasi MVP): gratis, API simpel, gampang setup. Bikin bot via @BotFather → kirim pesan ke chat Salman via Bot API
- **WhatsApp**: butuh WA Business API (berbayar/approval) atau unofficial lib (rawan ban). Skip untuk MVP

**Implementasi (Telegram):**
- Env var `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID`
- Helper `notifyAdmin(message)` → POST ke `https://api.telegram.org/bot{token}/sendMessage`
- Dipanggil di server action / route handler saat event terjadi
- Notifikasi ke CLIENT (mis. "website kamu sudah live") tetap manual via WA Salman untuk MVP

---

## 4.4 Konfirmasi Pembayaran (Semi-Otomatis)

Karena pakai QRIS static (tanpa payment gateway), konfirmasi pakai pola **semi-otomatis** — secepat mungkin tanpa cek mutasi manual.

**Alur:**
```
1. Client di /payment/[orderId] → scan QRIS static + bayar unique amount (Rp39.015)
2. Client klik tombol "Saya Sudah Bayar" + upload screenshot bukti transfer
3. Sistem set paymentStatus = "claimed" (klaim, belum dikonfirmasi) + simpan bukti ke R2
4. notifyAdmin() kirim ke Telegram: "Order #123, Rp39.015, [link bukti], [link admin]"
5. Salman buka link admin → cek bukti vs unique amount → klik "Confirm Payment"
6. paymentStatus = "paid", buildStatus → payment_confirmed
```

**Kenapa semi-otomatis, bukan full-auto:**
- Full webhook auto-confirm butuh payment gateway (Midtrans/iPaymu/Xendit) → semua perlu verifikasi badan usaha / app sudah production. Skip untuk MVP perorangan.
- Scraping m-banking dilarang ToS bank → tidak dipakai.
- Pola "klaim + upload bukti + admin 1-klik confirm" = ~10 detik kerja Salman, zero infra tambahan.

**paymentStatus values (update):** `pending` → `claimed` → `paid` | `cancelled`
- `pending`: order dibuat, belum ada klaim bayar
- `claimed`: client klaim sudah bayar + upload bukti (nunggu Salman konfirmasi)
- `paid`: Salman konfirmasi bukti valid
- `cancelled`: dibatalkan

**Field tambahan di Order:**
- `paymentProofUrl String?` — URL screenshot bukti transfer di R2
- `paymentClaimedAt DateTime?` — kapan client klik "Sudah Bayar"

**Upgrade path (Fase 2):** Migrasi ke Midtrans (sandbox langsung jalan, terima perorangan) untuk full webhook auto-confirm saat volume naik & usaha sudah resmi. Butuh halaman T&C, Refund Policy, FAQ (prasyarat semua gateway).

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

### 5.2 Dashboard Client (`/dashboard`)

Dashboard adalah halaman utama client setelah login. Detail yang sudah disubmit **tidak bisa di-edit sendiri** oleh client — semua revisi lewat WA. Ini bikin dashboard simpel & menghindari kebingungan.

**Komponen:**

1. **Progress Stepper** — status order saat ini:
   ```
   [✓] Pembayaran → [✓] Dikonfirmasi → [●] Sedang Dibuat → [ ] Review → [ ] Live
   ```
   - Status lewat → centang hijau; status aktif → highlight (dot/pulse); belum tercapai → abu-abu
   - Mapping label lihat section 6.4

2. **Action Card Kontekstual** — info + langkah berikutnya, tergantung status:
   - `awaiting_payment` → "Selesaikan pembayaran" + tombol ke halaman pembayaran
   - Form belum diisi → "Lengkapi detail website kamu" + tombol ke form
   - `designing` → "Tim sedang membuat website untuk kamu. Estimasi 2-3 hari."
   - `done` → "Website kamu sudah live!" + tombol Kunjungi Website

3. **Ringkasan Langganan**:
   - Paket: Hemat (Bulanan/Tahunan)
   - Status: Active / Pending / Suspended
   - Tanggal tagihan berikutnya (`nextBillingDate`) di-highlight

4. **Preview Data yang Disubmit** (read-only):
   - Ringkasan detail terisi (nama website, layanan, kontak, dst)
   - Revisi via WA jika diperlukan (tidak ada tombol edit)

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
  paymentStatus String   @default("pending") // pending | claimed | paid | cancelled
  paymentProofUrl String?            // URL screenshot bukti transfer di R2
  paymentClaimedAt DateTime?         // Kapan client klik "Sudah Bayar"
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

## 7.2 Setup & Scaffolding (Implementasi)

Keputusan teknis final untuk setup project (siap dieksekusi Claude CLI / manual).

### Scaffolding
- `npx create-next-app@latest .` dengan: TypeScript, ESLint, Tailwind, **src/ directory**, App Router, Turbopack, import alias `@/*`
- Bersihkan boilerplate `src/app/page.tsx` jadi landing minimal

### Dependencies
```
pnpm add prisma @prisma/client better-auth @aws-sdk/client-s3 sharp zod
pnpm add -D @types/node
```
- Pakai versi **latest** saat install (Prisma 7, Better Auth latest)
- `zod` untuk validasi form & API input

### TypeScript & ESLint
- Default Next.js: TS strict mode + `next/core-web-vitals`. Prioritas MVP speed, jangan over-strict.

### Prisma (v7)
- Generator: **`prisma-client`** (provider baru Prisma 7) dengan `output = "../src/generated/prisma"`
- Import client dari `@/generated/prisma`, bukan `@prisma/client`
- Singleton pattern di `src/lib/prisma.ts` (hindari multiple instance di dev hot-reload)
- **`.gitignore`**: tambah `src/generated/` (generated code jangan di-commit)
- **`package.json` scripts**: tambah `"postinstall": "prisma generate"` (WAJIB untuk deploy Easypanel — fresh install harus regenerate client)
- Schema: `subdomain @unique`, index `@@index([userId])` + `@@index([nextBillingDate, paymentStatus])`

### Auth — Better Auth
- `src/lib/auth.ts` (server instance): `prismaAdapter(prisma, { provider: "postgresql" })` + `baseURL: process.env.BETTER_AUTH_URL` + `secret: process.env.BETTER_AUTH_SECRET` + Google social provider
- `src/lib/auth-client.ts` (client): `createAuthClient()` — default same-origin, no baseURL untuk MVP
- `src/app/api/auth/[...all]/route.ts`: `toNextJsHandler(auth)` (export GET, POST)
- Setelah install: `npx @better-auth/cli generate --adapter prisma` → tambah model Session/Account/Verification + reconcile User (`emailVerified Boolean` wajib)
- **Google OAuth redirect URI** (set di Google Console saat konfigurasi kredensial):
  - Local: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://app.nakespro.id/api/auth/callback/google`
- Generate secret: `openssl rand -base64 32`

### Admin Protection — Dua Lapis (Better Auth gotcha)
Better Auth pakai Node API yang TIDAK jalan di Edge runtime middleware. **JANGAN** taruh cek email whitelist di `middleware.ts`.
- **Lapis 1 — `src/middleware.ts`** (Edge-safe, cek cookie ADA/nggak): `getSessionCookie(req)` dari `better-auth/cookies` → kalau `/admin/*` tanpa cookie → redirect `/auth/login`. Matcher: `["/admin/:path*"]`
- **Lapis 2 — `src/app/admin/layout.tsx`** (server component, cek email whitelist sebenarnya): `auth.api.getSession()` + cek `session.user.email ∈ ADMIN_EMAILS` → kalau bukan admin → `redirect("/dashboard")`

### File Upload — R2 (skeleton dulu)
- `src/lib/r2.ts`: skeleton S3Client + TODO `uploadToR2(key, buffer, contentType)`
- `src/app/api/upload/route.ts`: POST handler — auth check (Better Auth session) + validasi (tipe jpg/png/webp, maks 5MB) + TODO sharp compress → R2 → simpan OrderPhoto. Return 501 sementara.

### Telegram Helper (skeleton, graceful no-op)
- `src/lib/telegram.ts`: `notifyAdmin(message)` — kalau `TELEGRAM_BOT_TOKEN` kosong → `console.log` (no-op, jangan crash); kalau ada → POST ke Bot API. Fire-and-forget, no retry untuk MVP.

### .env.example
```
# Database
DATABASE_URL="postgresql://nakespro:PASSWORD@HOST:5432/nakespro_template"
# Better Auth
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
# Admin whitelist (comma-separated)
ADMIN_EMAILS="salman@nakespro.id"
# Cloudflare R2
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET="nakespro-uploads"
R2_PUBLIC_URL="https://cdn.nakespro.id"
# Telegram Bot
TELEGRAM_BOT_TOKEN=""
TELEGRAM_ADMIN_CHAT_ID=""
```

### Catatan Database
- Untuk dev lokal: pakai placeholder `DATABASE_URL` dulu, konfigurasi belakangan (lokal Docker Postgres / connect ke production)
- Production: shared container `askep_postgres` (host internal `askep_postgres:5432`), DB `nakespro_template`, superuser `nakespro`

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

## 8.1 Roadmap Fase 1.5 (Nyusul, setelah core stabil)

Fitur klinis tambahan untuk client Paket Hemat. **Dibangun setelah Fase 1 (website + payment + build manual) jalan & tervalidasi.** Tidak masuk MVP awal supaya launch cepat.

### Booking via WhatsApp
- Komponen booking di website client `{nama}.nakespro.id` (bukan di app)
- Pasien isi form ringkas (nama, keluhan, tanggal preferensi) → redirect `wa.me/62xxx?text=...` (prefilled)
- TANPA sistem slot/kalender, TANPA pembayaran via web — obrolan lanjut di WA nakes
- (Opsional Fase 1.5+) simpan record Booking ke DB biar muncul di dashboard nakes

### Laporan Tindakan
- Nakes login di `app.nakespro.id` → tulis laporan setelah selesai order
- **Manual** — nakes ketik sendiri (nama pasien + ringkasan tindakan + catatan). Tanpa auto-prefill dari booking, tanpa tabel Patient master (identitas pasien = teks bebas per laporan)
- Generate PDF → upload ke R2 → share via `wa.me` prefilled (link PDF)
- **Keamanan:** link pakai `shareToken` random + `expiresAt = createdAt + 7 hari` (link mati otomatis). Data tindakan pasien tidak boleh punya link publik permanen
- Istilah: "Laporan Tindakan" / "Ringkasan Kunjungan", BUKAN "CPPT" (CPPT punya bobot klinis/legal formal yang tidak perlu untuk ringkasan ini)

**Catatan arsitektur:** Booking yang menyimpan record (muncul di dashboard nakes) menarik multi-tenancy ringan (foreign key `nakesUserId` per Booking/Laporan, bukan isolasi DB). Laporan manual berdiri sendiri tanpa ketergantungan booking. Pertimbangkan saat masuk Fase 1.5.

---

## 9. Keputusan (Final)

| # | Topik | Keputusan |
|---|---|---|
| 1 | Paket di app | Hemat saja (Rp25-39rb/bln). Advance & Enterprise via WA manual |
| 2 | Billing | Bulanan (Rp39rb) atau Tahunan (Rp300rb) |
| 3 | Payment | QRIS static manual + unique amount. Konfirmasi semi-otomatis: client klik "Sudah Bayar" + upload bukti → notif Telegram → Salman 1-klik confirm |
| 4 | Renewal | QRIS manual tiap periode (bulanan/tahunan) |
| 5 | Telat bayar | Website dinonaktifkan sementara (bisa diaktifkan lagi setelah bayar) |
| 6 | Form submission | GAK GATE — submit kapan aja |
| 7 | File storage | Cloudflare R2 (server-route upload, 10GB free permanent + egress unlimited) |
| 8 | Template selection | Client pilih sendiri di app (4 template) setelah register, sebelum bayar |
| 9 | Urutan flow | Login → Pilih Billing → Pilih Template → Bayar → Isi Form → Build |
| 10 | Admin auth | Email whitelist via env `ADMIN_EMAILS`, dicek di middleware. Tanpa role system |
| 11 | Renewal reminder | Cron harian flag order jatuh tempo di admin panel; Salman kirim WA manual. Grace period 7 hari sebelum suspend |
| 12 | Build status | Client lihat progress via stepper di dashboard. 5 status: awaiting_payment → payment_confirmed → designing → review → done. Transisi manual oleh Salman (kecuali awaiting_payment) |
| 13 | Subdomain | Reservasi nama otomatis saat isi form (validasi unik + reserved word). Deploy aktual manual oleh Salman. DNS wildcard `*.nakespro.id` |
| 14 | Notifikasi admin | Otomatis via Telegram Bot (gratis, simpel). WA skip untuk MVP. Notif ke client tetap manual |
| 15 | Booking & Laporan Tindakan | Fase 1.5 (nyusul, BUKAN MVP awal). Booking = redirect WA. Laporan = manual ketik nakes, PDF + share token expiry 7 hari. Bukan "CPPT" |
| 16 | Tech stack setup | create-next-app (TS+Tailwind+src/+App Router+Turbopack). Prisma 7 (`prisma-client` gen → src/generated/prisma). Better Auth + Google OAuth. Admin protection 2 lapis (cookie di middleware + email whitelist di admin layout). Detail lihat section 7.2 |
| 17 | Konfirmasi pembayaran | Semi-otomatis (klaim + upload bukti + admin 1-klik). Full auto (Midtrans webhook) = Fase 2 saat ada badan usaha. iPaymu/Flip butuh TDPSE/verifikasi usaha, skip dulu (perorangan) |

---

*Untuk flow lengkap, lihat PRD.md*