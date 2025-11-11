# ConnectaFeed - Supabase Setup Guide

Panduan singkat menyiapkan database Supabase, environment, dan menjalankan app sesuai PRD.

## 1) Buat Project Supabase
1. Masuk ke https://supabase.com > New Project.
2. Catat:
   - Project URL (SUPABASE_URL)
   - anon public key (VITE_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)
3. Auth > Providers > Email: aktifkan (Email OTP/Password). Simpan.

## 2) Jalankan SQL Schema + RLS
Buka Supabase > SQL Editor > jalankan skrip di bawah untuk membuat tabel, index, RLS, dan trigger `updated_at`.

```sql
-- extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- feeding_schedule
create table if not exists public.feeding_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  time timestamptz not null,
  portion integer not null check (portion > 0 and portion <= 10),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- feeding_history
create table if not exists public.feeding_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feeding_time timestamptz not null,
  portion integer not null check (portion > 0 and portion <= 10),
  method text not null check (method in ('manual','automatic')),
  created_at timestamptz not null default now()
);

-- device_status
create table if not exists public.device_status (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('online','offline')),
  last_fed timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- RLS
alter table public.feeding_schedule enable row level security;
alter table public.feeding_history enable row level security;
alter table public.device_status enable row level security;

drop policy if exists "own_feeding_schedule_all" on public.feeding_schedule;
create policy "own_feeding_schedule_all" on public.feeding_schedule
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_feeding_history_all" on public.feeding_history;
create policy "own_feeding_history_all" on public.feeding_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own_device_status_all" on public.device_status;
create policy "own_device_status_all" on public.device_status
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- indexes
create index if not exists idx_feeding_schedule_user_id on public.feeding_schedule(user_id);
create index if not exists idx_feeding_schedule_time on public.feeding_schedule(time);
create index if not exists idx_feeding_history_user_id on public.feeding_history(user_id);
create index if not exists idx_feeding_history_time on public.feeding_history(feeding_time);
create index if not exists idx_device_status_user_id on public.device_status(user_id);

-- updated_at triggers
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_feeding_schedule_updated on public.feeding_schedule;
create trigger trg_feeding_schedule_updated before update on public.feeding_schedule
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_device_status_updated on public.device_status;
create trigger trg_device_status_updated before update on public.device_status
for each row execute procedure public.set_updated_at();
```

## 3) Environment Variables
Buat file `.env` untuk Server (root) dan Client (Vite).

Server (.env):
```bash
# Server
PORT=3000
SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
CRON_SECRET=<random-long-secret>
```

Client (client/.env):
```bash
# Client (Vite)
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_public_key>
VITE_API_BASE=http://localhost:3000
```

### 3.1 Lokasi Penempatan Kredensial Supabase

Struktur:
```
.
├─ .env                # Hanya untuk server (jangan commit)
├─ client/
│  ├─ .env             # Variabel frontend (prefiks VITE_)
│  └─ src/...
```

Letakkan:
- SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di file: `.env` (root, server)
- VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file: `client/.env` (frontend)

Contoh `.env` (server):
```bash
PORT=3000
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJ...
CRON_SECRET=some-long-secret
```

Contoh `client/.env`:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJ...
VITE_API_BASE=http://localhost:3000
```

Catatan:
- Kunci `service_role` JANGAN ditempatkan di folder `client` atau diprefiks `VITE_`.
- Semua variabel yang ingin diakses di browser wajib diawali `VITE_`.
- Setelah mengubah `.env`, restart server dan client agar variabel termuat.

Verifikasi cepat:
- Jalankan `npm run dev` lalu cek server: token tidak muncul di response.
- Di console browser: `console.log(import.meta.env.VITE_SUPABASE_URL)` menampilkan URL.

### 3.2 Kesalahan Umum
| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| 401 Auth gagal | Anon key salah | Pastikan VITE_SUPABASE_ANON_KEY benar |
| RLS error | SERVICE_ROLE dipakai di client | Pindahkan ke `.env` server saja |
| Variabel undefined | Prefiks tidak `VITE_` | Tambahkan `VITE_` lalu restart Vite |

## 4) Menjalankan Aplikasi
Install dependency:
```bash
npm i
```

Jalankan server API:
```bash
npm run dev
# Server di http://localhost:3000
```

Jalankan client (Vite) dari folder `client`:
```bash
npm run client
# Buka http://localhost:5173 (atau port Vite Anda)
```

Login di client menggunakan Supabase Auth (Email/Password). Setelah login:
- Frontend menambahkan Authorization: Bearer <SUPABASE_JWT> saat memanggil API backend.

## 4.1) Uji Cepat (cURL) End-to-End

Prasyarat:
- Server jalan: `npm run dev` (http://localhost:3000)
- Variabel berikut siap:
  - SUPABASE_URL (contoh: https://xxxxx.supabase.co)
  - VITE_SUPABASE_ANON_KEY (anon public key)
  - CRON_SECRET (yang kamu buat sendiri)

Di bash (macOS/Linux/Git Bash). Untuk PowerShell, sesuaikan sintaks env.

Set env lokal:
```bash
SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
SUPABASE_ANON_KEY="REPLACE_WITH_ANON_PUBLIC_KEY"
API_BASE="http://localhost:3000"
```

1) Signup user (sekali saja) – atau buat user dari Dashboard Supabase:
```bash
curl -s -X POST "${SUPABASE_URL}/auth/v1/signup" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","password":"YourStrongPwd123!"}'
```

2) Login untuk mendapatkan JWT:
```bash
TOKEN="$(curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","password":"YourStrongPwd123!"}' | sed -n 's/.*"access_token":"\([^"]*\)".*/\1/p')"

echo "TOKEN=${TOKEN}"  # Jika kosong, cek email/password atau ANON key
```

3) Test endpoint manual feed:
```bash
curl -s -X POST "${API_BASE}/api/feed/manual" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"portion":2}'
```

4) Cek status device:
```bash
curl -s -X GET "${API_BASE}/api/status" \
  -H "Authorization: Bearer ${TOKEN}"
```

5) Buat jadwal (2 menit dari sekarang, waktu UTC). Ganti dengan ISO waktu kamu bila perlu:
```bash
SCHEDULE_TIME="$(date -u -d '+2 minutes' +'%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date -u -v+2M +'%Y-%m-%dT%H:%M:%SZ')"
echo "SCHEDULE_TIME=${SCHEDULE_TIME}"

curl -s -X POST "${API_BASE}/api/schedule" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"time\":\"${SCHEDULE_TIME}\",\"portion\":1,\"active\":true}"
```

6) Panggil cron (simulasi Supabase Cron) dan cek history:
```bash
# Panggil cron (ganti <CRON_SECRET> sesuai .env server)
curl -s -X POST "${API_BASE}/api/cron/trigger" \
  -H "Authorization: Bearer <CRON_SECRET>"

# Cek riwayat feeding
curl -s -X GET "${API_BASE}/api/history" \
  -H "Authorization: Bearer ${TOKEN}"
```

Troubleshooting cepat:
- 401 pada endpoint backend: pastikan `TOKEN` terisi (step login sukses).
- 500 saat insert/update: pastikan schema & RLS sudah dieksekusi di Supabase, dan portion 1..10.
- Cron tidak memproses: pastikan `time` berada di rentang 5 menit terakhir saat memanggil `/api/cron/trigger`, dan header Authorization berisi `CRON_SECRET` yang benar.

## 5) Kontrak API (ringkas)
- POST /api/feed/manual  body: { portion: 1..10 }
- GET  /api/schedule
- POST /api/schedule     body: { time: ISO8601, portion: 1..10, active: true/false }
- PUT  /api/schedule/:id body: partial dari di atas
- DELETE /api/schedule/:id
- GET  /api/history
- GET  /api/status
- POST /api/cron/trigger (internal, header Authorization: Bearer <CRON_SECRET>)

Semua endpoint (kecuali cron) butuh header:
```
Authorization: Bearer <SUPABASE_JWT>
Content-Type: application/json
```

## 6) Cron Job (Supabase)
Opsi yang disarankan: panggil endpoint backend internal setiap 5 menit.

- Buat Scheduled job (Supabase > Edge Functions/Schedules atau pg_cron).
- Command contoh (HTTP webhook):
```
POST https://<your-api-host>/api/cron/trigger
Header: Authorization: Bearer <CRON_SECRET>
```
- Jadwal: `*/5 * * * *`

Job ini akan:
- Ambil jadwal aktif dalam 5 menit terakhir.
- Catat ke `feeding_history` (method: automatic).
- Update `device_status.last_fed`.

## 7) Keamanan & RLS
- RLS aktif untuk semua tabel: data user terisolasi oleh `auth.uid()`.
- Backend memakai `service_role` agar bisa memproses cron/global, tetap filter per `user_id` sesuai kebutuhan bisnis.
- Jangan pernah expose `service_role` ke client.

## 8) Troubleshooting
- 401 Unauthorized: pastikan client mengirim Bearer token Supabase (akses setelah login).
- 500 saat insert/update: cek RLS (uid() cocok dengan user_id), schema sudah terpasang, dan nilai portion 1..10.
- Cron tidak berjalan: cek CRON_SECRET, URL endpoint, dan range waktu yang dipakai query (5 menit terakhir).

### Troubleshooting Tambahan

Error:
```
TypeError: Cannot read properties of undefined (reading 'headersSent')
finalhandler/index.js
```
Penyebab umum:
- Ada pemanggilan `app()` tanpa argumen di `server/index.ts`.
Solusi:
- Pastikan hanya ada `app.listen(PORT, () => { ... })` di akhir file.
- Tambah middleware 404:
  ```ts
  app.use((req, res) => res.status(404).json({ message: 'Not Found' }))
  ```
- Tambah error handler:
  ```ts
  app.use((err, _req, res, _next) => {
    console.error(err)
    res.status(500).json({ message: 'Internal Error' })
  })
  ```

## 9) Next Steps (Opsional)
- Tambah validasi Zod di backend dan frontend.
- Aktifkan PWA caching untuk asset statis, kecualikan endpoint kontrol/status dari cache.
- Tambah telemetry sederhana (log feed manual/otomatis untuk metrik PRD).

### Catatan Kompatibilitas Build
Plugin `@tailwindcss/vite@4.1.3` butuh `vite ^5.2.0 || ^6`. Versi sebelumnya pakai Vite 7 sehingga `npm i` gagal. Sudah diturunkan ke `vite ^6.4.1`. Jika nanti plugin merilis dukungan Vite 7, boleh upgrade kembali.

Troubleshooting: laman hitam / {"message":"Not Found"}
- Penyebab: Anda membuka http://localhost:3000 (backend API). Frontend dev server Vite default berjalan terpisah di port 5173.
- Solusi:
  1. Jalankan backend: npm run dev (server di http://localhost:3000)
  2. Jalankan frontend: cd client && npm run dev (Vite di http://localhost:5173)
  3. Buka frontend di browser: http://localhost:5173
- Catatan: server kini otomatis me-redirect `/` ke Vite dev server saat NODE_ENV=development. Untuk produksi, pastikan `client` sudah dibuild (npm run build di folder client) sehingga server bisa serve client/dist/index.html.
