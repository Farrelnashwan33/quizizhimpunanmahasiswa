export interface QuestionItem {
	id: string;
	questionNumber: number;
	section: string;
	questionText: string;
	optionA?: string;
	optionB?: string;
	optionC?: string;
	optionD?: string;
	correctAnswer: string;
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
		correctAnswer: 'Etika dalam organisasi diperlukan untuk menjaga hubungan antarwarga organisasi agar berjalan harmonis, saling menghormati, dan menjaga keteraturan antaranggota.',
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
		correctAnswer: 'Mendengarkan lawan bicara hingga selesai secara utuh sebelum memberikan tanggapan atau respons secara santun dan rasional.',
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
		correctAnswer: 'Hadir tepat waktu dalam setiap agenda serta menuntaskan tugas dan tanggung jawab sesuai batas waktu (deadline) yang telah disepakati.',
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
		correctAnswer: 'Kader yang memiliki keselarasan, kejujuran, dan konsistensi antara apa yang diucapkan dengan apa yang dilakukan dalam kehidupan organisasi.',
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
		correctAnswer: 'Menyelesaikan setiap amanah tugas yang diberikan secara tuntas serta memberikan laporan pertanggungjawaban dengan jujur dan terbuka.',
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
		correctAnswer: 'Mengedepankan semangat kebersamaan, musyawarah mufakat, serta mengutamakan kepentingan organisasi di atas kepentingan pribadi.',
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
		correctAnswer: 'Sikap responsif, yaitu tanggap, proaktif, dan cepat menanggapi komunikasi serta kebutuhan koordinasi organisasi.',
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
		correctAnswer: 'Inisiatif, yaitu kepekaan dan kesadaran untuk melakukan tindakan positif yang bermanfaat bagi organisasi tanpa harus menunggu perintah.',
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
		correctAnswer: 'Berani menganalisis, menilai, dan menyampaikan pandangan atau kritik secara objektif berdasarkan fakta empiris dan kebenaran ilmiah.',
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
		correctAnswer: 'Kesadaran intelektual, ilmu pengetahuan, serta kepedulian yang tulus terhadap nasib masyarakat dan masa depan bangsa.',
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
		correctAnswer: 'Menjunjung tinggi kebenaran ilmiah, keadilan sosial, kejujuran, dan keberpihakan kepada kepentingan masyarakat luas.',
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
		correctAnswer: 'Tridharma Perguruan Tinggi terdiri atas: 1. Pendidikan dan Pengajaran, 2. Penelitian dan Pengembangan, dan 3. Pengabdian kepada Masyarakat.',
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
		correctAnswer: 'Belajar dengan tekun, meningkatkan kapasitas wawasan keilmuan, serta berbagi ilmu pengetahuan dan pengalaman positif kepada sesama.',
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
		correctAnswer: 'Pilar Penelitian dan Pengembangan (dan terintegrasi dengan Pengabdian Masyarakat) untuk mencari solusi ilmiah atas permasalahan di lingkungan sekitar.',
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
		correctAnswer: 'Karena ketiga unsur Tridharma saling melengkapi, terintegrasi, dan membentuk karakter mahasiswa yang utuh secara akademis, beretika, dan aplikatif bagi masyarakat.',
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
		correctAnswer: 'Mahasiswa sebagai calon pemimpin masa depan dan generasi penerus bangsa yang siap menggantikan kepemimpinan terdahulu dengan kualitas integritas yang kuat.',
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
		correctAnswer: 'Guardian of Value, yaitu peran mahasiswa sebagai penjaga, pemelihara, dan penyampai nilai-nilai luhur moralitas, kebenaran, dan etika.',
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
		correctAnswer: 'Berperan sebagai pengawas sosial (kontrol sosial) agar kebijakan dan kehidupan di lingkungan kampus maupun masyarakat tetap berjalan adil dan sesuai norma.',
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
		correctAnswer: 'Agent of Change, yaitu pembawa gagasan inovatif dan motor penggerak transformasi ke arah yang lebih baik dan bermanfaat.',
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
		correctAnswer: 'Menjadi wadah pengembangan potensi minat bakat, melatih kepemimpinan, kerja sama tim, integritas, dan sarana pembelajaran nyata mahasiswa di luar perkuliahan.',
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
		correctAnswer: 'Menunggu giliran berbicara secara tertib, mendengarkan argumen hingga selesai, lalu menyampaikan perbedaan pandangan secara santun, rasional, dan berbasis argumentasi.',
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
		correctAnswer: 'Segera mengomunikasikan kendala dan progres pekerjaan secara proaktif kepada ketua tim sebelum deadline, serta berkoordinasi untuk mencari solusi bersama.',
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
		correctAnswer: 'Mengingatkan teman tersebut secara baik-baik dan pribadi, serta mengajaknya untuk bersama-sama merevisi dan memperbaiki kesalahan laporan tersebut secara jujur.',
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
		correctAnswer: 'Mengajak berdiskusi secara terbuka dan kekeluargaan, mencari titik temu melalui musyawarah, serta mengedepankan kepentingan bersama organisasi di atas ego pribadi.',
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
		correctAnswer: 'Mengambil inisiatif untuk mendekati, mendampingi, dan membantunya memahami alur kerja organisasi sebagai wujud kepedulian dan solidaritas sesama kader.',
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
		correctAnswer: 'Mengumpulkan data dan fakta yang valid, menyusun kajian ilmiah secara objektif, lalu menyampaikan kritik secara santun dan konstruktif disertai rekomendasi solusi konkret.',
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
		correctAnswer: 'Keterpaduan antara pilar Penelitian dan Pengembangan dengan Pengabdian kepada Masyarakat dalam menerapkan keilmuan untuk kemaslahatan masyarakat luas.',
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
		correctAnswer: 'Kolektif kolegial dan etika forum yang menjunjung tinggi komitmen musyawarah mufakat serta kedewasaan dalam berorganisasi.',
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
		correctAnswer: 'Organisasi bukan sekadar mengejar sertifikat, melainkan wadah pembelajaran jangka panjang untuk melatih tanggung jawab, kerja sama, integritas, dan kontribusi nyata.',
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
		correctAnswer: 'Berkontribusi aktif sesuai minat dan keahlian, menjaga etika moral, bertanggung jawab penuh atas amanah, menjalin soliditas tim, dan memajukan HIMA FST UT Bandung.',
		explanation: 'Wujud nyata kelulusan kaderisasi adalah dedikasi, integritas, dan kontribusi aktif bagi HIMA FST UT Bandung.'
	}
];
