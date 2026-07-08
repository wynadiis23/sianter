---

### 🌟 1. Mode FIFO Global (Otomatis)

* **Cara Kerja:** Petugas cukup menekan satu tombol utama: **"Panggil Antrean Berikutnya"**.
* **Logika Backend:** Backend Elysia akan melakukan *query* ke database PostgreSQL menggunakan Drizzle ORM untuk mencari baris antrean dengan status `WAITING` yang memiliki `created_at` (timestamp) paling tua, dari semua kategori layanan yang dicentang oleh loket tersebut.
* **Kelebihan:** Sangat adil bagi warga, petugas tidak perlu mikir siapa yang harus dipanggil duluan.

### 🎯 2. Mode Selektif / Kategori (Manual)

* **Cara Kerja:** Di Dashboard Petugas (Screen 3), alih-alih hanya ada satu tombol "Next", akan muncul **kartu (cards) per layanan** yang menunjukkan jumlah antrean menunggu (misal: *KTP: 5 orang, KK: 2 orang*). Setiap kartu memiliki tombol **"Panggil KTP"** atau **"Panggil KK"** sendiri-sendiri.
* **Logika Backend:** Backend akan memfilter status `WAITING` berdasarkan `layanan_id` spesifik yang diklik oleh petugas.
* **Kelebihan:** Sangat berguna jika ada layanan tertentu yang harus didahulukan (prioritas) atau jika petugas ingin menyelesaikan satu jenis urusan terlebih dahulu agar berkasnya tidak bercampur.

---

## 📝 Update PRD Lengkap (Final Blueprint)

Ini adalah dokumen **PRD Komprehensif** yang sudah mencakup semua diskusi kita: **Elysia + React + Tailwind v4 + Drizzle + Postgres + Better Auth + Dynamic Hybrid Queue Mode**.

---

# 📝 PRODUCT REQUIREMENT DOCUMENT (PRD)

## 1. Identifikasi Dokumen

* **Nama Proyek:** Sistem Informasi Antrean Instansi Pemerintah Berbasis Web (Sianter)
* **Stack Teknologi:**
* **Backend Runtime:** Bun
* **Backend Framework:** Elysia JS (High-performance & Native WebSockets)
* **Frontend Framework:** React (SPA) + Vite
* **CSS Framework:** Tailwind CSS v4
* **Autentikasi:** Better Auth (Integrasi Drizzle)
* **Type Safety:** `@elysiajs/eden` (Eden Treaty)
* **Database & ORM:** PostgreSQL + Drizzle ORM



---

## 2. Ringkasan Produk & Arsitektur

Sianter adalah aplikasi manajemen antrean multi-layanan berbasis web. Menggunakan **Elysia Eden**, tipe data dari skema Drizzle di backend diturunkan langsung ke frontend React secara *compile-time* (*End-to-End Type Safety*). Komunikasi perubahan nomor antrean dari loket petugas ke layar monitor ruang tunggu menggunakan **Elysia WebSockets** secara *real-time* (< 1 detik).

---

## 3. Kebutuhan Fungsional (Fungsionalitas Per Screen)

### 📺 Screen 1: Kios Tiket Mandiri (Visitor Screen)

*Ditampilkan pada perangkat Touchscreen / Tablet di lobi.*

* **Grid Layanan Dinamis:** Mengambil daftar layanan aktif dari DB. Tombol otomatis *disabled* (abu-abu) jika dinonaktifkan oleh Admin.
* **Ambil Antrean:** Men-generate kode unik per layanan (Contoh: `A-001`) dan mencetak struk/menampilkan konfirmasi sukses.

### 📺 Screen 2: Monitor Display Utama (Public Monitor Screen)

*Ditampilkan pada TV / Monitor besar di ruang tunggu.*

* **Split Screen Layout:** Sisi informasi nomor antrean aktif per loket, sisi media hiburan (Video YouTube/Slide pengumuman), dan *Running Text* di bagian bawah.
* **Voice Announcement:** Fitur otomatis memanggil nomor antrean menggunakan Web Speech API (Text-to-Speech) bawaan browser setiap ada instruksi dari WebSocket.

### 📺 Screen 3: Dashboard Admin & Petugas Loket

#### A. Modul Konfigurasi Sistem (Super Admin - Secured via Better Auth `SUPER_ADMIN`)

* **CRUD Layanan:** Manajemen Nama, Prefix (A-Z), dan Status Aktif/Nonaktif layanan.
* **User Management:** Membuat dan mengelola akun petugas loket via Better Auth.
* **Sistem Konfigurasi Mode Antrean (Fitur Dinamis):** Admin dapat menentukan mode pemanggilan yang berlaku di instansi:
1. *Mode FIFO Global:* Pemanggilan murni berdasarkan siapa yang datang duluan lintas layanan.
2. *Mode Selektif:* Petugas menentukan sendiri layanan mana yang mau dipanggil duluan dari dasbor mereka.



#### B. Modul Kontrol Antrean (Petugas - Secured via Better Auth `PETUGAS_LOKET`)

* **Pilih Loket & Layanan Aktif:** Petugas memilih nomor loket mereka dan mencentang layanan apa saja yang mereka pegang saat itu (bisa multi-layanan).
* **Panel Panggilan Dinamis:** Tampilan berubah sesuai Mode Antrean yang dipilih Admin:
* Jika *FIFO Global*: Hanya ada satu tombol besar **"NEXT"**.
* Jika *Selektif*: Muncul daftar kartu layanan beserta jumlah antrean tersisa, masing-masing memiliki tombol **"PANGGIL [NAMA LAYANAN]"**.


* **Tombol Kontrol Standar:** **Recall** (Panggil ulang), **Skip** (Lewati), dan **Finish** (Selesai melayani).

---

## 4. Aturan Bisnis & Aturan Data (Business Rules)

* **Satu Loket Banyak Layanan:** Backend mendukung relasi fleksibel di mana satu loket/petugas dapat memproses antrean dari beberapa jenis layanan sekaligus.
* **Auto-Reset Counter:** Menggunakan *Cron Job* bawaan Bun/Elysia untuk mereset nomor antrean kembali ke `001` setiap pukul `00:00` WITA setelah memindahkan data hari ini ke tabel riwayat (log).

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

* **Offline Resilience:** Sistem harus dapat dideploy penuh di jaringan LAN lokal agar tetap berjalan meskipun koneksi internet eksternal terputus.
* **UI/UX Specific:** Screen 1 dioptimalkan untuk sentuhan jari (tablet), Screen 2 dioptimalkan untuk jarak pandang TV (font besar & kontras tinggi), Screen 3 dioptimalkan untuk efisiensi kerja petugas (desktop).

---