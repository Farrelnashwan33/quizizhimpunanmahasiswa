# Quiz Online Kaderisasi Tingkat I - HIMA FST UT Bandung

Platform Quiz Online resmi untuk kegiatan **Kaderisasi Tingkat I HIMA Fakultas Sains dan Teknologi Universitas Terbuka Bandung**.
> Subjudul: *"Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi."*

Aplikasi dibangun menggunakan **SvelteKit**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, dan **Supabase (PostgreSQL & Auth)** dengan sistem autentikasi terpisah antara Mahasiswa dan Admin Pengurus, autosave pengerjaan kuis real-time, penilaian server-side anti manipulasi, dan panel admin komprehensif.

---

## 📁 Struktur Folder Project

```
├── prisma/
│   ├── schema.prisma              # Schema database Prisma ORM (profiles, quizzes, questions, quiz_attempts, answers)
│   └── seed.ts                    # Script seeding 30 soal lengkap kaderisasi (Kategori A-F)
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql # DDL Tabel, Enum, Index, Trigger updated_at
│       ├── 002_rls_policies.sql   # Row Level Security (RLS) & Function auth.users trigger
│       └── 003_seed_quiz.sql      # Seed SQL 30 Soal Kaderisasi & default quiz
├── src/
│   ├── app.d.ts                   # TypeScript definition untuk Supabase locals & Prisma profile
│   ├── app.html                   # HTML template dengan Google Fonts & meta tags
│   ├── hooks.server.ts            # Middleware SSR Supabase Auth & proteksi rute role admin/mahasiswa
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                # Button, Input, Card, Modal, Badge, ProgressBar, Toast, Skeleton, ConfirmDialog
│   │   │   ├── Navbar.svelte      # Navbar utama responsif dengan session status
│   │   │   ├── Footer.svelte      # Footer resmi HIMA FST UT Bandung
│   │   │   └── AdminSidebar.svelte# Sidebar 10 menu khusus panel admin pengurus
│   │   ├── server/
│   │   │   ├── prisma.ts          # Singleton Prisma Client
│   │   │   └── supabase.ts        # Supabase Admin Client
│   │   ├── stores/
│   │   │   └── toast.ts           # Toast Notification store
│   │   └── supabaseClient.ts      # Browser Supabase client
│   └── routes/
│       ├── +layout.svelte         # Root layout dengan Toast & Navbar
│       ├── +layout.server.ts      # Expose auth session & profile ke PageData
│       ├── +page.svelte           # Landing page modern & info 6 domain kaderisasi
│       ├── +page.server.ts        # Server load kuis aktif
│       ├── register/              # Registrasi mahasiswa (NIM, Prodi FST, WA, Password)
│       ├── login/                 # Login mahasiswa peserta
│       ├── logout/                # Server action sign out
│       ├── dashboard/             # Dashboard mahasiswa (status kuis, riwayat, nilai)
│       ├── quiz/[quizId]/         # Pengerjaan kuis interaktif (30 soal, autosave, review modal)
│       ├── hasil/[attemptId]/     # Hasil nilai (0-100, benar/salah, pembahasan jika diizinkan)
│       ├── api/quiz/
│       │   ├── save-answer/       # Real-time autosave endpoint
│       │   └── submit/            # Transactional server-side evaluation & score calculation
│       └── admin/
│           ├── +layout.svelte     # Admin layout dengan sidebar
│           ├── login/             # Login admin pengurus terpisah
│           ├── dashboard/         # Statistik (rata-rata, tertinggi, terendah, histogram nilai)
│           ├── peserta/           # Daftar peserta (search, filter prodi, sort, pagination)
│           │   ├── export/        # Endpoint download laporan data peserta CSV
│           │   └── [attemptId]/   # Inspeksi detail lembar jawaban 30 soal per peserta
│           ├── mahasiswa/         # Master data akun mahasiswa terdaftar
│           ├── soal/              # Manajemen CRUD 30 butir soal kuis & filter kategori
│           ├── kunci-jawaban/     # Tabel cepat kunci jawaban 1-30 & inline modifier
│           ├── hasil/             # Analisis kelulusan & akurasi per kategori materi
│           ├── pengaturan/        # Kontrol buka/tutup kuis, review pembahasan, durasi
│           └── pengurus/          # Manajemen akun admin & panduan keamanan
├── .env.example                   # Contoh konfigurasi environment variable
└── package.json
```

---

## ⚙️ 1. Setup Environment Variables

Salin file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi variabel dengan kredensial project Supabase Anda:

```env
# 1. Supabase Public Keys
PUBLIC_SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"

# 2. Supabase Secret Role Key (Server only)
SUPABASE_SERVICE_ROLE_KEY="[YOUR_SERVICE_ROLE_KEY]"

# 3. Prisma Database Connection (Transaction Pooler - Port 6543)
DATABASE_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# 4. Prisma Direct Connection (Direct DB - Port 5432)
DIRECT_URL="postgresql://postgres.[YOUR_PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

---

## 🗄️ 2. Setup Database di Supabase

### Opsi A: Melalui Supabase SQL Editor (Paling Mudah & Instan)
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) > Masuk ke project Anda.
2. Buka menu **SQL Editor** > **New query**.
3. Jalankan file SQL secara berurutan:
   - Jalankan isi file `supabase/migrations/001_initial_schema.sql` (Membuat tabel, enum, trigger).
   - Jalankan isi file `supabase/migrations/002_rls_policies.sql` (Membuat function dan Row Level Security).
   - Jalankan isi file `supabase/migrations/003_seed_quiz.sql` (Memasukkan 30 butir soal kaderisasi).

### Opsi B: Melalui Prisma CLI
```bash
# Generate Prisma Client
npx prisma generate

# Sinkronkan schema ke database Supabase
npx prisma db push

# Jalankan seed 30 butir soal
npx prisma db seed
```

---

## 🛡️ 3. Cara Membuat Akun Admin Pengurus Secara Aman

Sistem menggunakan Supabase Auth dengan otorisasi berbasis tabel `profiles.role`. Jangan menanamkan password admin mentah di file frontend!

### Langkah Membuat Admin Baru:
1. Daftarkan akun pengurus melalui halaman registrasi `/register` atau via Supabase Auth Dashboard.
2. Buka **Supabase SQL Editor** dan jalankan perintah:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'email_pengurus@hima-fst.ut.ac.id';
```
3. Akun tersebut kini memiliki hak akses penuh administrator dan dapat masuk melalui portal `/admin/login`.

---

## 💻 4. Cara Menjalankan di Komputer Lokal

```bash
# 1. Install dependensi
npm install

# 2. Generate Prisma Client
npx prisma generate

# 3. Jalankan development server
npm run dev
```

Buka peramban di `http://localhost:5173`.

---

## 🚀 5. Cara Deploy ke Vercel

1. **Push Code ke GitHub / GitLab**.
2. Buka [Vercel Dashboard](https://vercel.com) > **Add New Project** > Import repository.
3. Pada **Environment Variables**, masukkan seluruh nilai dari `.env`:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Pastikan Build Command adalah `npm run build` dan Output Directory `.svelte-kit`.
5. Klik **Deploy**. Website siap digunakan oleh seluruh mahasiswa dan panitia.

---

## ✅ 6. Checklist Pengujian Fitur Lengkap

- [x] **Registrasi Mahasiswa**: Validasi NIM unik, email, prodi FST, password minimal 8 karakter.
- [x] **Login Mahasiswa**: Autentikasi Supabase Auth & redirect ke dashboard mahasiswa.
- [x] **Login Admin Terpisah**: Proteksi ketat role admin di `/admin/login` (menolak mahasiswa biasa).
- [x] **Dashboard Mahasiswa**: Status kuis, kartu kaderisasi, progres jawaban, dan riwayat pengerjaan.
- [x] **Pengerjaan Quiz 30 Soal**: Desain mirip Google Forms modern, navigasi nomor 1-30, autosave per soal.
- [x] **Keamanan Kunci Jawaban**: Kunci jawaban tidak dikirim ke browser saat pengerjaan.
- [x] **Penilaian Server-Side**: Skor 0–100 dihitung aman dalam transaksi database atomic saat tombol submit diklik.
- [x] **Halaman Hasil**: Rincian nilai akhir, persentase benar/salah, dan pembahasan.
- [x] **Dashboard Admin**: Statistik 7 metrik nilai, histogram sebaran skor, dan peserta terbaru.
- [x] **Manajemen Peserta**: Pencarian, filter prodi, sortir nilai, pagination, dan ekspor data ke format CSV.
- [x] **Inspeksi Jawaban**: Detail pilihan jawaban mahasiswa vs kunci jawaban soal 1–30.
- [x] **CRUD Bank Soal**: Tambah, edit teks soal/opsi A–D/kunci/pembahasan, dan hapus soal.
- [x] **Pengaturan Quiz**: Buka/tutup kuis, kontrol visibilitas pembahasan, dan waktu pengerjaan.
