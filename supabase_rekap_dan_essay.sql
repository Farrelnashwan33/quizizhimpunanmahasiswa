-- ====================================================================================
-- MIGRATION RESMI: PERBAIKAN PENYIMPANAN ESSAY & VIEW REKAPITULASI
-- QUIZ KADERISASI TINGKAT I HIMA FST UT BANDUNG
-- ====================================================================================
-- STRUKTUR TABEL YANG DIGUNAKAN (SESUAI DATABASE ASLI SUPABASE):
-- 1. profiles: id, full_name, nim, email, program_studi, whatsapp, role
-- 2. quizzes: id, title, description, duration_minutes, is_active, show_result, allow_retry
-- 3. questions: id, quiz_id, question_number, section, question_text, option_a..d, correct_answer, explanation
-- 4. quiz_attempts: id, quiz_id, student_id, started_at, submitted_at, status, score, correct_count, wrong_count, total_questions
-- 5. answers: id, attempt_id, question_id, selected_answer, is_correct, answered_at
-- ====================================================================================

-- 1. Pastikan Ekstensi UUID Tersedia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Pastikan Tipe Enum Tersedia
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('mahasiswa', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'timed_out');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Pastikan Tabel Dasar Supabase Ada (Jika Belum Ada)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    nim TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    program_studi TEXT NOT NULL,
    whatsapp TEXT,
    role user_role DEFAULT 'mahasiswa'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 60 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    show_result BOOLEAN DEFAULT true NOT NULL,
    allow_retry BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    section TEXT NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_quiz_question_number UNIQUE (quiz_id, question_number)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    submitted_at TIMESTAMPTZ,
    status attempt_status DEFAULT 'in_progress'::attempt_status NOT NULL,
    score NUMERIC(5, 2),
    correct_count INTEGER DEFAULT 0 NOT NULL,
    wrong_count INTEGER DEFAULT 0 NOT NULL,
    total_questions INTEGER DEFAULT 30 NOT NULL
);

CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_answer TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

-- ====================================================================================
-- 4. MIGRASI TIPE KOLOM ESSAY (UBAH DARI VARCHAR(1) MENJADI TEXT)
-- ====================================================================================

-- Ubah selected_answer pada answers agar bisa menampung jawaban essay panjang
ALTER TABLE public.answers ALTER COLUMN selected_answer TYPE TEXT;

-- Ubah correct_answer pada questions agar bisa menampung kunci referensi essay
ALTER TABLE public.questions ALTER COLUMN correct_answer TYPE TEXT;

-- Pastikan unique constraint pada answers untuk upsert jawaban
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_attempt_question'
    ) THEN
        ALTER TABLE public.answers ADD CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id);
    END IF;
EXCEPTION
    WHEN others THEN null;
END $$;

-- ====================================================================================
-- 5. SEED / UPDATE DATA DEFAULT QUIZ & 30 SOAL ESSAY
-- ====================================================================================

-- A. Insert Default Quiz
INSERT INTO public.quizzes (
    id,
    title,
    description,
    duration_minutes,
    is_active,
    show_result,
    allow_retry
)
VALUES (
    '11111111-1111-1111-1111-111111111111'::UUID,
    'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
    'Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi. Terdiri dari 30 butir soal essay yang mencakup Nilai Dasar, Gerakan Mahasiswa, Tridharma Perguruan Tinggi, Peran Mahasiswa, Organisasi HIMA FST, dan Studi Kasus.',
    60,
    true,
    true,
    false
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    duration_minutes = EXCLUDED.duration_minutes,
    is_active = EXCLUDED.is_active;

-- B. Upsert 30 Soal Essay
INSERT INTO public.questions (
    id, quiz_id, question_number, section, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation
) VALUES
(
    '00000000-0000-0000-0000-000000000001'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    1,
    'Nilai dan Karakter Dasar',
    'Etika dalam organisasi pada dasarnya diperlukan untuk...',
    'Membatasi kebebasan anggota dalam berorganisasi',
    'Membuat anggota mengikuti semua keputusan senior',
    'Menjaga hubungan antarwarga organisasi agar berjalan harmonis',
    'Membuat organisasi terlihat lebih formal',
    'Etika dalam organisasi berfungsi sebagai pedoman moral dan tata kelakuan untuk menciptakan serta menjaga hubungan yang harmonis, saling menghormati dan menghargai, menjaga ketertiban, mencegah konflik internal, serta membangun iklim kerja sama yang kondusif dan produktif antaranggota demi mencapai tujuan bersama organisasi.',
    'Etika berorganisasi menjadi landasan moral fundamental dalam memelihara keharmonisan, rasa saling menghargai, keteraturan, dan iklim kerja sama tim yang solid.'
),
(
    '00000000-0000-0000-0000-000000000002'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    2,
    'Nilai dan Karakter Dasar',
    'Perilaku yang sesuai dengan etika komunikasi adalah...',
    'Memotong pembicaraan ketika tidak setuju',
    'Mendengarkan lawan bicara hingga selesai sebelum memberikan tanggapan',
    'Mengabaikan pendapat yang berbeda',
    'Menyampaikan pendapat dengan nada tinggi agar didengar',
    'Mendengarkan dan menyimak lawan bicara hingga selesai secara utuh dengan penuh perhatian tanpa memotong pembicaraan, kemudian menyampaikan tanggapan, gagasan, atau kritik secara santun, rasional, objektif, dan dengan tutur kata yang menghargai keberagaman pendapat.',
    'Etika komunikasi berlandaskan pada kemampuan menyimak secara tuntas (active listening), empati, serta merespons dengan bahasa yang santun, tertib, dan berbasis argumentasi rasional.'
),
(
    '00000000-0000-0000-0000-000000000003'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    3,
    'Nilai dan Karakter Dasar',
    'Disiplin dalam organisasi ditunjukkan melalui...',
    'Melaksanakan tugas hanya ketika diingatkan',
    'Hadir tepat waktu dan menyelesaikan tugas sesuai batas waktu',
    'Mengutamakan kepentingan pribadi',
    'Menghindari tugas yang dianggap sulit',
    'Komitmen hadir tepat waktu dalam setiap agenda atau pertemuan organisasi, mematuhi peraturan dan kesepakatan internal yang berlaku, serta menuntaskan seluruh tugas dan amanah tanggung jawab secara optimal sesuai batas waktu (deadline) yang telah disepakati bersama.',
    'Disiplin organisasi diwujudkan melalui manajemen waktu yang baik, ketaatan pada kesepakatan aturan, dan penyelesaian tugas tepat waktu secara bertanggung jawab.'
),
(
    '00000000-0000-0000-0000-000000000004'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    4,
    'Nilai dan Karakter Dasar',
    'Seorang kader yang memiliki integritas adalah kader yang...',
    'Selalu terlihat aktif di depan pengurus',
    'Mampu memengaruhi anggota lain',
    'Memiliki kesesuaian antara perkataan dan perbuatannya',
    'Selalu mendapatkan jabatan dalam organisasi',
    'Kader yang memiliki keselarasan, kejujuran, dan konsistensi utuh antara nilai moral, apa yang diucapkan atau dijanjikan, dengan apa yang dilakukan dalam tindakan nyata, bersikap jujur, amanah, serta berani memegang teguh kebenaran dalam berbagai situasi organisasi.',
    'Integritas adalah kesatuan antara hati, perkataan, dan perbuatan yang dilandasi nilai kejujuran, amanah, serta konsistensi memegang prinsip kebenaran.'
),
(
    '00000000-0000-0000-0000-000000000005'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    5,
    'Nilai dan Karakter Dasar',
    'Manakah yang merupakan bentuk tanggung jawab seorang kader?',
    'Melempar kesalahan kepada anggota lain',
    'Menghindari tugas ketika mengalami kesulitan',
    'Menyelesaikan amanah dan memberikan pertanggungjawaban',
    'Menyembunyikan kesalahan agar tidak mendapat teguran',
    'Melaksanakan dan menyelesaikan setiap amanah tugas yang dipercayakan secara tuntas dan berkualitas, berani menanggung segala konsekuensi atas pekerjaan yang dilakukan, serta menyampaikan laporan pertanggungjawaban (LPJ) dengan jujur, terbuka, dan akuntabel.',
    'Tanggung jawab kader tercermin dari kesungguhan menuntaskan amanah tugas serta keterbukaan dan kejujuran dalam menyampaikan pertanggungjawaban.'
),
(
    '00000000-0000-0000-0000-000000000006'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    6,
    'Nilai dan Karakter Dasar',
    'Sikap kolektif kolegial mengutamakan...',
    'Kepentingan pribadi',
    'Persaingan antaranggota',
    'Kebersamaan, musyawarah, dan kepentingan bersama',
    'Keputusan dari anggota yang paling senior',
    'Mengedepankan semangat kebersamaan, kepemimpinan bersama yang setara, pengambilan keputusan melalui musyawarah untuk mufakat, serta senantiasa mendahulukan kepentingan dan kemaslahatan organisasi di atas kepentingan pribadi maupun golongan.',
    'Prinsip kolektif kolegial menitikberatkan pada musyawarah mufakat, kesetaraan, gotong royong, dan komitmen mendahulukan kepentingan bersama organisasi.'
),
(
    '00000000-0000-0000-0000-000000000007'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    7,
    'Nilai dan Karakter Dasar',
    'Seorang kader membaca informasi penting di grup organisasi kemudian segera memberikan respons. Sikap tersebut menunjukkan...',
    'Empati',
    'Responsif',
    'Konsistensi',
    'Idealisme',
    'Sikap responsif dan proaktif, yaitu kesigapan, kepekaan, dan kecepatan dalam menanggapi informasi atau kebutuhan koordinasi organisasi guna memperlancar alur komunikasi, kepastian informasi, dan kerja tim secara efektif.',
    'Sikap responsif menunjukkan kepedulian tinggi, komunikasi tanggap, dan komitmen menjaga kelancaran alur koordinasi serta kerja sama tim.'
),
(
    '00000000-0000-0000-0000-000000000008'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    8,
    'Nilai dan Karakter Dasar',
    'Tidak menunggu diperintah untuk melakukan sesuatu yang bermanfaat dalam organisasi merupakan bentuk...',
    'Inisiatif',
    'Senioritas',
    'Individualisme',
    'Kontrol sosial',
    'Sikap inisiatif dan kemandirian, yaitu kesadaran diri yang peka untuk melakukan tindakan positif, solutif, dan bermanfaat bagi kemajuan organisasi tanpa harus selalu menunggu instruksi, komando, atau perintah dari orang lain.',
    'Inisiatif mencerminkan kepemimpinan diri, kepekaan situasional, dan dorongan sukarela untuk bergerak memberikan manfaat nyata bagi organisasi.'
),
(
    '00000000-0000-0000-0000-000000000009'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    9,
    'Gerakan Mahasiswa',
    'Salah satu karakteristik gerakan mahasiswa adalah kritis. Maksudnya adalah...',
    'Selalu menolak keputusan yang dibuat organisasi',
    'Berani menilai dan menyampaikan sesuatu berdasarkan fakta',
    'Tidak mau mengikuti aturan',
    'Selalu menyampaikan kritik secara terbuka tanpa mempertimbangkan etika',
    'Kemampuan dan keberanian intelektual untuk menganalisis, mengkaji, dan menilai suatu fenomena, aturan, atau kebijakan secara mendalam, objektif, dan rasional berbasis data/fakta empiris, serta mampu menawarkan rekomendasi solusi alternatif yang konstruktif.',
    'Sikap kritis mahasiswa berpijak pada analisis fakta objektif, kebenaran ilmiah, dan berorientasi pada penyampaian saran/solusi yang konstruktif.'
),
(
    '00000000-0000-0000-0000-000000000010'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    10,
    'Gerakan Mahasiswa',
    'Gerakan mahasiswa lahir dari kesadaran terhadap...',
    'Kekuasaan dan kepentingan kelompok',
    'Popularitas dan eksistensi mahasiswa',
    'Ilmu pengetahuan dan kepedulian terhadap nasib bangsa',
    'Kepentingan organisasi mahasiswa semata',
    'Kesadaran moral dan intelektual atas ilmu pengetahuan yang dimiliki, panggilan nurani, serta kepedulian tulus terhadap problematika sosial, keadilan, pembelaan nasib rakyat, dan masa depan kemajuan bangsa.',
    'Gerakan mahasiswa bermula dari perpaduan tanggung jawab intelektual, kemurnian idealisme, dan kepedulian mendalam pada nasib masyarakat dan bangsa.'
),
(
    '00000000-0000-0000-0000-000000000011'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    11,
    'Gerakan Mahasiswa',
    'Salah satu nilai yang menjadi landasan perjuangan gerakan mahasiswa adalah...',
    'Mengutamakan kepentingan golongan',
    'Mengutamakan kebenaran dan keadilan',
    'Menghindari semua bentuk perbedaan pendapat',
    'Mempertahankan keadaan lama',
    'Menjunjung tinggi nilai kebenaran ilmiah, keadilan sosial, kejujuran, kemanusiaan, independensi idealisme, serta konsistensi dalam memperjuangkan aspirasi dan hak-hak masyarakat luas tanpa terpengaruh kepentingan pragmatis.',
    'Kebenaran ilmiah, keadilan sosial, moralitas, dan independensi idealisme merupakan pilar abadi perjuangan gerakan mahasiswa.'
),
(
    '00000000-0000-0000-0000-000000000012'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    12,
    'Tridharma Perguruan Tinggi',
    'Berikut yang termasuk Tridharma Perguruan Tinggi adalah...',
    'Pendidikan dan pengajaran, penelitian dan pengembangan, serta pengabdian kepada masyarakat',
    'Pendidikan, organisasi, dan kepemimpinan',
    'Penelitian, organisasi, dan pengabdian',
    'Pendidikan, politik, dan pengabdian',
    'Tiga pilar kewajiban pokok sivitas akademika perguruan tinggi yang terdiri atas: 1. Pendidikan dan Pengajaran, 2. Penelitian dan Pengembangan (Riset), serta 3. Pengabdian kepada Masyarakat.',
    'Tridharma Perguruan Tinggi merupakan trilogi peran esensial kampus yang meliputi Pendidikan & Pengajaran, Penelitian & Pengembangan, dan Pengabdian kepada Masyarakat.'
),
(
    '00000000-0000-0000-0000-000000000013'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    13,
    'Tridharma Perguruan Tinggi',
    'Contoh penerapan pendidikan dan pengajaran oleh mahasiswa adalah...',
    'Belajar dengan tekun dan berbagi pengetahuan kepada sesama',
    'Hanya mengejar nilai akademik',
    'Menghindari kegiatan akademik',
    'Mengutamakan organisasi daripada pendidikan',
    'Belajar secara tekun dan bersungguh-sungguh dalam menuntut ilmu, mengembangkan wawasan akademik dan keilmuan, berdiskusi kritis, serta aktif membagikan ilmu, keterampilan, atau mentoring pengetahuan kepada sesama mahasiswa dan lingkungan sekitar.',
    'Penerapan pilar pendidikan terwujud dalam kegigihan belajar, peningkatan kapasitas intelektual, serta semangat berbagi ilmu pengetahuan kepada sesama.'
),
(
    '00000000-0000-0000-0000-000000000014'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    14,
    'Tridharma Perguruan Tinggi',
    'Mahasiswa yang melakukan penelitian untuk membantu memecahkan permasalahan di lingkungan sekitarnya sedang menerapkan...',
    'Pendidikan dan pengajaran',
    'Penelitian dan pengembangan',
    'Pengabdian kepada masyarakat',
    'Pengembangan organisasi',
    'Pilar Penelitian dan Pengembangan yang berintegrasi langsung dengan Pengabdian kepada Masyarakat, yaitu memanfaatkan metode ilmiah, riset, kajian teknologi/sains untuk menghasilkan temuan inovatif dan solusi aplikatif bagi permasalahan nyata masyarakat.',
    'Riset berbasis pemecahan masalah masyarakat mengintegrasikan keilmuan penelitian dengan wujud nyata pengabdian kepada masyarakat.'
),
(
    '00000000-0000-0000-0000-000000000015'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    15,
    'Tridharma Perguruan Tinggi',
    'Mengapa mahasiswa perlu berusaha menyeimbangkan ketiga unsur Tridharma?',
    'Karena ketiganya merupakan kegiatan tambahan mahasiswa',
    'Karena ketiganya saling melengkapi dan membentuk mahasiswa yang utuh',
    'Karena mahasiswa harus mengikuti semua kegiatan kampus',
    'Karena pengabdian lebih penting daripada pendidikan',
    'Karena ketiga unsur Tridharma saling melengkapi, terhubung secara holistik, dan saling menguatkan untuk membentuk profil sarjana/mahasiswa yang utuh: unggul dalam wawasan teori akademis (pendidikan), mampu berpikir kritis-inovatif memecahkan masalah (penelitian), serta memiliki kepekaan sosial dan kebermanfaatan nyata bagi masyarakat (pengabdian).',
    'Keseimbangan ketiga pilar Tridharma melahirkan insan akademis yang berilmu amaliah, berdaya riset tinggi, dan berjiwa sosial dalam menjawab tantangan bangsa.'
),
(
    '00000000-0000-0000-0000-000000000016'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    16,
    'Peran dan Fungsi Mahasiswa',
    'Peran Iron Stock menggambarkan mahasiswa sebagai...',
    'Penjaga nilai',
    'Calon pemimpin masa depan',
    'Pengawas masyarakat',
    'Penggerak kegiatan sosial',
    'Generasi penerus bangsa, aset cadangan masa depan, dan calon pemimpin masa depan yang dipersiapkan dengan integritas moral yang kuat, kapasitas keilmuan mumpuni, dan kepemimpinan berkualitas untuk melanjutkan estafet kepemimpinan bangsa dan organisasi.',
    'Sebagai Iron Stock, mahasiswa dipersiapkan menjadi generasi pelanjut dan bibit pemimpin masa depan yang berkarakter tangguh dan bermoral tinggi.'
),
(
    '00000000-0000-0000-0000-000000000017'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    17,
    'Peran dan Fungsi Mahasiswa',
    'Ketika mahasiswa menjaga nilai kebenaran, keadilan, kesusilaan, dan moralitas, ia menjalankan peran...',
    'Iron Stock',
    'Guardian of Value',
    'Social Control',
    'Agent of Change',
    'Peran Guardian of Value (penjaga nilai-nilai luhur), yaitu mahasiswa bertindak sebagai penjaga, pemelihara, benteng pertahanan moral, dan teladan dalam mengamalkan nilai-nilai etika, kebenaran, keadilan, kejujuran, dan kesusilaan dalam kehidupan kampus maupun bermasyarakat.',
    'Guardian of Value menempatkan mahasiswa sebagai benteng moral dan teladan dalam menjaga serta melestarikan nilai-nilai kebenaran dan etika luhur.'
),
(
    '00000000-0000-0000-0000-000000000018'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    18,
    'Peran dan Fungsi Mahasiswa',
    'Peran Social Control berarti mahasiswa...',
    'Mengontrol seluruh kegiatan organisasi',
    'Mengawasi agar kehidupan di kampus dan masyarakat berjalan sesuai aturan dan keadilan',
    'Mengatur mahasiswa lainnya',
    'Mengambil alih kewenangan pihak kampus',
    'Peran Kontrol Sosial (Social Control), di mana mahasiswa bertindak sebagai pengawas independen yang peka, kritis, dan berani mengoreksi serta mengawal kebijakan kampus maupun pemerintah agar senantiasa berjalan sesuai aturan, berpihak pada keadilan, dan memperjuangkan kemaslahatan masyarakat.',
    'Social Control menegaskan peran mahasiswa sebagai jembatan aspirasi, pengawas sosial, dan pengawal kebijakan agar senantiasa adil dan sesuai norma.'
),
(
    '00000000-0000-0000-0000-000000000019'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    19,
    'Peran dan Fungsi Mahasiswa',
    'Mahasiswa yang membawa gagasan baru dan mendorong perubahan menuju keadaan yang lebih baik menjalankan peran...',
    'Moral Force',
    'Guardian of Value',
    'Agent of Change',
    'Iron Stock',
    'Peran Agent of Change (agen penggerak perubahan), yaitu mahasiswa bertindak sebagai pelopor, inovator, dan motor penggerak transformasi positif yang membawa ide-ide pembaruan kreatif dan solusi nyata guna memajukan masyarakat ke arah yang lebih baik.',
    'Agent of Change mencerminkan kapasitas mahasiswa sebagai inisiator perubahan sosial yang progresif, visioner, dan solutif.'
),
(
    '00000000-0000-0000-0000-000000000020'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    20,
    'Organisasi Kemahasiswaan dan HIMA FST',
    'Fungsi utama organisasi kemahasiswaan adalah...',
    'Menjadi tempat mendapatkan jabatan',
    'Menjadi wadah pengembangan potensi, kepemimpinan, kerja sama, dan pembelajaran organisasi',
    'Menggantikan kegiatan akademik mahasiswa',
    'Menjadi tempat mencari popularitas',
    'Sebagai wadah aspirasi dan pengembangan potensi minat, bakat, keilmuan, sarana pembelajaran kepemimpinan (leadership), melatih kerja sama tim (teamwork), memperluas jaringan/relasi, mengasah soft skill manajemen, serta sarana kontribusi nyata mahasiswa bagi almamater dan masyarakat.',
    'Organisasi kemahasiswaan seperti HIMA FST menjadi wadah kawah candradimuka dalam membentuk karakter kepemimpinan, kolaborasi, dan kontribusi nyata mahasiswa.'
),
(
    '00000000-0000-0000-0000-000000000021'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    21,
    'Studi Kasus',
    'Dalam sebuah forum, seorang kader tidak setuju dengan pendapat peserta lain. Ia kemudian memotong pembicaraan dan menyampaikan bahwa pendapat tersebut "tidak masuk akal". Sikap yang seharusnya dilakukan kader adalah...',
    'Membiarkan karena setiap orang bebas berpendapat',
    'Menunggu giliran berbicara dan menyampaikan ketidaksetujuan dengan bahasa yang santun',
    'Membalas dengan perkataan yang lebih keras',
    'Meminta pimpinan forum menghentikan peserta tersebut',
    'Menerapkan etika forum dengan menyimak dan mendengarkan pembicaraan peserta lain sampai selesai secara tuntas, menunggu giliran berbicara atau meminta izin pimpinan sidang secara tertib, kemudian menyampaikan pandangan atau argumentasi penolakan secara santun, rasional, objektif, dan fokus pada substansi masalah tanpa menyerang pribadi.',
    'Etika musyawarah dan persidangan menuntut ketertiban, saling menghargai giliran bicara, kesantunan berbahasa, dan argumentasi rasional berbasis fakta.'
),
(
    '00000000-0000-0000-0000-000000000022'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    22,
    'Studi Kasus',
    'Kamu mendapat tugas organisasi dengan batas waktu Jumat pukul 20.00. Pada Kamis malam kamu menyadari bahwa tugas tersebut belum selesai karena mengalami kendala. Apa tindakan paling tepat?',
    'Diam sampai batas waktu berlalu',
    'Menyalahkan anggota lain',
    'Mengomunikasikan kendala dan perkembangan pekerjaan kepada pihak terkait serta mencari solusi',
    'Menunggu sampai ditanya oleh ketua',
    'Segera mengomunikasikan progres dan kendala yang dihadapi secara proaktif, transparan, dan jujur kepada ketua atau penanggung jawab tim sebelum batas waktu berakhir, serta berkoordinasi bersama untuk mencari solusi, meminta arahan, atau mendistribusikan bantuan agar tugas tetap tuntas.',
    'Komunikasi proaktif sebelum batas waktu (deadline) menunjukkan kedewasaan berorganisasi, tanggung jawab, dan profesionalitas dalam manajemen kendala tim.'
),
(
    '00000000-0000-0000-0000-000000000023'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    23,
    'Studi Kasus',
    'Kamu mengetahui bahwa temanmu melakukan kesalahan dalam laporan organisasi. Kesalahan tersebut berpotensi menyebabkan informasi yang disampaikan menjadi tidak benar. Apa yang sebaiknya kamu lakukan?',
    'Membiarkannya karena bukan tugasmu',
    'Membicarakan kesalahannya kepada anggota lain',
    'Mengingatkan dan mengajak memperbaiki laporan tersebut secara jujur',
    'Mengubah laporan diam-diam tanpa memberitahunya',
    'Mengingatkan dan menegur rekan tersebut secara pribadi (empatik dan tertutup agar tidak mempermalukannya), menyampaikan letak kesalahan dengan bahasa yang baik, serta mengajaknya berkolaborasi untuk merevisi, mengoreksi, dan memperbaiki laporan tersebut secara jujur dan transparan.',
    'Sikap saling mengingatkan secara konstruktif dan membantu perbaikan laporan mencerminkan kepedulian, integritas, dan kejujuran dalam berorganisasi.'
),
(
    '00000000-0000-0000-0000-000000000024'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    24,
    'Studi Kasus',
    'Dalam sebuah kepanitiaan, ada anggota yang selalu ingin pendapatnya diterima dan tidak mau mempertimbangkan pendapat anggota lain. Jika kamu berada dalam tim tersebut, tindakan yang paling sesuai dengan prinsip kolektif kolegial adalah...',
    'Membiarkannya agar tidak terjadi konflik',
    'Mengikuti semua keinginannya',
    'Mengajak berdiskusi dan mencari keputusan melalui musyawarah dengan mengutamakan kepentingan bersama',
    'Membentuk kelompok baru tanpa memberitahunya',
    'Mengajak anggota tersebut berdialog dan berdiskusi secara terbuka dalam suasana kekeluargaan yang santun, menjelaskan perspektif tim, mengedepankan musyawarah untuk mufakat, serta menekankan pentingnya mendahulukan tujuan dan kepentingan bersama organisasi di atas ego atau kepentingan pribadi.',
    'Prinsip kolektif kolegial menyelesaikan perbedaan dengan musyawarah mufakat, menurunkan ego pribadi, dan memprioritaskan kesuksesan bersama.'
),
(
    '00000000-0000-0000-0000-000000000025'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    25,
    'Studi Kasus',
    'Kamu melihat seorang anggota baru kesulitan mengikuti alur kerja organisasi. Tidak ada yang memintamu membantu, tetapi kamu memiliki waktu untuk membantunya. Sikap yang paling sesuai dengan materi adalah...',
    'Menunggu sampai ia meminta bantuan',
    'Membantu karena menunjukkan inisiatif dan kepedulian terhadap sesama anggota',
    'Membiarkannya agar belajar sendiri',
    'Melaporkannya kepada ketua karena dianggap tidak mampu',
    'Mengambil inisiatif secara sukarela untuk mendekati, mendampingi, mengarahkan, dan membantunya memahami alur kerja kepanitiaan/organisasi sebagai wujud kepedulian, empati, dan solidaritas sesama kader demi terciptanya soliditas tim.',
    'Inisiatif merangkul dan membimbing kader baru memperkuat rasa kekeluargaan, kaderisasi berkelanjutan, dan efektivitas kerja organisasi.'
),
(
    '00000000-0000-0000-0000-000000000026'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    26,
    'Studi Kasus',
    'Di lingkungan kampus terdapat suatu permasalahan yang menurutmu tidak sesuai dengan prinsip keadilan. Kamu ingin menyampaikan kritik. Tindakan yang paling mencerminkan karakter gerakan mahasiswa adalah...',
    'Menyebarkan tuduhan melalui media sosial',
    'Mengajak mahasiswa lain melakukan tindakan tanpa mencari fakta',
    'Mengumpulkan fakta, menyampaikan kritik secara kritis tetapi tetap santun, dan mengupayakan solusi',
    'Membiarkannya karena mahasiswa tidak boleh mencampuri urusan kampus',
    'Mengumpulkan data, fakta, dan bukti empiris yang valid di lapangan terlebih dahulu, menyusun telaah/kajian ilmiah secara komprehensif dan objektif, lalu menyampaikan aspirasi atau kritik secara santun dan terstruktur melalui forum dialog/jalur resmi dengan menyertakan tawaran rekomendasi solusi konkret.',
    'Karakter gerakan mahasiswa berpijak pada kecendekiaan: kritik berbasis kajian fakta objektif, disampaikan secara beretika, dan berorientasi pada tawaran solusi perbaikan.'
),
(
    '00000000-0000-0000-0000-000000000027'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    27,
    'Studi Kasus',
    'Kamu menemukan permasalahan masyarakat yang berkaitan dengan bidang keilmuanmu. Kamu kemudian mempelajari masalah tersebut, melakukan penelitian sederhana, dan hasilnya digunakan untuk membantu masyarakat. Hal ini menunjukkan hubungan antara...',
    'Pendidikan dan pengajaran dengan organisasi',
    'Penelitian dan pengembangan dengan pengabdian kepada masyarakat',
    'Organisasi dengan kepemimpinan',
    'Iron Stock dengan Guardian of Value',
    'Keterpaduan dan sinergi harmonis antara pilar Penelitian dan Pengembangan (riset keilmuan sains/teknologi) dengan pilar Pengabdian kepada Masyarakat, yaitu mengaplikasikan hasil riset dan metode ilmiah untuk menyelesaikan persoalan nyata di tengah masyarakat.',
    'Penerapan hasil penelitian ilmiah untuk kemaslahatan publik merupakan integrasi nyata dari pilar ke-2 dan ke-3 Tridharma Perguruan Tinggi.'
),
(
    '00000000-0000-0000-0000-000000000028'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    28,
    'Studi Kasus',
    'Dalam rapat HIMA, keputusan telah diambil melalui mekanisme musyawarah. Meskipun pendapatmu tidak menjadi keputusan akhir, kamu tetap melaksanakan keputusan tersebut dengan baik. Sikap tersebut mencerminkan...',
    'Individualisme',
    'Kolektif kolegial dan etika forum',
    'Kurangnya sikap kritis',
    'Ketergantungan kepada senior',
    'Penerapan prinsip kolektif kolegial, etika berorganisasi, kedewasaan sikap (sikap sportif/legawa), serta komitmen loyalitas yang tinggi untuk menghormati dan menjalankan keputusan konsensus musyawarah mufakat demi kepentingan bersama.',
    'Menghormati dan melaksanakan keputusan musyawarah dengan penuh tanggung jawab adalah cermin kedewasaan berdemokrasi dan komitmen kolektif kolegial.'
),
(
    '00000000-0000-0000-0000-000000000029'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    29,
    'Studi Kasus',
    'Seorang kader berkata, "Saya ikut HIMA hanya supaya punya pengalaman dan sertifikat. Kalau sudah selesai kaderisasi, urusan organisasi bukan tanggung jawab saya." Berdasarkan materi, pernyataan tersebut kurang sesuai karena...',
    'Kader harus selalu menjadi pengurus',
    'Organisasi hanya boleh diikuti mahasiswa tertentu',
    'Organisasi merupakan ruang pembelajaran untuk mengembangkan kemampuan, tanggung jawab, kerja sama, dan kontribusi',
    'Semua mahasiswa wajib memiliki jabatan organisasi',
    'Organisasi kemahasiswaan bukan sekadar sarana formalitas mencari sertifikat atau kepentingan pragmatis pribadi, melainkan wahana proses pembelajaran jangka panjang untuk melatih tanggung jawab, integritas, kepemimpinan, kepedulian sosial, kerja sama, dan memberikan kontribusi nyata yang berkelanjutan.',
    'Nilai sejati berorganisasi terletak pada proses pembentukan karakter, pengabdian yang tulus, tanggung jawab, dan kontribusi nyata, bukan sekadar sertifikat.'
),
(
    '00000000-0000-0000-0000-000000000030'::UUID,
    '11111111-1111-1111-1111-111111111111'::UUID,
    30,
    'Studi Kasus',
    'Kamu diberi kesempatan untuk ikut berkontribusi dalam HIMA FST UT Bandung. Setelah memahami materi Tingkat I, tindakan yang paling mencerminkan pemahamanmu adalah...',
    'Aktif hanya ketika ada keuntungan bagi diri sendiri',
    'Menunggu selalu diberikan tugas',
    'Berkontribusi sesuai kemampuan, menjaga etika, bertanggung jawab, bekerja sama, serta ikut mengembangkan organisasi dan memberikan manfaat',
    'Berusaha mendapatkan jabatan agar lebih dikenal',
    'Berkomitmen memberikan kontribusi aktif, tulus, dan optimal sesuai minat serta keahlian, senantiasa menjaga etika moral dan integritas, bertanggung jawab penuh atas setiap amanah yang diemban, membina kerja sama solid dengan seluruh pengurus, serta terus berikhtiar memajukan HIMA FST UT Bandung agar memberi manfaat luas bagi mahasiswa dan masyarakat.',
    'Pemahaman utuh kaderisasi bermuara pada dedikasi tulus, integritas pribadi, kerja sama harmonis, dan komitmen kontribusi nyata memajukan HIMA FST UT Bandung.'
)
ON CONFLICT (quiz_id, question_number) DO UPDATE SET
    section = EXCLUDED.section,
    question_text = EXCLUDED.question_text,
    option_a = EXCLUDED.option_a,
    option_b = EXCLUDED.option_b,
    option_c = EXCLUDED.option_c,
    option_d = EXCLUDED.option_d,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation;

-- ====================================================================================
-- 6. BUAT VIEW REKAP NILAI (JOIN RESMI: quiz_attempts + profiles + quizzes + answers)
-- ====================================================================================

-- Drop view lama jika sudah pernah dibuat agar tidak ada konflik tipe data
DROP VIEW IF EXISTS public.rekap_nilai_mahasiswa CASCADE;
DROP VIEW IF EXISTS public.rekap_jawaban_essay CASCADE;

-- View 1: Rekap Nilai Mahasiswa (Untuk SQL Editor)
CREATE VIEW public.rekap_nilai_mahasiswa AS
SELECT
    p.full_name AS nama_siswa,
    p.nim AS nim,
    p.program_studi AS program_studi,
    p.whatsapp AS whatsapp,
    p.email AS email,
    COALESCE(q.title, 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung') AS nama_quiz,
    qa.id AS attempt_id,
    CASE
        WHEN qa.status = 'completed' THEN 'Selesai'
        WHEN qa.status = 'timed_out' THEN 'Waktu Habis'
        ELSE 'Sedang Mengerjakan'
    END AS status_pengerjaan,
    qa.total_questions AS total_soal,
    COUNT(a.id) FILTER (WHERE a.selected_answer IS NOT NULL AND TRIM(a.selected_answer) <> '') AS jumlah_jawaban_terisi,
    qa.correct_count AS jumlah_jawaban_sesuai,
    qa.wrong_count AS jumlah_jawaban_evaluasi,
    COALESCE(qa.score, 0) AS skor,
    CASE
        WHEN qa.status = 'completed' AND COALESCE(qa.score, 0) >= 65 THEN 'LULUS'
        WHEN qa.status = 'completed' AND COALESCE(qa.score, 0) < 65 THEN 'TIDAK LULUS'
        ELSE 'Belum Selesai'
    END AS status_kelulusan,
    qa.started_at AS waktu_mulai,
    qa.submitted_at AS waktu_submit
FROM public.quiz_attempts qa
JOIN public.profiles p ON p.id = qa.student_id
LEFT JOIN public.quizzes q ON q.id = qa.quiz_id
LEFT JOIN public.answers a ON a.attempt_id = qa.id
GROUP BY
    qa.id,
    p.full_name,
    p.nim,
    p.program_studi,
    p.whatsapp,
    p.email,
    q.title,
    qa.status,
    qa.total_questions,
    qa.correct_count,
    qa.wrong_count,
    qa.score,
    qa.started_at,
    qa.submitted_at
ORDER BY
    qa.submitted_at DESC NULLS LAST,
    qa.started_at DESC;

-- View 2: Rekap Detail Jawaban Essay Per Nomor Soal (Untuk SQL Editor)
CREATE VIEW public.rekap_jawaban_essay AS
SELECT
    p.full_name AS nama_siswa,
    p.nim AS nim,
    p.program_studi AS program_studi,
    qs.question_number AS nomor_soal,
    qs.section AS kategori_soal,
    qs.question_text AS pertanyaan_essay,
    COALESCE(a.selected_answer, 'Belum dijawab') AS jawaban_mahasiswa,
    qs.correct_answer AS referensi_kunci_jawaban,
    CASE
        WHEN a.is_correct = true THEN 'Sesuai'
        WHEN a.is_correct = false THEN 'Perlu Evaluasi'
        ELSE 'Belum Dinilai'
    END AS status_jawaban,
    a.answered_at AS waktu_menjawab,
    qa.id AS attempt_id
FROM public.quiz_attempts qa
JOIN public.profiles p ON p.id = qa.student_id
CROSS JOIN public.questions qs
LEFT JOIN public.answers a ON a.attempt_id = qa.id AND a.question_id = qs.id
WHERE qs.quiz_id = qa.quiz_id
ORDER BY
    qa.submitted_at DESC NULLS LAST,
    p.full_name,
    qs.question_number ASC;

-- ====================================================================================
-- 7. RLS & PERMISSIONS (KEAMANAN PENYIMPANAN SUPABASE)
-- ====================================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.quizzes TO anon, authenticated, service_role;
GRANT SELECT ON public.questions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.quiz_attempts TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE ON public.answers TO anon, authenticated, service_role;
GRANT SELECT ON public.rekap_nilai_mahasiswa TO anon, authenticated, service_role, postgres;
GRANT SELECT ON public.rekap_jawaban_essay TO anon, authenticated, service_role, postgres;

DROP POLICY IF EXISTS "Allow answer upsert for student attempt" ON public.answers;
CREATE POLICY "Allow answer upsert for student attempt"
    ON public.answers FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow quiz_attempts management" ON public.quiz_attempts;
CREATE POLICY "Allow quiz_attempts management"
    ON public.quiz_attempts FOR ALL
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow profiles management" ON public.profiles;
CREATE POLICY "Allow profiles management"
    ON public.profiles FOR ALL
    USING (true)
    WITH CHECK (true);
