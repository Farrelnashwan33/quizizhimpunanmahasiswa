-- ====================================================================
-- MIGRATION 003: SEED DATA 30 SOAL KADERISASI TINGKAT I HIMA FST UT BANDUNG
-- ====================================================================

DO $$
DECLARE
    v_quiz_id UUID := '11111111-1111-1111-1111-111111111111'::UUID;
BEGIN
    -- Insert Default Quiz
    INSERT INTO public.quizzes (id, title, description, duration_minutes, is_active, show_result, allow_retry)
    VALUES (
        v_quiz_id,
        'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
        'Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi. Terdiri dari 30 soal pilihan ganda yang mencakup nilai dasar, gerakan mahasiswa, tridharma perguruan tinggi, peran mahasiswa, organisasi HIMA FST, dan studi kasus.',
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

    -- Delete old questions for this quiz to avoid duplicate key conflicts
    DELETE FROM public.questions WHERE quiz_id = v_quiz_id;

    -- Insert 30 Official Questions
    INSERT INTO public.questions (quiz_id, question_number, section, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) VALUES
    (
        v_quiz_id, 1, 'Nilai dan Karakter Dasar',
        'Etika dalam organisasi pada dasarnya diperlukan untuk...',
        'Membatasi kebebasan anggota dalam berorganisasi',
        'Membuat anggota mengikuti semua keputusan senior',
        'Menjaga hubungan antarwarga organisasi agar berjalan harmonis',
        'Membuat organisasi terlihat lebih formal',
        'C',
        'Etika organisasi berfungsi memelihara keharmonisan, saling menghormati, dan keteraturan antar anggota.'
    ),
    (
        v_quiz_id, 2, 'Nilai dan Karakter Dasar',
        'Perilaku yang sesuai dengan etika komunikasi adalah...',
        'Memotong pembicaraan ketika tidak setuju',
        'Mendengarkan lawan bicara hingga selesai sebelum memberikan tanggapan',
        'Mengabaikan pendapat yang berbeda',
        'Menyampaikan pendapat dengan nada tinggi agar didengar',
        'B',
        'Etika komunikasi mengutamakan menyimak pembicaraan secara utuh sebelum merespons secara santun.'
    ),
    (
        v_quiz_id, 3, 'Nilai dan Karakter Dasar',
        'Disiplin dalam organisasi ditunjukkan melalui...',
        'Melaksanakan tugas hanya ketika diingatkan',
        'Hadir tepat waktu dan menyelesaikan tugas sesuai batas waktu',
        'Mengutamakan kepentingan pribadi',
        'Menghindari tugas yang dianggap sulit',
        'B',
        'Kedisiplinan diwujudkan dalam komitmen waktu dan penuntasan tanggung jawab sesuai tenggat.'
    ),
    (
        v_quiz_id, 4, 'Nilai dan Karakter Dasar',
        'Seorang kader yang memiliki integritas adalah kader yang...',
        'Selalu terlihat aktif di depan pengurus',
        'Mampu memengaruhi anggota lain',
        'Memiliki kesesuaian antara perkataan dan perbuatannya',
        'Selalu mendapatkan jabatan dalam organisasi',
        'C',
        'Integritas merupakan keselarasan dan kejujuran antara apa yang diucapkan dengan apa yang dilakukan.'
    ),
    (
        v_quiz_id, 5, 'Nilai dan Karakter Dasar',
        'Manakah yang merupakan bentuk tanggung jawab seorang kader?',
        'Melempar kesalahan kepada anggota lain',
        'Menghindari tugas ketika mengalami kesulitan',
        'Menyelesaikan amanah dan memberikan pertanggungjawaban',
        'Menyembunyikan kesalahan agar tidak mendapat teguran',
        'C',
        'Tanggung jawab tercermin dari penyelesaian amanah serta transparansi pertanggungjawaban.'
    ),
    (
        v_quiz_id, 6, 'Nilai dan Karakter Dasar',
        'Sikap kolektif kolegial mengutamakan...',
        'Kepentingan pribadi',
        'Persaingan antaranggota',
        'Kebersamaan, musyawarah, dan kepentingan bersama',
        'Keputusan dari anggota yang paling senior',
        'C',
        'Prinsip kolektif kolegial berlandaskan semangat kebersamaan dan musyawarah mufakat.'
    ),
    (
        v_quiz_id, 7, 'Nilai dan Karakter Dasar',
        'Seorang kader membaca informasi penting di grup organisasi kemudian segera memberikan respons. Sikap tersebut menunjukkan...',
        'Empati',
        'Responsif',
        'Konsistensi',
        'Idealisme',
        'B',
        'Sikap responsif adalah tanggap dan cepat merespons kebutuhan serta komunikasi organisasi.'
    ),
    (
        v_quiz_id, 8, 'Nilai dan Karakter Dasar',
        'Tidak menunggu diperintah untuk melakukan sesuatu yang bermanfaat dalam organisasi merupakan bentuk...',
        'Inisiatif',
        'Senioritas',
        'Individualisme',
        'Kontrol sosial',
        'A',
        'Inisiatif adalah proaktif melakukan tindakan positif tanpa harus menunggu instruksi.'
    ),

    -- B. Gerakan Mahasiswa (Soal 9-11)
    (
        v_quiz_id, 9, 'Gerakan Mahasiswa',
        'Salah satu karakteristik gerakan mahasiswa adalah kritis. Maksudnya adalah...',
        'Selalu menolak keputusan yang dibuat organisasi',
        'Berani menilai dan menyampaikan sesuatu berdasarkan fakta',
        'Tidak mau mengikuti aturan',
        'Selalu menyampaikan kritik secara terbuka tanpa mempertimbangkan etika',
        'B',
        'Sikap kritis mahasiswa berpijak pada analisis objektif dan kebenaran fakta empiris.'
    ),
    (
        v_quiz_id, 10, 'Gerakan Mahasiswa',
        'Gerakan mahasiswa lahir dari kesadaran terhadap...',
        'Kekuasaan dan kepentingan kelompok',
        'Popularitas dan eksistensi mahasiswa',
        'Ilmu pengetahuan dan kepedulian terhadap nasib bangsa',
        'Kepentingan organisasi mahasiswa semata',
        'C',
        'Gerakan mahasiswa bermuara pada kesadaran intelektual serta kepedulian tulus terhadap masa depan bangsa.'
    ),
    (
        v_quiz_id, 11, 'Gerakan Mahasiswa',
        'Salah satu nilai yang menjadi landasan perjuangan gerakan mahasiswa adalah...',
        'Mengutamakan kepentingan golongan',
        'Mengutamakan kebenaran dan keadilan',
        'Menghindari semua bentuk perbedaan pendapat',
        'Mempertahankan keadaan lama',
        'B',
        'Kebenaran ilmiah dan keadilan sosial merupakan pilar abadi gerakan mahasiswa.'
    ),

    -- C. Tridharma Perguruan Tinggi (Soal 12-15)
    (
        v_quiz_id, 12, 'Tridharma Perguruan Tinggi',
        'Berikut yang termasuk Tridharma Perguruan Tinggi adalah...',
        'Pendidikan dan pengajaran, penelitian dan pengembangan, serta pengabdian kepada masyarakat',
        'Pendidikan, organisasi, dan kepemimpinan',
        'Penelitian, organisasi, dan pengabdian',
        'Pendidikan, politik, dan pengabdian',
        'A',
        'Tiga pilar Tridharma adalah Pendidikan & Pengajaran, Penelitian & Pengembangan, dan Pengabdian kepada Masyarakat.'
    ),
    (
        v_quiz_id, 13, 'Tridharma Perguruan Tinggi',
        'Contoh penerapan pendidikan dan pengajaran oleh mahasiswa adalah...',
        'Belajar dengan tekun dan berbagi pengetahuan kepada sesama',
        'Hanya mengejar nilai akademik',
        'Menghindari kegiatan akademik',
        'Mengutamakan organisasi daripada pendidikan',
        'A',
        'Pendidikan tercermin dari ketekunan menuntut ilmu serta berbagi wawasan dengan sesama.'
    ),
    (
        v_quiz_id, 14, 'Tridharma Perguruan Tinggi',
        'Mahasiswa yang melakukan penelitian untuk membantu memecahkan permasalahan di lingkungan sekitarnya sedang menerapkan...',
        'Pendidikan dan pengajaran',
        'Penelitian dan pengembangan',
        'Pengabdian kepada masyarakat',
        'Pengembangan organisasi',
        'B',
        'Riset pemecahan masalah merupakan perwujudan pilar Penelitian dan Pengembangan.'
    ),
    (
        v_quiz_id, 15, 'Tridharma Perguruan Tinggi',
        'Mengapa mahasiswa perlu berusaha menyeimbangkan ketiga unsur Tridharma?',
        'Karena ketiganya merupakan kegiatan tambahan mahasiswa',
        'Karena ketiganya saling melengkapi dan membentuk mahasiswa yang utuh',
        'Karena mahasiswa harus mengikuti semua kegiatan kampus',
        'Karena pengabdian lebih penting daripada pendidikan',
        'B',
        'Ketiga pilar terintegrasi dan saling menyempurnakan kompetensi seorang sarjana.'
    ),

    -- D. Peran dan Fungsi Mahasiswa (Soal 16-19)
    (
        v_quiz_id, 16, 'Peran dan Fungsi Mahasiswa',
        'Peran Iron Stock menggambarkan mahasiswa sebagai...',
        'Penjaga nilai',
        'Calon pemimpin masa depan',
        'Pengawas masyarakat',
        'Penggerak kegiatan sosial',
        'B',
        'Iron Stock menandakan mahasiswa sebagai penerus dan calon pemimpin bangsa di masa depan.'
    ),
    (
        v_quiz_id, 17, 'Peran dan Fungsi Mahasiswa',
        'Ketika mahasiswa menjaga nilai kebenaran, keadilan, kesusilaan, dan moralitas, ia menjalankan peran...',
        'Iron Stock',
        'Guardian of Value',
        'Social Control',
        'Agent of Change',
        'B',
        'Guardian of Value berarti penjaga dan pelestari nilai-nilai luhur dan etika moral.'
    ),
    (
        v_quiz_id, 18, 'Peran dan Fungsi Mahasiswa',
        'Peran Social Control berarti mahasiswa...',
        'Mengontrol seluruh kegiatan organisasi',
        'Mengawasi agar kehidupan di kampus dan masyarakat berjalan sesuai aturan dan keadilan',
        'Mengatur mahasiswa lainnya',
        'Mengambil alih kewenangan pihak kampus',
        'B',
        'Social Control mengawasi dinamika sosial dan kebijakan agar senantiasa berpihak pada keadilan.'
    ),
    (
        v_quiz_id, 19, 'Peran dan Fungsi Mahasiswa',
        'Mahasiswa yang membawa gagasan baru dan mendorong perubahan menuju keadaan yang lebih baik menjalankan peran...',
        'Moral Force',
        'Guardian of Value',
        'Agent of Change',
        'Iron Stock',
        'C',
        'Agent of Change merupakan inisiator perubahan positif dan inovasi bagi masyarakat.'
    ),

    -- E. Organisasi Kemahasiswaan dan HIMA FST (Soal 20)
    (
        v_quiz_id, 20, 'Organisasi Kemahasiswaan dan HIMA FST',
        'Fungsi utama organisasi kemahasiswaan adalah...',
        'Menjadi tempat mendapatkan jabatan',
        'Menjadi wadah pengembangan potensi, kepemimpinan, kerja sama, dan pembelajaran organisasi',
        'Menggantikan kegiatan akademik mahasiswa',
        'Menjadi tempat mencari popularitas',
        'B',
        'HIMA FST adalah kawah candradimuka pembelajaran kepemimpinan dan pengembangan potensi mahasiswa.'
    ),

    -- F. Studi Kasus (Soal 21-30)
    (
        v_quiz_id, 21, 'Studi Kasus',
        'Dalam sebuah forum, seorang kader tidak setuju dengan pendapat peserta lain. Ia kemudian memotong pembicaraan dan menyampaikan bahwa pendapat tersebut "tidak masuk akal". Sikap yang seharusnya dilakukan kader adalah...',
        'Membiarkan karena setiap orang bebas berpendapat',
        'Menunggu giliran berbicara dan menyampaikan ketidaksetujuan dengan bahasa yang santun',
        'Membalas dengan perkataan yang lebih keras',
        'Meminta pimpinan forum menghentikan peserta tersebut',
        'B',
        'Etika forum menuntut kesantunan, menghargai giliran bicara, dan argumentasi rasional.'
    ),
    (
        v_quiz_id, 22, 'Studi Kasus',
        'Kamu mendapat tugas organisasi dengan batas waktu Jumat pukul 20.00. Pada Kamis malam kamu menyadari bahwa tugas tersebut belum selesai karena mengalami kendala. Apa tindakan paling tepat?',
        'Diam sampai batas waktu berlalu',
        'Menyalahkan anggota lain',
        'Mengomunikasikan kendala dan perkembangan pekerjaan kepada pihak terkait serta mencari solusi',
        'Menunggu sampai ditanya oleh ketua',
        'C',
        'Komunikasi proaktif sebelum tenggat waktu adalah kunci manajemen kepanitiaan profesional.'
    ),
    (
        v_quiz_id, 23, 'Studi Kasus',
        'Kamu mengetahui bahwa temanmu melakukan kesalahan dalam laporan organisasi. Kesalahan tersebut berpotensi menyebabkan informasi yang disampaikan menjadi tidak benar. Apa yang sebaiknya kamu lakukan?',
        'Membiarkannya karena bukan tugasmu',
        'Membicarakan kesalahannya kepada anggota lain',
        'Mengingatkan dan mengajak memperbaiki laporan tersebut secara jujur',
        'Mengubah laporan diam-diam tanpa memberitahunya',
        'C',
        'Kader yang baik saling mengingatkan dan memperbaiki kesalahan secara konstruktif dan jujur.'
    ),
    (
        v_quiz_id, 24, 'Studi Kasus',
        'Dalam sebuah kepanitiaan, ada anggota yang selalu ingin pendapatnya diterima dan tidak mau mempertimbangkan pendapat anggota lain. Jika kamu berada dalam tim tersebut, tindakan yang paling sesuai dengan prinsip kolektif kolegial adalah...',
        'Membiarkannya agar tidak terjadi konflik',
        'Mengikuti semua keinginannya',
        'Mengajak berdiskusi dan mencari keputusan melalui musyawarah dengan mengutamakan kepentingan bersama',
        'Membentuk kelompok baru tanpa memberitahunya',
        'C',
        'Musyawarah mufakat mengesampingkan ego pribadi demi tujuan bersama.'
    ),
    (
        v_quiz_id, 25, 'Studi Kasus',
        'Kamu melihat seorang anggota baru kesulitan mengikuti alur kerja organisasi. Tidak ada yang memintamu membantu, tetapi kamu memiliki waktu untuk membantunya. Sikap yang paling sesuai dengan materi adalah...',
        'Menunggu sampai ia meminta bantuan',
        'Membantu karena menunjukkan inisiatif dan kepedulian terhadap sesama anggota',
        'Membiarkannya agar belajar sendiri',
        'Melaporkannya kepada ketua karena dianggap tidak mampu',
        'B',
        'Inisiatif membantu rekan kader memperkuat soliditas dan iklim kerja organisasi.'
    ),
    (
        v_quiz_id, 26, 'Studi Kasus',
        'Di lingkungan kampus terdapat suatu permasalahan yang menurutmu tidak sesuai dengan prinsip keadilan. Kamu ingin menyampaikan kritik. Tindakan yang paling mencerminkan karakter gerakan mahasiswa adalah...',
        'Menyebarkan tuduhan melalui media sosial',
        'Mengajak mahasiswa lain melakukan tindakan tanpa mencari fakta',
        'Mengumpulkan fakta, menyampaikan kritik secara kritis tetapi tetap santun, dan mengupayakan solusi',
        'Membiarkannya karena mahasiswa tidak boleh mencampuri urusan kampus',
        'C',
        'Kritik mahasiswa berbasis data valid, disampaikan dengan etika, dan menawarkan solusi nyata.'
    ),
    (
        v_quiz_id, 27, 'Studi Kasus',
        'Kamu menemukan permasalahan masyarakat yang berkaitan dengan bidang keilmuanmu. Kamu kemudian mempelajari masalah tersebut, melakukan penelitian sederhana, dan hasilnya digunakan untuk membantu masyarakat. Hal ini menunjukkan hubungan antara...',
        'Pendidikan dan pengajaran dengan organisasi',
        'Penelitian dan pengembangan dengan pengabdian kepada masyarakat',
        'Organisasi dengan kepemimpinan',
        'Iron Stock dengan Guardian of Value',
        'B',
        'Menggunakan hasil riset ilmiah untuk menyelesaikan problem publik mengintegrasikan pilar ke-2 dan ke-3 Tridharma.'
    ),
    (
        v_quiz_id, 28, 'Studi Kasus',
        'Dalam rapat HIMA, keputusan telah diambil melalui mekanisme musyawarah. Meskipun pendapatmu tidak menjadi keputusan akhir, kamu tetap melaksanakan keputusan tersebut dengan baik. Sikap tersebut mencerminkan...',
        'Individualisme',
        'Kolektif kolegial dan etika forum',
        'Kurangnya sikap kritis',
        'Ketergantungan kepada senior',
        'B',
        'Menghormati keputusan konsensus forum adalah ciri kedewasaan berorganisasi.'
    ),
    (
        v_quiz_id, 29, 'Studi Kasus',
        'Seorang kader berkata, "Saya ikut HIMA hanya supaya punya pengalaman dan sertifikat. Kalau sudah selesai kaderisasi, urusan organisasi bukan tanggung jawab saya." Berdasarkan materi, pernyataan tersebut kurang sesuai karena...',
        'Kader harus selalu menjadi pengurus',
        'Organisasi hanya boleh diikuti mahasiswa tertentu',
        'Organisasi merupakan ruang pembelajaran untuk mengembangkan kemampuan, tanggung jawab, kerja sama, dan kontribusi',
        'Semua mahasiswa wajib memiliki jabatan organisasi',
        'C',
        'Organisasi kemahasiswaan berorientasi pada proses kontribusi, tanggung jawab, dan pembelajaran bersama.'
    ),
    (
        v_quiz_id, 30, 'Studi Kasus',
        'Kamu diberi kesempatan untuk ikut berkontribusi dalam HIMA FST UT Bandung. Setelah memahami materi Tingkat I, tindakan yang paling mencerminkan pemahamanmu adalah...',
        'Aktif hanya ketika ada keuntungan bagi diri sendiri',
        'Menunggu selalu diberikan tugas',
        'Berkontribusi sesuai kemampuan, menjaga etika, bertanggung jawab, bekerja sama, serta ikut mengembangkan organisasi dan memberikan manfaat',
        'Berusaha mendapatkan jabatan agar lebih dikenal',
        'C',
        'Wujud nyata kelulusan kaderisasi adalah dedikasi, integritas, dan kontribusi aktif bagi HIMA FST UT Bandung.'
    );

END $$;
