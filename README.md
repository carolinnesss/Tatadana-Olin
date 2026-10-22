# TataDana (Fintech Personal Finance & Telegram Bot)

> **Tagline:** Catat keuangan semudah chat — langsung dari Telegram kamu.  
> **Deskripsi:** TataDana adalah platform manajemen keuangan pribadi modern terintegrasi dengan Telegram Bot. Pengguna dapat mencatat pemasukan dan pengeluaran cukup dengan mengirim pesan chat teks natural, voice note, atau foto struk belanja, dan setiap transaksi otomatis tersimpan rapi di dashboard laporan TataDana.

---

## 🎨 Identitas & Desain
- **Bahasa Aplikasi:** 100% Bahasa Indonesia
- **Skema Warna:** Burgundy (#800020) & Putih Bersih — Modern Premium Fintech
- **Tipografi:** Plus Jakarta Sans & Inter
- **Basis Database:** Supabase (PostgreSQL + Supabase Auth + Supabase Storage + Realtime)
- **Timezone Server & Transaksi:** WIB (Asia/Jakarta)

---

## 🚀 Panduan Menjalankan Aplikasi (Langkah Berurutan)

### 1. Prasyarat Sistem
Pastikan perangkat Anda sudah terpasang:
- **Node.js** (versi 18 ke atas)
- Akun **Supabase** (untuk PostgreSQL, Auth, & Storage)
- Akun **Telegram** & token bot dari [@BotFather](https://t.me/BotFather)
- Akun **Midtrans** (Sandbox / Production)
- Minimal 1 API Key AI (**Google Gemini**, **OpenAI**, atau **DeepSeek**)

### 2. Setup Database Supabase & Migrasi
1. Buat project baru di dashboard [Supabase](https://supabase.com).
2. Buka terminal project dan jalankan migrasi database:
   ```bash
   npx supabase db push
   # atau copy dan jalankan isi file supabase/migrations/20261013000001_init_tatadana.sql
   # langsung di SQL Editor Supabase Studio
   ```
3. Skema database akan otomatis membuat tabel:
   - `profiles`, `wallets`, `categories`, `transactions`, `telegram_updates`, `ai_providers_config`, `ai_call_logs`, `payments`, `export_history`, `admin_audit_logs`.
   - Mengaktifkan Row Level Security (RLS) dan Trigger auto-setup dompet & kategori user baru.

### 3. Buat Bucket Supabase Storage
Di dashboard Supabase -> Storage, buat 2 bucket penyimpanan:
- `avatars` (Public access untuk foto profil pengguna)
- `tatadana-reports` (Private bucket dengan Signed URL untuk hasil export laporan PDF & Excel)

### 4. Konfigurasi Supabase Auth
Di dashboard Supabase -> Authentication -> Providers:
- Aktifkan provider **Email & Password**
- Aktifkan provider **Google OAuth**
- Aktifkan provider **Phone (SMS/OTP)**

### 5. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi berikut sesuai kredensial Anda:
```env
PORT=3000
TZ=Asia/Jakarta

# Telegram Integration
TELEGRAM_BOT_TOKEN=your_bot_token_here
WEBHOOK_BASE_URL=https://your-domain-or-ngrok.ngrok-free.app

# Multi-Provider AI Keys
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_key_optional
DEEPSEEK_API_KEY=your_deepseek_key_optional

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=tatadana-reports

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
MIDTRANS_IS_PRODUCTION=false
```

### 6. Menjalankan Server Aplikasi
TataDana dirancang dengan arsitektur modern zero-bloat yang berjalan langsung menggunakan runtime Node.js ES Modules:
```bash
# Jalankan server lokal
npm run dev
# atau
npm start
```
Aplikasi akan aktif di `http://localhost:3000`.

### 7. Setup Webhook Telegram (Pengujian Lokal vs Produksi)
- **Lokal:** Jalankan tunnel HTTPS seperti `ngrok http 3000`, lalu masukkan URL HTTPS ngrok ke variabel `WEBHOOK_BASE_URL` di `.env`.  
  *Alternatif Offline:* Anda juga dapat menggunakan tombol **Mode Polling Lokal** di dashboard Settings TataDana untuk menguji bot tanpa ngrok sama sekali.
- **Produksi:** Deploy server ke VPS / Cloud provider (Vercel, Render, Railway, DigitalOcean) dan arahkan `WEBHOOK_BASE_URL` ke domain resmi Anda dengan SSL (HTTPS).

### 8. Akun Awal & Kredensial
Untuk kemudahan pengujian:
- **Superadmin Portal:** `sandracarolin1004@gmail.com` (kata sandi: `password123` / `admin123` / Masuk Instan Google)
- **User Pro (Data Lengkap & Grafik):** `budi.santoso@example.com` (kata sandi: `password123`)
- **User Starter:** `siti.aminah@example.com` (kata sandi: `password123`)
- **Buat Akun Bersih Baru:** Klik **Daftar Akun Baru** di `/register`, masukkan nama, email, nomor HP, dan kode OTP mock **123456**. Akun baru akan dimulai dari data 0 (kosong) dan terisolasi secara mandiri.

---

## 🤖 Tata Cara Memakai Bot Telegram

1. **Buat Bot di Telegram:**
   - Buka Telegram, cari **@BotFather**, kirim perintah `/newbot`.
   - Beri nama dan username unik yang berakhiran `bot` (contoh: `tatadana_budi_bot`).
   - Salin token HTTP API yang diberikan.
2. **Hubungkan ke TataDana:**
   - Masuk ke web TataDana -> **Pengaturan** -> Tab **Telegram Bot**.
   - Tempel token bot di kolom input, lalu klik tombol **Test Koneksi**.
   - Tunggu status berubah menjadi 🟢 **Terhubung**.
3. **Mulai Percakapan:**
   - Buka bot Anda di Telegram dan tekan tombol **/start**.
4. **Mencatat Transaksi:**
   - **Teks Natural:** Ketik kalimat seperti `beli bakso 15rb`, `kopi susu 25k`, atau `gajian 5jt`.
   - **Pesan Suara (Voice Note):** Kirim rekaman suara maksimal 60 detik (contoh: *"Beli bensin motor pertamax tiga puluh ribu"*). Bot akan membalas lengkap dengan kutipan transkrip suara.
   - **Foto Struk (Paket Pro):** Kirim foto struk belanja Indomaret/supermarket. AI Vision OCR akan mengekstrak setiap item secara otomatis.
5. **Perintah Cepat Telegram:**
   - `/saldo` — Cek saldo semua dompet (Cash, BCA, Mandiri, dll).
   - `/hari ini` — Rekap pengeluaran & pemasukan hari ini.
   - `/minggu ini` — Rekap arus kas 7 hari terakhir.
   - `/bulan ini` — Rekap bulanan beserta rincian pengeluaran per kategori.
   - `/budget` — Pantau progress bar visual pemakaian budget bulanan.
   - `/sheet` — Link cepat menuju dashboard laporan web TataDana.
   - `/bantuan` — Panduan lengkap seluruh perintah bot.

---

## 📋 Fitur Unggulan Berdasarkan Paket

| Fitur | Starter (Rp49rb/bln) | PRO (Rp99rb Sekali Bayar) |
|---|:---:|:---:|
| Pencatatan via Teks Telegram | ✓ | ✓ |
| Pencatatan via Voice Note (STT) | ✓ | ✓ |
| Kuota Transaksi Bulanan | Maks 50 tx / bulan | **Unlimited** |
| Jumlah Dompet (Multi-Wallet) | Maks 3 dompet | **Unlimited** |
| Kategori Anggaran (Budget) | Maks 5 kategori | **Unlimited** |
| **Input Foto Struk (AI Vision OCR)** | ✗ | **✓ (Aktif)** |
| **AI Financial Advisor Proaktif** | ✗ | **✓ (Aktif)** |
| **Export On-Demand PDF & Excel (.xlsx)** | ✗ | **✓ (Unlimited)** |
| Riwayat Export Tersimpan | ✗ | **✓** |
| Pengingat Harian Custom (Telegram) | 1x sehari | **Hingga 2x sehari** |

---

## 🛡️ Kriteria Selesai & Pengujian (Acceptance Checklist)
- [x] Daftar akun baru di `/register` dengan verifikasi OTP dev `123456` berhasil login dan menghasilkan dashboard kosong tanpa data contoh.
- [x] Data antar akun terisolasi 100% via session cookie (Akun B tidak dapat melihat transaksi Akun A).
- [x] Transaksi dari web dan simulator bot Telegram langsung terakumulasi ke akun yang sedang aktif dan memperbarui saldo & chart secara real-time.
- [x] Fitur ganti foto profil di Settings -> Tab Profil (JPG/PNG/WebP maks 2 MB) tersimpan permanen di storage dan tampil di avatar sidebar.
- [x] Logout membersihkan session cookie; membuka `/dashboard` tanpa login otomatis dialihkan kembali ke `/login`.
- [x] Webhook Telegram idempotent: pesan dengan `update_id` yang sama dicegah dari pemrosesan ganda.
- [x] Pembatasan paket berjalan ketat (Starter dibatasi 50 transaksi/bulan, dilarang akses foto struk & export laporan).
- [x] Semua layar responsif sempurna di layar smartphone (375px) dan desktop (1280px+), mengusung tema Orange & Putih premium.
