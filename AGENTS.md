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
| Lint frontend | `bun run --filter @sianter/frontend lint` |

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

ESLint terkonfigurasi di `apps/frontend/eslint.config.js` dengan
`eslint-plugin-jsx-a11y` dan `typescript-eslint`.

```bash
bun run --filter @sianter/frontend lint   # jalankan ESLint
bun typecheck                             # verifikasi tipe
```

## Aksesibilitas

Panel aksesibilitas (FAB pojok kanan bawah) via `AccessibilityPanel` yang
di-render di `App.tsx`.

Preferensi (`textSize`, `contrast`, `dyslexicFont`) di-persist ke localStorage
dan diterapkan sebagai data-attribute pada `<html>`:
- `data-a11y-text` — normal / large / extra-large
- `data-a11y-contrast` — high
- `data-a11y-dyslexic` — true

CSS overrides ada di `apps/frontend/src/style.css`. Dev auditor
`@axe-core/react` aktif otomatis saat `import.meta.env.DEV`.

Font ramah disleksia: Atkinson Hyperlegible (dari `@fontsource/atkinson-hyperlegible`).

## Dev Server Ports

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173` (proxy `/api` -> backend)
