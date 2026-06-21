# Statistik Kunjungan — Design Doc

**Tanggal:** 2026-06-21
**Status:** Disetujui (brainstorming), menunggu implementation plan
**Pemilik:** Salman Al Farisi
**Repo:** `inisalman/nakespro-app`

---

## 1. Latar Belakang

Kartu "Pengunjung Bulan Ini" di `/dashboard` saat ini menampilkan angka dummy (124, +12%). Nakes perlu data kunjungan website mereka yang asli untuk:

- Mengukur apakah website mereka bekerja (apakah ada yang lihat)
- Memantau tren dari waktu ke waktu
- Tahu halaman mana yang paling banyak dikunjungi

Output: halaman baru `/dashboard/statistik` dengan metrik lengkap + kartu ringkas di `/dashboard` pakai data nyata.

---

## 2. Goals & Non-Goals

### Goals
- Nakes bisa lihat total kunjungan, pengunjung unik, dan pertumbuhan %
- Tren harian 7/30/90 hari
- Top pages & top referrers
- Data dikumpulkan via beacon client-side, disimpan di DB sendiri
- Privacy-friendly: tidak simpan IP asli, hanya hash

### Non-Goals
- Real-time dashboard (refresh ≤5 menit cukup)
- Breakdown device/browser (bisa ditambah nanti)
- Heatmap / session recording
- Filter custom rentang waktu bebas (hanya preset 7/30/90)
- Export PDF/CSV (belum diminta)

---

## 3. Arsitektur

```
┌──────────────────────┐         ┌──────────────────────┐
│  {nama}.nakespro.id  │         │   app.nakespro.id    │
│  (static site di R2) │         │  (Next.js 16 app)    │
│                      │  POST   │                      │
│  <script src=track.js│────────▶│  /api/track          │
│   defer></script>    │  beacon │       │              │
│                      │         │       ▼              │
└──────────────────────┘         │  hash(IP+UA)         │
                                 │       │              │
                                 │       ▼              │
                                 │  INSERT PageView     │
                                 │       │              │
                                 │       ▼              │
                                 │  PostgreSQL          │
                                 │                      │
                                 │  /dashboard/         │
                                 │  statistik ──────────▶│ analytics.ts ─▶ DB
                                 └──────────────────────┘
```

**Aliran baca**: Halaman dashboard agregasi on-the-fly via `lib/analytics.ts`, cache in-memory 5 menit per `orderId`.

---

## 4. Skema Database

Tambah model `PageView` di `prisma/schema.prisma`. Relasi: `Order` 1-N `PageView`.

```prisma
model PageView {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  // Identifier pengunjung (hash IP+UA, rolling 24 jam)
  visitorHash String

  // Data kunjungan
  path        String
  referrer    String?
  userAgent   String   // untuk breakdown device nanti

  createdAt   DateTime @default(now())

  @@index([orderId, createdAt])
  @@index([orderId, visitorHash, createdAt])
}
```

**Mengapa `orderId` bukan `userId`**: subdomain terikat ke `Order`. Satu user理论上 bisa punya beberapa order (mis. re-register). Lookup dari subdomain lebih natural via `orderId`.

**Privacy**: IP asli tidak pernah masuk DB. Hanya SHA-256 hash. `userAgent` disimpan mentah untuk agregasi device nanti (bukan untuk identifikasi personal — UA di-truncate ke 200 char).

---

## 5. Komponen

### 5.1 `public/track.js` (static, ~30 baris)

- Baca subdomain dari `window.location.host` (strip `.nakespro.id`)
- Baca `document.referrer`
- Kirim `POST https://app.nakespro.id/api/track` dengan `navigator.sendBeacon`
- Fallback `fetch` dengan `keepalive: true`
- Payload JSON: `{ subdomain, path, referrer }`
- IP & User-Agent dibaca di server (bukan dari client)
- File di-cache Next.js, di-serve dari `/_next/static` setelah build. `public/track.js` di-serve langsung.

### 5.2 `src/app/api/track/route.ts` (POST)

- Validasi body: `{ subdomain: string, path: string, referrer: string | null }`
- Lookup `Order` by `subdomain` → `orderId`
- Hash `IP + User-Agent` pakai `crypto.createHash('sha256')` → `visitorHash`
- Insert `PageView`
- Response `204 No Content` (fire-and-forget dari client)
- CORS: `Access-Control-Allow-Origin: *` (karena host client bervariasi)
- Rate limit: per IP max 60 hit/menit via in-memory Map (cukup untuk MVP, scaling nanti)
- Header reading: `x-forwarded-for` (kalau ada di belakang proxy) atau `request.ip`

### 5.3 `src/lib/analytics.ts`

Fungsi exported:

```ts
// KPI untuk kartu ringkas
getMonthlyKpi(orderId: string): Promise<{
  thisMonth: number
  lastMonth: number
  growthPct: number  // -100..Infinity
}>

// Statistik lengkap
getVisitorStats(orderId: string, days: number): Promise<{
  total: number
  unique: number
  growthPct: number  // vs periode sebelumnya
  daily: Array<{ date: string /* YYYY-MM-DD */, total: number, unique: number }>
}>

// Top pages
getTopPages(orderId: string, days: number, limit?: number): Promise<
  Array<{ path: string; count: number; pct: number }>
>

// Top referrers
getReferrers(orderId: string, days: number, limit?: number): Promise<
  Array<{ referrer: string | null /* null = direct */; count: number; pct: number }>
>
```

**Implementasi**: Prisma `groupBy` di level hari, `count(distinct visitorHash)` via `prisma.$queryRaw`. Cache in-memory 5 menit per `orderId+days`.

**"Unik"**: `count(distinct visitorHash)` dalam window hari. Pelanggan pakai IP yang sama + UA yang sama di hari yang sama = 1 unique. Rolling 24 jam.

### 5.4 `src/app/dashboard/statistik/page.tsx` (RSC)

Layout (sesuai brainstorming):

1. Header + filter `?range=7|30|90` (default 30)
2. Row 3 KPI: Total · Unik · Pertumbuhan %
3. Chart garis (chart.js): 2 garis (total & unik per hari)
4. Dua kolom: Top Pages | Top Referrers
5. Empty state: "Belum ada data kunjungan"

`searchParams` di Next.js 16: `searchParams.range` validated ke `7|30|90`, default 30.

### 5.5 `src/app/dashboard/statistik/_components/StatChart.tsx` (client)

- `"use client"`
- Import `Line` dari `react-chartjs-2` + register Chart.js components
- Props: `data: Array<{date, total, unique}>`
- Render Line chart dengan 2 dataset
- Config: no animation (performa), responsive, maintainAspectRatio: false

### 5.6 Update `src/app/dashboard/page.tsx`

- Hapus dummy data `analyticsData`
- Ambil `getMonthlyKpi(primaryOrder.id)` di server component
- Tampilkan angka nyata (fallback 0)
- Tidak ubah layout/kartu lainnya

---

## 6. Dependencies

Tambah ke `package.json`:

```json
"chart.js": "^4.4.0",
"react-chartjs-2": "^5.2.0"
```

Build Docker menginstall ulang via `npm install`, jadi tidak ada langkah manual.

---

## 7. Migration

```bash
npx prisma migrate dev --name add_pageview
npx prisma generate
```

Di production (Docker), `docker-entrypoint.sh` sudah menjalankan `prisma migrate deploy` di startup, jadi migrasi otomatis.

---

## 8. Template HTML — Catatan

Template client (modernlight, cleanmedical, friendlycare, calmwarm) di-host di luar repo ini (R2/static). Template perlu ada snippet:

```html
<script src="https://app.nakespro.id/track.js" defer></script>
```

sebelum `</body>`. Ini manual update di repo template (bukan blocker untuk PR ini — data mulai masuk setelah template berikutnya di-deploy). Disampaikan ke Salman sebagai catatan terpisah.

---

## 9. Testing Strategy

- **Unit**: `analytics.ts` — test getMonthlyKpi dengan fixture data (3 PageView baris: bulan ini 2, bulan lalu 1, expected growth 100%)
- **Integration**: panggil `POST /api/track` dengan curl 5x, query DB, verifikasi 5 row
- **Manual**: buka `/dashboard/statistik` setelah ada data, verifikasi chart render
- **Empty state**: order baru tanpa PageView → render empty state
- **CORS**: `Origin: https://test.nakespro.id` → response include header allow

---

## 10. Error Handling

- `/api/track` body invalid → `400` (jangan 500, beacon retry kalau 500)
- Order tidak ditemukan dari subdomain → log warning, return `204` (suppress noise)
- DB error saat insert → log error, return `500` (beacon tidak retry otomatis; trade-off acceptable untuk MVP)
- Analytics page error → tampilkan fallback "Gagal memuat statistik" + tombol retry

---

## 11. Out of Scope (Future)

- Breakdown device/browser (UA sudah disimpan, tinggal query)
- Geo (butuh MaxMind GeoLite2 — tambahan dep)
- Real-time (butuh SSE/WebSocket)
- Custom date range
- Export CSV/PDF
- Dashboard admin lihat semua order (saat ini hanya owner order)
- Bot filtering (tidak dipakai, semua kunjungan dihitung)
- Rate limit berbasis Redis (saat ini in-memory, restart hilang)

---

## 12. File yang Diubah / Ditambah

**Baru**:
- `public/track.js`
- `src/app/api/track/route.ts`
- `src/lib/analytics.ts`
- `src/app/dashboard/statistik/page.tsx`
- `src/app/dashboard/statistik/_components/StatChart.tsx`
- `prisma/migrations/XXXX_add_pageview/`

**Edit**:
- `prisma/schema.prisma` (model + relasi)
- `src/app/dashboard/page.tsx` (ganti dummy → real)
- `package.json` (chart.js, react-chartjs-2)
