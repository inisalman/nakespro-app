# PRD — NakesPro App (nakespro-app)

**Repo:** `inisalman/nakespro-app`
**Domain:** `app.nakespro.id`
**Versi:** 1.0
**Tanggal:** Juni 2026
**Pemilik:** Salman Al Farisi
**Status:** MVP — Fase 1 Custom Service

---

## 1. Ringkasan Produk

**NakesPro App** adalah aplikasi untuk mengelola flow pemesanan jasa pembuatan website nakes — mulai dari registrasi, pilih paket, pembayaran QRIS manual, isi form detail website, hingga tracking progress build.

Aplikasi ini menerima traffic dari landing page (`nakespro.id`), mengelola client orders, dan admin panel buat Salman untuk confirm payment & track build status.

**Paket yang dijual:**
- **Custom:** Rp2.000.000 one-off
- **Template:** Rp20.000/bulan

**Output:** Website client di subdomain `{nama}.nakespro.id`

---

## 2. Tujuan & Sasaran

### Tujuan
- Aplikasi yang mengotomasi flow order → form → tracking.
- Admin panel untuk Salman manage payment & build status.
- Notifikasi client progress (optional, MVP bisa sederhana).

### Metrik Sukses
- App live di `app.nakespro.id` ✅
- Google OAuth login berfungsi
- QRIS payment tracking manual
- Admin panel operable

---

## 3. Target Pengguna

| Persona | Kebutuhan |
|---|---|
| **Client (Nakes/Homecare)** | Register, pilih paket, bayar, isi form, track progress |
| **Admin (Salman)** | Lihat orders, confirm payment, update build status |

---

## 4. Hubungan dengan Repo Lain

```
Landing (inisalman/nakespro)
  ├── Paket: Custom / Template
  ├── Galeri: 4 template
  └── CTA: redirect ke app.nakespro.id
              ↓
         (query param: ?template=modern-light)
              ↓
App (inisalman/nakespro-app) ← repo ini
  ├── Google OAuth login
  ├── Confirm pilihan template
  ├── Payment QRIS
  ├── Form detail website
  ├── Admin: confirm payment, track build
  └── Output: link website client
              ↓
         Website Client ({nama}.nakespro.id)
```

Untuk detail lengkap flow, lihat **MVP-SPEC.md** di repo ini.

---

## 5. Stack Teknis

| Layer | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (`nakespro_template` di `askep_postgres`) |
| ORM | Prisma v7 |
| Auth | Better Auth / NextAuth.js (Google OAuth) |
| Deploy | Easypanel VPS (service `askep_nakespro-app`) |

---

## 6. Roadmap

### Sprint 1 — Setup & Auth (target: 3-4 hari)
- [ ] Next.js 16 + Prisma + Tailwind v4 setup
- [ ] Google OAuth (Better Auth)
- [ ] Database schema migration
- [ ] Landing redirect ke app

### Sprint 2 — Core Flow (target: 5-7 hari)
- [ ] Register + template picker
- [ ] Payment QRIS halaman
- [ ] Form detail (3 steps)
- [ ] File upload

### Sprint 3 — Dashboard & Admin (target: 4-5 hari)
- [ ] Client dashboard
- [ ] Admin panel
- [ ] WA notification

### Sprint 4 — Deploy (target: 2-3 hari)
- [ ] Easypanel setup
- [ ] DNS & SSL
- [ ] E2E testing

**Total estimate:** ~2-3 minggu untuk MVP.

---

## 7. Keputusan (Final)

| # | Topik | Keputusan |
|---|---|---|
| 1 | Payment | QRIS Manual — Salman confirm via admin |
| 2 | Pre-select template | Query param dari landing → auto-fill di app |
| 3 | Form submission | GAK GATE — submit kapan aja |
| 4 | Notifikasi | WA redirect link (gratis, MVP) |
| 5 | File storage | Local filesystem (MVP), S3/R2 later |

---

*Untuk detail lengkap teknis & arsitektur, lihat MVP-SPEC.md*