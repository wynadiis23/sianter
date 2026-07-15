# Sianter — Sistem Informasi Antrean Instansi Pemerintah

Sistem manajemen antrean berbasis web untuk instansi pemerintah. Mendukung kiosk mandiri, monitor display real-time, reservasi online, tracking, dan manajemen jadwal kegiatan.

## Fitur

### Antrean
- **Kiosk Mandiri** (`/kios`) — Pengambilan nomor antrean melalui layar sentuh, cetak bukti dengan kode QR
- **Monitor Display** (`/monitor`) — Layar TV yang menampilkan antrean dipanggil per loket, media slideshow, video YouTube, running text
- **Reservasi Online** (`/antrean-online`) — Ambil nomor antrean dari rumah, pilih layanan dan sesi waktu
- **Tracking** (`/track/:token`) — Pantau posisi antrean secara real-time via token
- **Petugas Dashboard** (`/petugas/loket`) — Panggil, panggil ulang, lewati, selesaikan antrean. Dua mode: FIFO Global (tombol "Next") dan Selektif (per-layanan)

### Manajemen
- **Layanan** — Kelola jenis layanan (prefix kode, deskripsi, warna, gambar)
- **Loket** — Kelola loket dan layanan yang ditangani
- **Sesi** — Kelola sesi waktu reservasi online (nama, jam, kuota)
- **Kegiatan** — Jadwal kegiatan/rapat dengan import Excel massal dan template
- **Pengguna** — Kelola akun dengan 3 role: Super Admin, Petugas Loket, Petugas Kegiatan
- **Pengaturan** — Konfigurasi sistem: mode antrean, running text, media, slideshow

### Aksesibilitas
- Panel aksesibilitas (FAB pojok kanan bawah)
- Ukuran teks (normal/large/extra-large)
- Kontras tinggi
- Font ramah disleksia (Atkinson Hyperlegible)
- Audit aksesibilitas otomatis via `@axe-core/react` saat development

### Role & Hak Akses

| Role | Akses |
|---|---|
| **Super Admin** | Semua fitur admin: layanan, loket, sesi, kegiatan, pengguna, pengaturan |
| **Petugas Loket** | Dashboard antrean: panggil/panggil ulang/lewati/selesaikan |
| **Petugas Kegiatan** | Manajemen jadwal kegiatan saja |

## Tech Stack

| Layer | Teknologi |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Backend | [Elysia](https://elysiajs.com) |
| Frontend | [React](https://react.dev) + [Vite](https://vite.dev) + [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [PostgreSQL](https://postgresql.org) + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://better-auth.com) (RBAC, admin plugin) |
| Real-time | Elysia WebSocket |
| Type Safety | [Eden Treaty](https://elysiajs.com/eden/treaty.html) end-to-end |
| UI | [shadcn/ui](https://ui.shadcn.com) + [Radix](https://radix-ui.com) |
| Icons | [Lucide](https://lucide.dev) |
| Excel | [xlsx](https://sheetjs.com) |

## Struktur Monorepo

```
manajemen-antrean/
├── apps/
│   ├── backend/        # @sianter/backend — Elysia server (port 3000)
│   │   └── src/
│   │       ├── auth/       # Better Auth, Elysia macros, permissions
│   │       ├── db/         # Drizzle client
│   │       ├── modules/    # 13 modul fitur
│   │       ├── env.ts
│   │       ├── index.ts
│   │       └── seed.ts
│   └── frontend/       # @sianter/frontend — React SPA (port 5173)
│       └── src/
│           ├── components/ # Layouts + 27 shadcn/ui primitives
│           ├── hooks/
│           ├── lib/        # Eden client, auth client, WebSocket
│           └── routes/     # Halaman (admin, petugas, public)
├── packages/
│   └── shared/         # @sianter/shared — Drizzle schema & shared types
└── template_kegiatan.xlsx
```

## Persyaratan

- **Bun** >= 1.2
- **PostgreSQL** >= 14

## Instalasi & Setup

```bash
# 1. Clone & install dependencies
git clone <repo-url>
cd manajemen-antrean
bun install

# 2. Setup environment variables
cp .env.example .env
# Isi BETTER_AUTH_SECRET (generate dengan: openssl rand -base64 32)
```

Buat file `apps/frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

```bash
# 3. Setup database (pastikan PostgreSQL sudah berjalan)
bun db:push              # push schema ke DB (dev)
# atau
bun db:generate          # generate migration
bun db:migrate           # apply migration

# 4. Seed admin user
bun db:seed              # default: admin@sianter.local / admin123
```

## Menjalankan

```bash
# Development (backend + frontend parallel)
bun dev

# Atau terpisah
bun dev:backend          # http://localhost:3000
bun dev:frontend         # http://localhost:5173
```

## Perintah Lain

| Perintah | Kegunaan |
|---|---|
| `bun typecheck` | TypeScript checking semua package |
| `bun build` | Build semua package |
| `bun db:generate` | Generate migrasi Drizzle |
| `bun db:migrate` | Apply migrasi |
| `bun db:push` | Push schema langsung (dev) |
| `bun db:seed` | Seed admin user |
| `bun auth:generate` | Generate schema Better Auth |
| `bun run --filter @sianter/frontend lint` | ESLint frontend |

## Environment Variables

| Variable | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://postgres:postgres@localhost:5432/sianter` | Koneksi PostgreSQL |
| `BETTER_AUTH_SECRET` | ✅ | — | Secret untuk session (generate: `openssl rand -base64 32`) |
| `BASE_URL` | — | `http://localhost:3000` | URL publik backend |
| `FRONTEND_URL` | — | `http://localhost:5173` | Origin CORS |
| `VITE_API_URL` | ✅ (frontend) | — | URL API untuk Eden client |
| `PORT` | — | `3000` | Port backend |
| `SEED_ADMIN_EMAIL` | — | `admin@sianter.local` | Email admin seed |
| `SEED_ADMIN_PASSWORD` | — | `admin123` | Password admin seed |

## API Endpoints

### Publik
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/kios/layanan` | Daftar layanan aktif (kiosk) |
| POST | `/api/kios/antrean` | Ambil antrean baru |
| POST | `/api/kios/check-in` | Check-in via token |
| GET | `/api/antrean-online/sesi` | Daftar sesi reservasi |
| POST | `/api/antrean-online` | Buat reservasi online |
| GET | `/api/track/:token` | Tracking antrean |
| GET | `/api/monitor` | Data monitor display |
| GET | `/api/ws/monitor` | WebSocket monitor |

### Admin (Super Admin)
| Method | Path | Keterangan |
|---|---|---|
| CRUD | `/api/admin/layanan` | Manajemen layanan |
| CRUD | `/api/admin/loket` | Manajemen loket |
| CRUD | `/api/admin/sesi` | Manajemen sesi |
| CRUD | `/api/admin/kegiatan` | Manajemen kegiatan |
| POST | `/api/admin/kegiatan/import` | Import Excel kegiatan |
| GET/POST | `/api/admin/kegiatan/template` | Download/upload template |
| CRUD | `/api/admin/pengaturan` | Pengaturan sistem |
| — | `/api/admin/users` | Manajemen pengguna (via Better Auth) |

### Petugas
| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/loket` | Daftar loket tersedia |
| GET | `/api/loket/:id/layanan` | Layanan per loket |
| GET | `/api/loket/antrean/dashboard` | Dashboard antrean |
| POST | `/api/loket/antrean/call` | Panggil antrean |
| POST | `/api/loket/antrean/recall` | Panggil ulang |
| POST | `/api/loket/antrean/skip` | Lewati antrean |
| POST | `/api/loket/antrean/finish` | Selesaikan antrean |
| GET | `/api/ws/loket` | WebSocket petugas |

## Database Schema

11 tabel utama:

- **user** — Pengguna dengan role (SUPER_ADMIN, PETUGAS_LOKET, PETUGAS_KEGIATAN)
- **session, account, verification** — Better Auth
- **layanan** — Jenis layanan (prefix kode, nama, warna, gambar)
- **loket** — Loket/fisik counter
- **loket_layanan** — Relasi many-to-many loket-layanan
- **antrean** — Antrean aktif (status: RESERVED/WAITING/CALLED/RECALLED/SKIPPED/FINISHED/EXPIRED)
- **antrean_log** — Arsip antrean (diarsipkan otomatis tiap tengah malam)
- **pemohon** — Data pemohon (nama, no HP)
- **sesi** — Sesi waktu reservasi online
- **sesi_layanan** — Relasi sesi-layanan
- **kegiatan** — Jadwal kegiatan (tanggal, nama, metode, penyelenggara, nomor surat)
- **pengaturan** — Pengaturan sistem (singleton)

## Lisensi

Hak Cipta © 2026. Untuk keperluan internal instansi pemerintah.
