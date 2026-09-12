export interface QuestionItem {
	id: string;
	questionNumber: number;
	section: string;
	questionText: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	correctAnswer: 'A' | 'B' | 'C' | 'D';
	explanation?: string;
}

export const OFFICIAL_30_QUESTIONS: QuestionItem[] = [
	// A. Nilai dan Karakter Dasar (1-8)
	{
		id: 'q-01',
		questionNumber: 1,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Etika dalam organisasi pada dasarnya diperlukan untuk...',
		optionA: 'Membatasi kebebasan anggota dalam berorganisasi',
		optionB: 'Membuat anggota mengikuti semua keputusan senior',
		optionC: 'Menjaga hubungan antarwarga organisasi agar berjalan harmonis',
		optionD: 'Membuat organisasi terlihat lebih formal',
		correctAnswer: 'C',
		explanation: 'Etika organisasi berfungsi memelihara keharmonisan, saling menghormati, dan keteraturan antar anggota.'
	},
	{
		id: 'q-02',
		questionNumber: 2,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Perilaku yang sesuai dengan etika komunikasi adalah...',
		optionA: 'Memotong pembicaraan ketika tidak setuju',
		optionB: 'Mendengarkan lawan bicara hingga selesai sebelum memberikan tanggapan',
		optionC: 'Mengabaikan pendapat yang berbeda',
		optionD: 'Menyampaikan pendapat dengan nada tinggi agar didengar',
		correctAnswer: 'B',
		explanation: 'Etika komunikasi mengutamakan menyimak pembicaraan secara utuh sebelum merespons secara santun.'
	},
	{
		id: 'q-03',
		questionNumber: 3,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Disiplin dalam organisasi ditunjukkan melalui...',
		optionA: 'Melaksanakan tugas hanya ketika diingatkan',
		optionB: 'Hadir tepat waktu dan menyelesaikan tugas sesuai batas waktu',
		optionC: 'Mengutamakan kepentingan pribadi',
		optionD: 'Menghindari tugas yang dianggap sulit',
		correctAnswer: 'B',
		explanation: 'Kedisiplinan diwujudkan dalam komitmen waktu dan penuntasan tanggung jawab sesuai tenggat.'
	},
	{
		id: 'q-04',
		questionNumber: 4,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Seorang kader yang memiliki integritas adalah kader yang...',
		optionA: 'Selalu terlihat aktif di depan pengurus',
		optionB: 'Mampu memengaruhi anggota lain',
		optionC: 'Memiliki kesesuaian antara perkataan dan perbuatannya',
		optionD: 'Selalu mendapatkan jabatan dalam organisasi',
		correctAnswer: 'C',
		explanation: 'Integritas merupakan keselarasan dan kejujuran antara apa yang diucapkan dengan apa yang dilakukan.'
	},
	{
		id: 'q-05',
		questionNumber: 5,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Manakah yang merupakan bentuk tanggung jawab seorang kader?',
		optionA: 'Melempar kesalahan kepada anggota lain',
		optionB: 'Menghindari tugas ketika mengalami kesulitan',
		optionC: 'Menyelesaikan amanah dan memberikan pertanggungjawaban',
		optionD: 'Menyembunyikan kesalahan agar tidak mendapat teguran',
		correctAnswer: 'C',
		explanation: 'Tanggung jawab tercermin dari penyelesaian amanah serta transparansi pertanggungjawaban.'
	},
	{
		id: 'q-06',
		questionNumber: 6,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Sikap kolektif kolegial mengutamakan...',
		optionA: 'Kepentingan pribadi',
		optionB: 'Persaingan antaranggota',
		optionC: 'Kebersamaan, musyawarah, dan kepentingan bersama',
		optionD: 'Keputusan dari anggota yang paling senior',
		correctAnswer: 'C',
		explanation: 'Prinsip kolektif kolegial berlandaskan semangat kebersamaan dan musyawarah mufakat.'
	},
	{
		id: 'q-07',
		questionNumber: 7,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Seorang kader membaca informasi penting di grup organisasi kemudian segera memberikan respons. Sikap tersebut menunjukkan...',
		optionA: 'Empati',
		optionB: 'Responsif',
		optionC: 'Konsistensi',
		optionD: 'Idealisme',
		correctAnswer: 'B',
		explanation: 'Sikap responsif adalah tanggap dan cepat merespons kebutuhan serta komunikasi organisasi.'
	},
	{
		id: 'q-08',
		questionNumber: 8,
		section: 'Nilai dan Karakter Dasar',
		questionText: 'Tidak menunggu diperintah untuk melakukan sesuatu yang bermanfaat dalam organisasi merupakan bentuk...',
		optionA: 'Inisiatif',
		optionB: 'Senioritas',
		optionC: 'Individualisme',
		optionD: 'Kontrol sosial',
		correctAnswer: 'A',
		explanation: 'Inisiatif adalah proaktif melakukan tindakan positif tanpa harus menunggu instruksi.'
	},

	// B. Gerakan Mahasiswa (9-11)
	{
		id: 'q-09',
		questionNumber: 9,
		section: 'Gerakan Mahasiswa',
		questionText: 'Salah satu karakteristik gerakan mahasiswa adalah kritis. Maksudnya adalah...',
		optionA: 'Selalu menolak keputusan yang dibuat organisasi',
		optionB: 'Berani menilai dan menyampaikan sesuatu berdasarkan fakta',
		optionC: 'Tidak mau mengikuti aturan',
		optionD: 'Selalu menyampaikan kritik secara terbuka tanpa mempertimbangkan etika',
		correctAnswer: 'B',
		explanation: 'Sikap kritis mahasiswa berpijak pada analisis objektif dan kebenaran fakta empiris.'
	},
	{
		id: 'q-10',
		questionNumber: 10,
		section: 'Gerakan Mahasiswa',
		questionText: 'Gerakan mahasiswa lahir dari kesadaran terhadap...',
		optionA: 'Kekuasaan dan kepentingan kelompok',
		optionB: 'Popularitas dan eksistensi mahasiswa',
		optionC: 'Ilmu pengetahuan dan kepedulian terhadap nasib bangsa',
		optionD: 'Kepentingan organisasi mahasiswa semata',
		correctAnswer: 'C',
		explanation: 'Gerakan mahasiswa bermuara pada kesadaran intelektual serta kepedulian tulus terhadap masa depan bangsa.'
	},
	{
		id: 'q-11',
		questionNumber: 11,
		section: 'Gerakan Mahasiswa',
		questionText: 'Salah satu nilai yang menjadi landasan perjuangan gerakan mahasiswa adalah...',
		optionA: 'Mengutamakan kepentingan golongan',
		optionB: 'Mengutamakan kebenaran dan keadilan',
		optionC: 'Menghindari semua bentuk perbedaan pendapat',
		optionD: 'Mempertahankan keadaan lama',
		correctAnswer: 'B',
		explanation: 'Kebenaran ilmiah dan keadilan sosial merupakan pilar abadi gerakan mahasiswa.'
	},

	// C. Tridharma Perguruan Tinggi (12-15)
	{
		id: 'q-12',
		questionNumber: 12,
		section: 'Tridharma Perguruan Tinggi',
		questionText: 'Berikut yang termasuk Tridharma Perguruan Tinggi adalah...',
		optionA: 'Pendidikan dan pengajaran, penelitian dan pengembangan, serta pengabdian kepada masyarakat',
		optionB: 'Pendidikan, organisasi, dan kepemimpinan',
		optionC: 'Penelitian, organisasi, dan pengabdian',
		optionD: 'Pendidikan, politik, dan pengabdian',
		correctAnswer: 'A',
		explanation: 'Tiga pilar Tridharma adalah Pendidikan & Pengajaran, Penelitian & Pengembangan, dan Pengabdian kepada Masyarakat.'
	},
	{
		id: 'q-13',
		questionNumber: 13,
		section: 'Tridharma Perguruan Tinggi',
		questionText: 'Contoh penerapan pendidikan dan pengajaran oleh mahasiswa adalah...',
		optionA: 'Belajar dengan tekun dan berbagi pengetahuan kepada sesama',
		optionB: 'Hanya mengejar nilai akademik',
		optionC: 'Menghindari kegiatan akademik',
		optionD: 'Mengutamakan organisasi daripada pendidikan',
		correctAnswer: 'A',
		explanation: 'Pendidikan tercermin dari ketekunan menuntut ilmu serta berbagi wawasan dengan sesama.'
	},
	{
		id: 'q-14',
		questionNumber: 14,
		section: 'Tridharma Perguruan Tinggi',
		questionText: 'Mahasiswa yang melakukan penelitian untuk membantu memecahkan permasalahan di lingkungan sekitarnya sedang menerapkan...',
		optionA: 'Pendidikan dan pengajaran',
		optionB: 'Penelitian dan pengembangan',
		optionC: 'Pengabdian kepada masyarakat',
		optionD: 'Pengembangan organisasi',
		correctAnswer: 'B',
		explanation: 'Riset pemecahan masalah merupakan perwujudan pilar Penelitian dan Pengembangan.'
	},
	{
		id: 'q-15',
		questionNumber: 15,
		section: 'Tridharma Perguruan Tinggi',
		questionText: 'Mengapa mahasiswa perlu berusaha menyeimbangkan ketiga unsur Tridharma?',
		optionA: 'Karena ketiganya merupakan kegiatan tambahan mahasiswa',
		optionB: 'Karena ketiganya saling melengkapi dan membentuk mahasiswa yang utuh',
		optionC: 'Karena mahasiswa harus mengikuti semua kegiatan kampus',
		optionD: 'Karena pengabdian lebih penting daripada pendidikan',
		correctAnswer: 'B',
		explanation: 'Ketiga pilar terintegrasi dan saling menyempurnakan kompetensi seorang sarjana.'
	},

	// D. Peran dan Fungsi Mahasiswa (16-19)
	{
		id: 'q-16',
		questionNumber: 16,
		section: 'Peran dan Fungsi Mahasiswa',
		questionText: 'Peran Iron Stock menggambarkan mahasiswa sebagai...',
		optionA: 'Penjaga nilai',
		optionB: 'Calon pemimpin masa depan',
		optionC: 'Pengawas masyarakat',
		optionD: 'Penggerak kegiatan sosial',
		correctAnswer: 'B',
		explanation: 'Iron Stock menandakan mahasiswa sebagai penerus dan calon pemimpin bangsa di masa depan.'
	},
	{
		id: 'q-17',
		questionNumber: 17,
		section: 'Peran dan Fungsi Mahasiswa',
		questionText: 'Ketika mahasiswa menjaga nilai kebenaran, keadilan, kesusilaan, dan moralitas, ia menjalankan peran...',
		optionA: 'Iron Stock',
		optionB: 'Guardian of Value',
		optionC: 'Social Control',
		optionD: 'Agent of Change',
		correctAnswer: 'B',
		explanation: 'Guardian of Value berarti penjaga dan pelestari nilai-nilai luhur dan etika moral.'
	},
	{
		id: 'q-18',
		questionNumber: 18,
		section: 'Peran dan Fungsi Mahasiswa',
		questionText: 'Peran Social Control berarti mahasiswa...',
		optionA: 'Mengontrol seluruh kegiatan organisasi',
		optionB: 'Mengawasi agar kehidupan di kampus dan masyarakat berjalan sesuai aturan dan keadilan',
		optionC: 'Mengatur mahasiswa lainnya',
		optionD: 'Mengambil alih kewenangan pihak kampus',
		correctAnswer: 'B',
		explanation: 'Social Control mengawasi dinamika sosial dan kebijakan agar senantiasa berpihak pada keadilan.'
	},
	{
		id: 'q-19',
		questionNumber: 19,
		section: 'Peran dan Fungsi Mahasiswa',
		questionText: 'Mahasiswa yang membawa gagasan baru dan mendorong perubahan menuju keadaan yang lebih baik menjalankan peran...',
		optionA: 'Moral Force',
		optionB: 'Guardian of Value',
		optionC: 'Agent of Change',
		optionD: 'Iron Stock',
		correctAnswer: 'C',
		explanation: 'Agent of Change merupakan inisiator perubahan positif dan inovasi bagi masyarakat.'
	},

	// E. Organisasi Kemahasiswaan dan HIMA FST (20)
	{
		id: 'q-20',
		questionNumber: 20,
		section: 'Organisasi Kemahasiswaan dan HIMA FST',
		questionText: 'Fungsi utama organisasi kemahasiswaan adalah...',
		optionA: 'Menjadi tempat mendapatkan jabatan',
		optionB: 'Menjadi wadah pengembangan potensi, kepemimpinan, kerja sama, dan pembelajaran organisasi',
		optionC: 'Menggantikan kegiatan akademik mahasiswa',
		optionD: 'Menjadi tempat mencari popularitas',
		correctAnswer: 'B',
		explanation: 'HIMA FST adalah kawah candradimuka pembelajaran kepemimpinan dan pengembangan potensi mahasiswa.'
	},

	// F. Studi Kasus (21-30)
	{
		id: 'q-21',
		questionNumber: 21,
		section: 'Studi Kasus',
		questionText: 'Dalam sebuah forum, seorang kader tidak setuju dengan pendapat peserta lain. Ia kemudian memotong pembicaraan dan menyampaikan bahwa pendapat tersebut "tidak masuk akal". Sikap yang seharusnya dilakukan kader adalah...',
		optionA: 'Membiarkan karena setiap orang bebas berpendapat',
		optionB: 'Menunggu giliran berbicara dan menyampaikan ketidaksetujuan dengan bahasa yang santun',
		optionC: 'Membalas dengan perkataan yang lebih keras',
		optionD: 'Meminta pimpinan forum menghentikan peserta tersebut',
		correctAnswer: 'B',
		explanation: 'Etika forum menuntut kesantunan, menghargai giliran bicara, dan argumentasi rasional.'
	},
	{
		id: 'q-22',
		questionNumber: 22,
		section: 'Studi Kasus',
		questionText: 'Kamu mendapat tugas organisasi dengan batas waktu Jumat pukul 20.00. Pada Kamis malam kamu menyadari bahwa tugas tersebut belum selesai karena mengalami kendala. Apa tindakan paling tepat?',
		optionA: 'Diam sampai batas waktu berlalu',
		optionB: 'Menyalahkan anggota lain',
		optionC: 'Mengomunikasikan kendala dan perkembangan pekerjaan kepada pihak terkait serta mencari solusi',
		optionD: 'Menunggu sampai ditanya oleh ketua',
		correctAnswer: 'C',
		explanation: 'Komunikasi proaktif sebelum tenggat waktu adalah kunci manajemen kepanitiaan profesional.'
	},
	{
		id: 'q-23',
		questionNumber: 23,
		section: 'Studi Kasus',
		questionText: 'Kamu mengetahui bahwa temanmu melakukan kesalahan dalam laporan organisasi. Kesalahan tersebut berpotensi menyebabkan informasi yang disampaikan menjadi tidak benar. Apa yang sebaiknya kamu lakukan?',
		optionA: 'Membiarkannya karena bukan tugasmu',
		optionB: 'Membicarakan kesalahannya kepada anggota lain',
		optionC: 'Mengingatkan dan mengajak memperbaiki laporan tersebut secara jujur',
		optionD: 'Mengubah laporan diam-diam tanpa memberitahunya',
		correctAnswer: 'C',
		explanation: 'Kader yang baik saling mengingatkan dan memperbaiki kesalahan secara konstruktif dan jujur.'
	},
	{
		id: 'q-24',
		questionNumber: 24,
		section: 'Studi Kasus',
		questionText: 'Dalam sebuah kepanitiaan, ada anggota yang selalu ingin pendapatnya diterima dan tidak mau mempertimbangkan pendapat anggota lain. Jika kamu berada dalam tim tersebut, tindakan yang paling sesuai dengan prinsip kolektif kolegial adalah...',
		optionA: 'Membiarkannya agar tidak terjadi konflik',
		optionB: 'Mengikuti semua keinginannya',
		optionC: 'Mengajak berdiskusi dan mencari keputusan melalui musyawarah dengan mengutamakan kepentingan bersama',
		optionD: 'Membentuk kelompok baru tanpa memberitahunya',
		correctAnswer: 'C',
		explanation: 'Musyawarah mufakat mengesampingkan ego pribadi demi tujuan bersama.'
	},
	{
		id: 'q-25',
		questionNumber: 25,
		section: 'Studi Kasus',
		questionText: 'Kamu melihat seorang anggota baru kesulitan mengikuti alur kerja organisasi. Tidak ada yang memintamu membantu, tetapi kamu memiliki waktu untuk membantunya. Sikap yang paling sesuai dengan materi adalah...',
		optionA: 'Menunggu sampai ia meminta bantuan',
		optionB: 'Membantu karena menunjukkan inisiatif dan kepedulian terhadap sesama anggota',
		optionC: 'Membiarkannya agar belajar sendiri',
		optionD: 'Melaporkannya kepada ketua karena dianggap tidak mampu',
		correctAnswer: 'B',
		explanation: 'Inisiatif membantu rekan kader memperkuat soliditas dan iklim kerja organisasi.'
	},
	{
		id: 'q-26',
		questionNumber: 26,
		section: 'Studi Kasus',
		questionText: 'Di lingkungan kampus terdapat suatu permasalahan yang menurutmu tidak sesuai dengan prinsip keadilan. Kamu ingin menyampaikan kritik. Tindakan yang paling mencerminkan karakter gerakan mahasiswa adalah...',
		optionA: 'Menyebarkan tuduhan melalui media sosial',
		optionB: 'Mengajak mahasiswa lain melakukan tindakan tanpa mencari fakta',
		optionC: 'Mengumpulkan fakta, menyampaikan kritik secara kritis tetapi tetap santun, dan mengupayakan solusi',
		optionD: 'Membiarkannya karena mahasiswa tidak boleh mencampuri urusan kampus',
		correctAnswer: 'C',
		explanation: 'Kritik mahasiswa berbasis data valid, disampaikan dengan etika, dan menawarkan solusi nyata.'
	},
	{
		id: 'q-27',
		questionNumber: 27,
		section: 'Studi Kasus',
		questionText: 'Kamu menemukan permasalahan masyarakat yang berkaitan dengan bidang keilmuanmu. Kamu kemudian mempelajari masalah tersebut, melakukan penelitian sederhana, dan hasilnya digunakan untuk membantu masyarakat. Hal ini menunjukkan hubungan antara...',
		optionA: 'Pendidikan dan pengajaran dengan organisasi',
		optionB: 'Penelitian dan pengembangan dengan pengabdian kepada masyarakat',
		optionC: 'Organisasi dengan kepemimpinan',
		optionD: 'Iron Stock dengan Guardian of Value',
		correctAnswer: 'B',
		explanation: 'Menggunakan hasil riset ilmiah untuk menyelesaikan problem publik mengintegrasikan pilar ke-2 dan ke-3 Tridharma.'
	},
	{
		id: 'q-28',
		questionNumber: 28,
		section: 'Studi Kasus',
		questionText: 'Dalam rapat HIMA, keputusan telah diambil melalui mekanisme musyawarah. Meskipun pendapatmu tidak menjadi keputusan akhir, kamu tetap melaksanakan keputusan tersebut dengan baik. Sikap tersebut mencerminkan...',
		optionA: 'Individualisme',
		optionB: 'Kolektif kolegial dan etika forum',
		optionC: 'Kurangnya sikap kritis',
		optionD: 'Ketergantungan kepada senior',
		correctAnswer: 'B',
		explanation: 'Menghormati keputusan konsensus forum adalah ciri kedewasaan berorganisasi.'
	},
	{
		id: 'q-29',
		questionNumber: 29,
		section: 'Studi Kasus',
		questionText: 'Seorang kader berkata, "Saya ikut HIMA hanya supaya punya pengalaman dan sertifikat. Kalau sudah selesai kaderisasi, urusan organisasi bukan tanggung jawab saya." Berdasarkan materi, pernyataan tersebut kurang sesuai karena...',
		optionA: 'Kader harus selalu menjadi pengurus',
		optionB: 'Organisasi hanya boleh diikuti mahasiswa tertentu',
		optionC: 'Organisasi merupakan ruang pembelajaran untuk mengembangkan kemampuan, tanggung jawab, kerja sama, dan kontribusi',
		optionD: 'Semua mahasiswa wajib memiliki jabatan organisasi',
		correctAnswer: 'C',
		explanation: 'Organisasi kemahasiswaan berorientasi pada proses kontribusi, tanggung jawab, dan pembelajaran bersama.'
	},
	{
		id: 'q-30',
		questionNumber: 30,
		section: 'Studi Kasus',
		questionText: 'Kamu diberi kesempatan untuk ikut berkontribusi dalam HIMA FST UT Bandung. Setelah memahami materi Tingkat I, tindakan yang paling mencerminkan pemahamanmu adalah...',
		optionA: 'Aktif hanya ketika ada keuntungan bagi diri sendiri',
		optionB: 'Menunggu selalu diberikan tugas',
		optionC: 'Berkontribusi sesuai kemampuan, menjaga etika, bertanggung jawab, bekerja sama, serta ikut mengembangkan organisasi dan memberikan manfaat',
		optionD: 'Berusaha mendapatkan jabatan agar lebih dikenal',
		correctAnswer: 'C',
		explanation: 'Wujud nyata kelulusan kaderisasi adalah dedikasi, integritas, dan kontribusi aktif bagi HIMA FST UT Bandung.'
	}
];
