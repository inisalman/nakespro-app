# PRD — NakesPro App (nakespro-app)

**Repo:** `inisalman/nakespro-app`
**Domain:** `app.nakespro.id`
**Versi:** 1.0
**Tanggal:** Juni 2026
**Pemilik:** Salman Al Farisi
**Status:** MVP — Fase 1 Paket Hemat

---

## 1. Ringkasan Produk

**NakesPro App** adalah aplikasi untuk mengelola flow pemesanan **Paket Hemat** — paket website template terjangkau untuk nakes. Mulai dari registrasi, pembayaran QRIS manual, isi form detail website, hingga tracking progress build.

Aplikasi ini menerima traffic dari landing page (`nakespro.id`), khusus untuk **Paket Hemat**. Paket Advance & Enterprise ditangani manual via WhatsApp.

**Paket di app ini:**
- **Hemat Bulanan:** Rp39.000/bulan
- **Hemat Tahunan:** Rp25.000/bulan (ditagih Rp300.000/tahun)

**Output:** Website client di subdomain `{nama}.nakespro.id`

---

## 2. Tujuan & Sasaran

### Tujuan
- Otomasi flow order Paket Hemat: register → bayar → form → tracking.
- Admin panel untuk Salman manage payment & build status.
- Renewal tracking (QRIS manual tiap periode).

### Metrik Sukses
- App live di `app.nakespro.id`
- Google OAuth login berfungsi
- QRIS payment tracking manual
- Admin panel operable
- Client bisa lihat website link di dashboard

---

## 3. Target Pengguna

| Persona | Kebutuhan |
|---|---|
| **Client (Nakes Paket Hemat)** | Register, bayar, isi form, track progress, lihat website |
| **Admin (Salman)** | Lihat orders, confirm payment, update build status, kelola renewal |

---

## 4. Scope: Paket Hemat Saja

| Paket | Channel | Alasan |
|---|---|---|
| **Hemat** (Rp25-39rb/bln) | ✅ App ini | Volume tinggi, perlu otomasi |
| **Advance** (Rp166-200rb/bln) | ❌ WhatsApp manual | Custom design, butuh konsultasi |
| **Enterprise** (custom) | ❌ WhatsApp manual | Kompleks, multi-site, integrasi |

App ini fokus ke Paket Hemat karena volume-nya yang tinggi dan flow-nya repetitif (cocok untuk otomasi). Paket premium butuh sentuhan personal via WA.

---

## 5. Hubungan dengan Repo Lain

```
Landing (inisalman/nakespro)
├── Paket Hemat → "Daftar Sekarang" → app.nakespro.id
├── Paket Advance → WhatsApp
└── Paket Enterprise → WhatsApp
              ↓
App (inisalman/nakespro-app) ← repo ini
├── Login Google → bayar → form → tracking
└── Output: link website client
              ↓
         Website Client ({nama}.nakespro.id)
```

Untuk detail teknis & arsitektur, lihat **MVP-SPEC.md** di repo ini.

---

## 6. Stack Teknis

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (`nakespro_template` di `askep_postgres`) |
| ORM | Prisma v7 |
| Auth | Better Auth / NextAuth.js (Google OAuth) |
| Deploy | Easypanel VPS (service `askep_nakespro-app`) |

---

## 7. Roadmap

### Sprint 1 — Setup & Auth (3-4 hari)
- [ ] Next.js 16 + Prisma + Tailwind v4 setup
- [ ] Google OAuth (Better Auth)
- [ ] Database schema migration
- [ ] Landing redirect ke app

### Sprint 2 — Core Flow (5-7 hari)
- [ ] Register: pilih billing (bulanan/tahunan)
- [ ] Payment QRIS halaman
- [ ] Form detail (3 steps)
- [ ] File upload

### Sprint 3 — Dashboard & Admin (4-5 hari)
- [ ] Client dashboard (progress + link website)
- [ ] Admin panel (list orders, confirm payment)
- [ ] WA notification

### Sprint 4 — Deploy (2-3 hari)
- [ ] Easypanel setup
- [ ] DNS & SSL
- [ ] E2E testing

**Total estimate:** ~2-3 minggu untuk MVP.

---

## 8. Keputusan (Final)

| # | Topik | Keputusan |
|---|---|---|
| 1 | Paket di app | Hemat saja. Advance & Enterprise via WA manual |
| 2 | Billing | Bulanan (Rp39rb) atau Tahunan (Rp300rb) |
| 3 | Payment | QRIS Manual — Salman confirm via admin |
| 4 | Renewal | QRIS manual tiap periode |
| 5 | Telat bayar | Website suspended sementara |
| 6 | Form submission | GAK GATE — submit kapan aja |
| 7 | Notifikasi | WA redirect link (gratis, MVP) |
| 8 | File storage | Local filesystem (MVP), S3/R2 later |

---

*Untuk detail lengkap teknis & arsitektur, lihat MVP-SPEC.md*