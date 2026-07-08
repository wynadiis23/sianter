# Sianter - Agent Guide

Sistem Informasi Antrean Instansi Pemerintah. Bun workspace monorepo dengan
backend Elysia + frontend React/Vite, end-to-end type safety via Eden Treaty.

## Struktur

- `apps/backend` (`@sianter/backend`) - Elysia + Better Auth + Drizzle
- `apps/frontend` (`@sianter/frontend`) - React + Vite + Tailwind v4 + Eden
- `packages/shared` (`@sianter/shared`) - Drizzle schema & shared types

## Setup Awal

```bash
bun install                      # install semua dependency workspace
cp .env.example .env             # lalu isi BETTER_AUTH_SECRET
```

Database PostgreSQL harus sudah berjalan sebelum menjalankan migrasi.

## Perintah Umum

| Task | Command |
|---|---|
| Jalankan dev (backend + frontend parallel) | `bun dev` |
| Jalankan hanya backend | `bun dev:backend` |
| Jalankan hanya frontend | `bun dev:frontend` |
| Typecheck semua package | `bun typecheck` |
| Build semua package | `bun build` |

## Database & Migrasi (Drizzle)

```bash
bun db:generate    # generate SQL migration dari schema
bun db:migrate     # apply migration ke DB
bun db:push        # push schema langsung (dev only, tanpa migration file)
```

Skema Drizzle berada di `packages/shared/src/db/schema/`. Backend me-re-exportnya
via `apps/backend/src/db/schema.ts`. `drizzle.config.ts` ada di `apps/backend/`.

## Better Auth

```bash
bun auth:generate  # generate skema Drizzle untuk Better Auth (CLI)
```

Better Auth di-mount di `/api/auth/*`. Session guard via macro Elysia
(`{ auth: true }` pada route). Role: `SUPER_ADMIN`, `PETUGAS_LOKET`.

## End-to-End Type Safety (Eden)

Frontend melakukan `import type { App } from '@sianter/backend'` (type-only,
di-erase saat build). Klien Eden: `apps/frontend/src/lib/eden.ts`.

## Lint / Format

Belum ada linter terkonfigurasi. Jalankan `bun typecheck` untuk verifikasi tipe.

## Dev Server Ports

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (proxy `/api` -> backend)
