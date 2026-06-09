# MVP-SPEC — NakesPro Custom Service (Fase 1)

**Repo:** `inisalman/nakespro-app`
**Domain:** `app.nakespro.id`
**Versi:** 1.0
**Tanggal:** Juni 2026
**Pemilik:** Salman Al Farisi
**Status:** MVP — Fase 1 Custom Service

---

## 1. Ringkasan Produk

**Fase 1 — Custom Service (MVP):**
Klien pilih paket di landing (`nakespro.id`) → redirect ke app (`app.nakespro.id`) → login Google → pilih template → bayar QRIS manual → isi form detail website + upload foto → submit → **Salman build manual** → deliver link di subdomain (`nama.nakespro.id`).

**Fase 2 — Template SaaS (Multi-Tenant):**
Platform SaaS multi-tenant self-service. Semua flow otomatis. (Plan later, bukan bagian MVP ini.)

**Harga:**
- **Custom (Fase 1):** Rp2.000.000 one-off (via QRIS)
- **Template (Fase 1):** Rp20.000/bulan (via QRIS)

---

## 2. Arsitektur Domain Split

```
┌─────────────────────────────────────────────────────┐
│  nakespro.id (Landing - Repo: inisalman/nakespro)  │
│  ├── Hero: Paket Custom / Template                 │
│  ├── /templates → galeri 4 template                │
│  └── Pricing → CTA ke app.nakespro.id              │
└─────────────────────────────────────────────────────┘
                          ↓
                  (redirect/link)
                          ↓
┌─────────────────────────────────────────────────────┐
│  app.nakespro.id (App - Repo: nakespro-app)        │
│  ├── /auth/login → Google OAuth                     │
│  ├── /custom/register → pilih template Custom       │
│  ├── /template/register → pilih template Template   │
│  ├── /payment/[orderId] → QRIS                      │
│  ├── /form/[orderId] → detail website + foto        │
│  ├── /dashboard → progress client                   │
│  └── /admin → admin Salman                          │
└─────────────────────────────────────────────────────┘
                          ↓
            (Salman build, deploy ke)
                          ↓
┌─────────────────────────────────────────────────────┐
│  {nama}.nakespro.id (Client Website)               │
│  ├── Powered by template yang dipilih               │
│  ├── Content dari form input client                 │
│  └── Hosted di server Salman (Easypanel)           │
└─────────────────────────────────────────────────────┘
```

---

## 3. Templatelist

| Nama Template | Deskripsi |
|---|---|
| Modern Light | Desain bernuansa terang, simpel, dengan elemen clean |
| Modern Dark | Desain dengan latar gelap, konten kontras |
| Playful Geometry | Desain fun dengan elemen geometris, warna ceria |
| Calm and Warm | Desain bernuansa hangat, cocok untuk homecare |

**Catatan:** Setiap template tersedia untuk customisasi content sesuai kebutuhan client.

---

## 4. User Flow (MVP)

```
1. Client buka nakespro.id → klik "Custom Website" atau "Template Website"
2. CTA redirect ke app.nakespro.id/custom?template=modern-light (atau pre-selected)
3. Login dengan Google (OAuth) — akun otomatis dibuat
4. Konfirmasi pilihan template (atau pilih ulang)
5. Halaman pembayaran:
   - Custom: QRIS, totalAmount = 2.000.000 + order ID (misal Rp2.000.021)
   - Template: QRIS, totalAmount = 20.000 + order ID (misal Rp20.021)
   - Client bayar → pergi / logout
6. Client bisa langsung isi form detail (SUBMIT KAPAN AJA, gak gate):
   - Nama homecare/praktik
   - Deskripsi / tentang
   - Layanan: nakes saja / homecare saja / keduanya
   - Upload foto (nakes, ruangan, alat, hasil kerja)
   - Kontak: nomor WA, jam praktik, lokasi, Google Maps embed
7. Client submit form → Salman terima notifikasi (WA)
8. Salman confirm payment (admin panel) → mulai build
9. Selesai → Salman deploy ke {nama}.nakespro.id → kirim link website via WA
```

**Catatan:** Form bisa disubmit SEBELUM atau SESUDAH pembayaran. Salman filter di admin: "Form submitted" → cek apakah sudah paid → kalau belum, build tapi tagih dulu.

---

## 5. Halaman & Routes (app.nakespro.id)

| Route | Akses | Fungsi |
|---|---|---|
| `/auth/login` | Publik | Login dengan Google |
| `/auth/callback` | Publik | OAuth callback |
| `/custom/register` | Auth | Pilih template Custom |
| `/template/register` | Auth | Pilih template Template |
| `/payment/[orderId]` | Auth | QRIS + amount unik |
| `/form/[orderId]` | Auth | Form detail website + upload foto |
| `/dashboard` | Auth | Progress: payment, form, link website |
| `/admin` | Salman | Admin panel: list orders |
| `/admin/orders/[id]` | Salman | Detail order + update status |

---

## 6. Model Pembayaran

### 6.1 Proses Pembayaran

Untuk paket Template yang berlangganan Rp20rb/bulan:
- **Pengingat Pembayaran** via email/WA bulanan.
- Website akan dinonaktifkan sementara jika pembayaran tidak dilakukan sebelum tanggal jatuh tempo.

### 6.2 Order custom

Untuk paket Custom Rp2jt:
- Seluruh design disimpan di repository `nakespro-custom-{client}`.

---

## 7. Data Model

### 7.1 Tabel: `User` (Client yang register)

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

### 7.2 Tabel: `Order`

```prisma
model Order {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  
  // Paket
  packageType   String             // "custom" | "template"
  templateId    String             // Template yang dipilih
  
  // Payment
  baseAmount    Int                // 2000000 (custom) atau 20000 (template)
  uniqueCode    Int                // order ID, misal 21
  totalAmount   Int                // baseAmount + uniqueCode
  paymentStatus String   @default("pending") // pending | paid | cancelled
  billingCycle  String   @default("one-time") // "one-time" (custom) | "monthly" (template)
  
  // Detail website (diisi client via form)
  websiteName   String?            // Nama homecare/praktik
  description   String?            // Deskripsi / tentang
  serviceType   String?            // "nakes" | "homecare" | "both"
  waNumber      String?            // Nomor WA
  practiceHours String?            // "Senin-Sabtu, 08:00-17:00"
  location      String?            // Alamat / lokasi
  googleMaps    String?            // Embed URL
  
  // Foto-foto (upload ke storage, simpan URL)
  photos        OrderPhoto[]
  
  // Status build
  buildStatus   String   @default("awaiting_payment")
  // awaiting_payment → payment_pending → designing → revision → done
  
  // Subdomain website (generated saat selesai)
  subdomain     String?            // "nama" dari "nama.nakespro.id"
  
  // Notes dari Salman
  adminNotes    String?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

### 7.3 Tabel: `OrderPhoto`

```prisma
model OrderPhoto {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  
  category  String             // "nakes" | "ruangan" | "alat" | "hasil" | "lain"
  url       String             // URL foto di storage
  caption   String?
  
  createdAt DateTime @default(now())
}
```

---

## 8. Stack Teknis

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR + API routes |
| Styling | Tailwind CSS v4 | Sama seperti landing |
| Database | PostgreSQL (`nakespro_template` di `askep_postgres`) | Reuse existing |
| ORM | Prisma v7 | Tipe aman |
| Auth | Better Auth / NextAuth.js | Google OAuth |
| File Upload | Local filesystem (MVP) atau S3/R2 (later) | Simpel, upgrade later |
| Payment | QRIS static (manual confirm) | MVP phase |
| Deploy | Easypanel (VPS 96.9.231.66) | Service `askep_nakespro-app` |
| Domain | `app.nakespro.id` (wildcard untuk client: `*.nakespro.id`) | Landing di `nakespro.id` |

---

## 9. DNS & Hosting Setup

### 9.1 Cloudflare DNS

| Record | Type | Value | Catatan |
|---|---|---|---|
| `nakespro.id` | A | `96.9.231.66` | Landing (Easypanel service `askep_nakespro`) |
| `app.nakespro.id` | A | `96.9.231.66` | App (Easypanel service `askep_nakespro-app`) |
| `*.nakespro.id` | A | `96.9.231.66` | Client websites (wildcard) |

### 9.2 SSL Certificates

- **nakespro.id**: Let's Encrypt via Easypanel
- **app.nakespro.id**: Let's Encrypt via Easypanel
- ***.nakespro.id**: Wildcard Let's Encrypt via Easypanel (DNS challenge)

---

## 10. Roadmap MVP (Fase 1)

### Sprint 1 — Setup & Auth
- [ ] Buat repo `inisalman/nakespro-app`
- [ ] Setup Next.js 16 + Prisma + Tailwind v4
- [ ] Setup Google OAuth (Better Auth)
- [ ] Database schema: User, Order, OrderPhoto
- [ ] Landing page redirect ke app.nakespro.id

### Sprint 2 — Core Flow
- [ ] Halaman register + pilih template (pre-select dari query param)
- [ ] Halaman payment: QRIS + amount unik
- [ ] Halaman form detail (3 steps)
- [ ] File upload (local storage)
- [ ] Auto-save form

### Sprint 3 — Dashboard & Admin
- [ ] Client dashboard (progress tracker)
- [ ] Admin panel: list orders
- [ ] Admin panel: order detail + confirm payment
- [ ] WA notification (Twilio / manual link)

### Sprint 4 — Integration & Deploy
- [ ] Setup Easypanel service `askep_nakespro-app`
- [ ] DNS wildcard `*.nakespro.id`
- [ ] Testing E2E

---

## 11. Keputusan (Final)

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | Domain | 3 domain: `nakespro.id` (landing), `app.nakespro.id` (app), `{nama}.nakespro.id` (client) |
| 2 | Paket | 2 paket: Custom (Rp2jt one-off) + Template (Rp20rb/bln) |
| 3 | Build | Keduanya manual oleh Salman di MVP (vipe coding) |
| 4 | Auth | Google OAuth (Better Auth / NextAuth.js) |
| 5 | Payment | QRIS Manual — Salman confirm via admin |
| 6 | Form submission | GAK GATE — submit kapan aja, sebelum atau sesudah bayar |
| 7 | File upload | Local storage (MVP), upgrade ke S3/R2 later |
| 8 | Template list | Tampilkan 4 template di halaman preview |
| 9 | Pre-select template | Query param dari landing → pre-fill di app |

---

*Dokumen ini terus diperbarui sesuai perkembangan proyek.*