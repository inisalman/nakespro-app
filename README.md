# NakesPro App

Aplikasi untuk mengelola pemesanan jasa pembuatan website tenaga kesehatan mandiri.

**Domain:** `app.nakespro.id`

## Fitur

- **Register** — Login via Google OAuth
- **Pilih Paket** — Custom (Rp2jt) atau Template (Rp20rb/bln)
- **Payment** — QRIS manual dengan unique amount
- **Form Detail** — Input data website + upload foto
- **Dashboard** — Track progress pemesanan
- **Admin Panel** — Confirm payment, update build status

## Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma v7
- **Auth:** Better Auth (Google OAuth)
- **Deploy:** Easypanel VPS

## Development

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

## Dokumentasi

- **PRD.md** — Deskripsi produk & roadmap
- **MVP-SPEC.md** — Spesifikasi teknis lengkap

## Hubungan dengan Repo Lain

| Repo | Fungsi | Domain |
|---|---|---|
| `inisalman/nakespro` | Landing page marketing | `nakespro.id` |
| `inisalman/nakespro-app` | App (repo ini) | `app.nakespro.id` |
| — | Website client | `{nama}.nakespro.id` |