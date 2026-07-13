
## 🗺️ Alur Utama (Flow) Antrean Online

Secara garis besar, alurnya dibagi menjadi 2 fase: **Fase Ambil dari Rumah** dan **Fase Check-In di Lokasi**.

### Fase 1: Ambil Antrean dari Rumah (Web Publik)

1. **Akses Web:** Masyarakat mengakses sub-domain publik instansi (misal: `antrean.instansi.go.id`) melalui HP/Laptop mereka.
2. **Verifikasi Identitas & Pilih Jadwal:**
* Warga memasukkan **NIK** dan **Nomor HP**.
* Warga memilih jenis layanan.
* Warga memilih **Tanggal & Sesi Jam Kunjungan** (Misal: Senin, Sesi 1: Pukul 08.00 - 10.00). *Ini penting agar kedatangan mereka terurai.*


3. **Penerbitan Tiket Digital:**
* Backend Elysia akan men-generate data antrean dengan status `RESERVED` (Dipesan).
* Warga mendapatkan **Tiket Elektronik** di layar HP yang berisi nomor antrean bayangan, jam sesi, dan sebuah **QR Code unik**. Tiket ini juga bisa dikirim via WhatsApp (jika ada integrasi) atau di-download sebagai PDF.



### Fase 2: Check-In di Instansi (Hari H Pelayanan)

Warga wajib melakukan aktivasi/konfirmasi kedatangan saat tiba di lokasi untuk mengubah status tiket mereka dari `RESERVED` menjadi `WAITING` (siap dipanggil oleh petugas).

Berikut adalah **2 Opsi Cara Check-In** di lapangan yang bisa kita terapkan:

#### Opsi A: Scan QR Code di Kios Tiket (Screen 1) — *Rekomendasi Utama*

* **Flow:** Di Screen 1 (Kios Tiket), kita tambahkan satu tombol besar: **"Check-In Antrean Online"**. Ketika ditekan, layar akan mengaktifkan kamera tablet/kios (atau menggunakan perangkat *hardware QR scanner* eksternal yang murah). Warga tinggal mengarahkan QR Code di HP mereka ke *scanner*.
* **Sistem Kerja:** Backend langsung memvalidasi QR Code tersebut. Jika valid dan sesuai dengan jam sesi hari itu, Kios Tiket akan langsung mencetak struk fisik (atau konfirmasi di layar) dan status di database PostgreSQL berubah menjadi `WAITING`. Nomor mereka masuk ke antrean utama TV Monitor (Screen 2).


## 🛠️ Dampak Fitur Ini terhadap Arsitektur & Database (PRD Update)

Agar fitur ini berjalan lancar di backend Elysia + Drizzle ORM kita, ada beberapa aturan data yang perlu didefinisikan:

### 1. Penambahan Status Antrean (State Machine)

Status antrean kita sekarang bertambah satu di awal, yaitu `RESERVED`:

$$\text{[RESERVED]} \xrightarrow{\text{Check-In (Scan QR)}} \text{[WAITING]} \xrightarrow{\text{Tombol Next}} \text{[CALLING]} \dots$$

* `RESERVED`: Tiket sudah dipesan online, tetapi nomor belum dimasukkan ke daftar panggil TV Monitor sampai orangnya benar-benar datang melakukan *check-in*.

### 2. Kebijakan Batas Waktu (*Expirational Policy*)

Untuk menghindari warga yang memesan online tapi tidak datang, kita buat aturan: jika sesi jam kunjungan sudah lewat **15-30 menit** dan warga belum melakukan *check-in*, backend Elysia via *cron job* akan otomatis mengubah status `RESERVED` tersebut menjadi `EXPIRED` (hangus), sehingga kuota bisa dialihkan ke orang lain.

### 3. Penggabungan Nomor Antrean Online & Offline

* **Strategi Adil:** Nomor urut tetap digabung berdasarkan waktu *Check-In* (Opsi A/B). Jadi, warga yang mendaftar online tidak langsung memotong antrean warga yang datang langsung. Keuntungan warga online adalah mereka **sudah pasti mendapatkan kuota layanan** hari itu dan tahu harus datang jam berapa, sehingga tidak perlu menunggu dari subuh di kantor.
