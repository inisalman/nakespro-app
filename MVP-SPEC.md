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

## 4. User Flow (MVP)

```
1. Client buka nakespro.id → klik "Daftar Sekarang" (Paket Hemat)
2. Redirect ke app.nakespro.id/register?package=hemat
3. Login dengan Google (OAuth) — akun otomatis dibuat
4. Pilih billing: bulanan (Rp39rb) atau tahunan (Rp25rb/bln)
5. Halaman pembayaran:
   - Generate totalAmount = baseAmount + uniqueCode
   - Bulanan: Rp39.000 + order ID = Rp39.015 (misal)
   - Tahunan: Rp300.000 + order ID = Rp300.021 (misal)
   - Tampilkan QRIS static
   - Client bayar → pergi / logout
6. Client isi form detail (SUBMIT KAPAN AJA, gak gate):
   - Nama homecare/praktik
   - Deskripsi / tentang
   - Layanan: nakes / homecare / keduanya
   - Upload foto (nakes, ruangan, alat, hasil kerja)
   - Kontak: nomor WA, jam praktik, lokasi, Google Maps embed
7. Client submit form → Salman terima notifikasi (WA)
8. Salman confirm payment (admin panel) → mulai build
9. Selesai → Salman deploy ke {nama}.nakespro.id → kirim link via WA
10. Client login dashboard → lihat website link
11. Setiap periode (bulan/tahun): pengingat bayar via WA → ulangi step 5
```

**Catatan:** Form bisa disubmit SEBELUM atau SESUDAH pembayaran.

---

## 5. Halaman & Routes (app.nakespro.id)

| Route | Akses | Fungsi |
|---|---|---|
| `/auth/login` | Publik | Login dengan Google |
| `/auth/callback` | Publik | OAuth callback |
| `/register` | Auth | Pilih billing (bulanan/tahunan) |
| `/payment/[orderId]` | Auth | QRIS + amount unik |
| `/form/[orderId]` | Auth | Form detail (3 steps) + upload foto |
| `/dashboard` | Auth | Progress: payment, form, website link |
| `/admin` | Salman | List orders, confirm payment, update status |
| `/admin/orders/[id]` | Salman | Detail order + admin notes |

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
  
  // Billing
  billingCycle  String             // "monthly" | "yearly"
  baseAmount    Int                // 39000 (monthly) | 300000 (yearly)
  uniqueCode    Int                // order ID (1-999)
  totalAmount   Int                // baseAmount + uniqueCode
  paymentStatus String   @default("pending") // pending | paid | cancelled
  nextBillingDate DateTime?        // Kapan tagihan berikutnya
  
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
  
  // Status build
  buildStatus   String   @default("awaiting_payment")
  // awaiting_payment → payment_pending → designing → done
  
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

---

## 7. Stack Teknis

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (`nakespro_template` di `askep_postgres`) |
| ORM | Prisma v7 |
| Auth | Better Auth / NextAuth.js (Google OAuth) |
| File Upload | Local filesystem (MVP) |
| Payment | QRIS static (manual confirm) |
| Deploy | Easypanel (service `askep_nakespro-app`) |
| Domain | `app.nakespro.id` + wildcard `*.nakespro.id` |

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
| 7 | File storage | Local filesystem (MVP) |

---

*Untuk flow lengkap, lihat PRD.md*