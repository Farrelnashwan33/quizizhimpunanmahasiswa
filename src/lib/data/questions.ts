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
		correctAnswer: 'Etika dalam organisasi berfungsi sebagai pedoman moral dan tata kelakuan untuk menciptakan serta menjaga hubungan yang harmonis, saling menghormati dan menghargai, menjaga ketertiban, mencegah konflik internal, serta membangun iklim kerja sama yang kondusif dan produktif antaranggota demi mencapai tujuan bersama organisasi.',
		explanation: 'Etika berorganisasi menjadi landasan moral fundamental dalam memelihara keharmonisan, rasa saling menghargai, keteraturan, dan iklim kerja sama tim yang solid.'
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
		correctAnswer: 'Mendengarkan dan menyimak lawan bicara hingga selesai secara utuh dengan penuh perhatian tanpa memotong pembicaraan, kemudian menyampaikan tanggapan, gagasan, atau kritik secara santun, rasional, objektif, dan dengan tutur kata yang menghargai keberagaman pendapat.',
		explanation: 'Etika komunikasi berlandaskan pada kemampuan menyimak secara tuntas (active listening), empati, serta merespons dengan bahasa yang santun, tertib, dan berbasis argumentasi rasional.'
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
		correctAnswer: 'Komitmen hadir tepat waktu dalam setiap agenda atau pertemuan organisasi, mematuhi peraturan dan kesepakatan internal yang berlaku, serta menuntaskan seluruh tugas dan amanah tanggung jawab secara optimal sesuai batas waktu (deadline) yang telah disepakati bersama.',
		explanation: 'Disiplin organisasi diwujudkan melalui manajemen waktu yang baik, ketaatan pada kesepakatan aturan, dan penyelesaian tugas tepat waktu secara bertanggung jawab.'
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
		correctAnswer: 'Kader yang memiliki keselarasan, kejujuran, dan konsistensi utuh antara nilai moral, apa yang diucapkan atau dijanjikan, dengan apa yang dilakukan dalam tindakan nyata, bersikap jujur, amanah, serta berani memegang teguh kebenaran dalam berbagai situasi organisasi.',
		explanation: 'Integritas adalah kesatuan antara hati, perkataan, dan perbuatan yang dilandasi nilai kejujuran, amanah, serta konsistensi memegang prinsip kebenaran.'
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
		correctAnswer: 'Melaksanakan dan menyelesaikan setiap amanah tugas yang dipercayakan secara tuntas dan berkualitas, berani menanggung segala konsekuensi atas pekerjaan yang dilakukan, serta menyampaikan laporan pertanggungjawaban (LPJ) dengan jujur, terbuka, dan akuntabel.',
		explanation: 'Tanggung jawab kader tercermin dari kesungguhan menuntaskan amanah tugas serta keterbukaan dan kejujuran dalam menyampaikan pertanggungjawaban.'
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
		correctAnswer: 'Mengedepankan semangat kebersamaan, kepemimpinan bersama yang setara, pengambilan keputusan melalui musyawarah untuk mufakat, serta senantiasa mendahulukan kepentingan dan kemaslahatan organisasi di atas kepentingan pribadi maupun golongan.',
		explanation: 'Prinsip kolektif kolegial menitikberatkan pada musyawarah mufakat, kesetaraan, gotong royong, dan komitmen mendahulukan kepentingan bersama organisasi.'
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
		correctAnswer: 'Sikap responsif dan proaktif, yaitu kesigapan, kepekaan, dan kecepatan dalam menanggapi informasi atau kebutuhan koordinasi organisasi guna memperlancar alur komunikasi, kepastian informasi, dan kerja tim secara efektif.',
		explanation: 'Sikap responsif menunjukkan kepedulian tinggi, komunikasi tanggap, dan komitmen menjaga kelancaran alur koordinasi serta kerja sama tim.'
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
		correctAnswer: 'Sikap inisiatif dan kemandirian, yaitu kesadaran diri yang peka untuk melakukan tindakan positif, solutif, dan bermanfaat bagi kemajuan organisasi tanpa harus selalu menunggu instruksi, komando, atau perintah dari orang lain.',
		explanation: 'Inisiatif mencerminkan kepemimpinan diri, kepekaan situasional, dan dorongan sukarela untuk bergerak memberikan manfaat nyata bagi organisasi.'
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
		correctAnswer: 'Kemampuan dan keberanian intelektual untuk menganalisis, mengkaji, dan menilai suatu fenomena, aturan, atau kebijakan secara mendalam, objektif, dan rasional berbasis data/fakta empiris, serta mampu menawarkan rekomendasi solusi alternatif yang konstruktif.',
		explanation: 'Sikap kritis mahasiswa berpijak pada analisis fakta objektif, kebenaran ilmiah, dan berorientasi pada penyampaian saran/solusi yang konstruktif.'
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
		correctAnswer: 'Kesadaran moral dan intelektual atas ilmu pengetahuan yang dimiliki, panggilan nurani, serta kepedulian tulus terhadap problematika sosial, keadilan, pembelaan nasib rakyat, dan masa depan kemajuan bangsa.',
		explanation: 'Gerakan mahasiswa bermula dari perpaduan tanggung jawab intelektual, kemurnian idealisme, dan kepedulian mendalam pada nasib masyarakat dan bangsa.'
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
		correctAnswer: 'Menjunjung tinggi nilai kebenaran ilmiah, keadilan sosial, kejujuran, kemanusiaan, independensi idealisme, serta konsistensi dalam memperjuangkan aspirasi dan hak-hak masyarakat luas tanpa terpengaruh kepentingan pragmatis.',
		explanation: 'Kebenaran ilmiah, keadilan sosial, moralitas, dan independensi idealisme merupakan pilar abadi perjuangan gerakan mahasiswa.'
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
		correctAnswer: 'Tiga pilar kewajiban pokok sivitas akademika perguruan tinggi yang terdiri atas: 1. Pendidikan dan Pengajaran, 2. Penelitian dan Pengembangan (Riset), serta 3. Pengabdian kepada Masyarakat.',
		explanation: 'Tridharma Perguruan Tinggi merupakan trilogi peran esensial kampus yang meliputi Pendidikan & Pengajaran, Penelitian & Pengembangan, dan Pengabdian kepada Masyarakat.'
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
		correctAnswer: 'Belajar secara tekun dan bersungguh-sungguh dalam menuntut ilmu, mengembangkan wawasan akademik dan keilmuan, berdiskusi kritis, serta aktif membagikan ilmu, keterampilan, atau mentoring pengetahuan kepada sesama mahasiswa dan lingkungan sekitar.',
		explanation: 'Penerapan pilar pendidikan terwujud dalam kegigihan belajar, peningkatan kapasitas intelektual, serta semangat berbagi ilmu pengetahuan kepada sesama.'
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
		correctAnswer: 'Pilar Penelitian dan Pengembangan yang berintegrasi langsung dengan Pengabdian kepada Masyarakat, yaitu memanfaatkan metode ilmiah, riset, kajian teknologi/sains untuk menghasilkan temuan inovatif dan solusi aplikatif bagi permasalahan nyata masyarakat.',
		explanation: 'Riset berbasis pemecahan masalah masyarakat mengintegrasikan keilmuan penelitian dengan wujud nyata pengabdian kepada masyarakat.'
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
		correctAnswer: 'Karena ketiga unsur Tridharma saling melengkapi, terhubung secara holistik, dan saling menguatkan untuk membentuk profil sarjana/mahasiswa yang utuh: unggul dalam wawasan teori akademis (pendidikan), mampu berpikir kritis-inovatif memecahkan masalah (penelitian), serta memiliki kepekaan sosial dan kebermanfaatan nyata bagi masyarakat (pengabdian).',
		explanation: 'Keseimbangan ketiga pilar Tridharma melahirkan insan akademis yang berilmu amaliah, berdaya riset tinggi, dan berjiwa sosial dalam menjawab tantangan bangsa.'
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
		correctAnswer: 'Generasi penerus bangsa, aset cadangan masa depan, dan calon pemimpin masa depan yang dipersiapkan dengan integritas moral yang kuat, kapasitas keilmuan mumpuni, dan kepemimpinan berkualitas untuk melanjutkan estafet kepemimpinan bangsa dan organisasi.',
		explanation: 'Sebagai Iron Stock, mahasiswa dipersiapkan menjadi generasi pelanjut dan bibit pemimpin masa depan yang berkarakter tangguh dan bermoral tinggi.'
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
		correctAnswer: 'Peran Guardian of Value (penjaga nilai-nilai luhur), yaitu mahasiswa bertindak sebagai penjaga, pemelihara, benteng pertahanan moral, dan teladan dalam mengamalkan nilai-nilai etika, kebenaran, keadilan, kejujuran, dan kesusilaan dalam kehidupan kampus maupun bermasyarakat.',
		explanation: 'Guardian of Value menempatkan mahasiswa sebagai benteng moral dan teladan dalam menjaga serta melestarikan nilai-nilai kebenaran dan etika luhur.'
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
		correctAnswer: 'Peran Kontrol Sosial (Social Control), di mana mahasiswa bertindak sebagai pengawas independen yang peka, kritis, dan berani mengoreksi serta mengawal kebijakan kampus maupun pemerintah agar senantiasa berjalan sesuai aturan, berpihak pada keadilan, dan memperjuangkan kemaslahatan masyarakat.',
		explanation: 'Social Control menegaskan peran mahasiswa sebagai jembatan aspirasi, pengawas sosial, dan pengawal kebijakan agar senantiasa adil dan sesuai norma.'
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
		correctAnswer: 'Peran Agent of Change (agen penggerak perubahan), yaitu mahasiswa bertindak sebagai pelopor, inovator, dan motor penggerak transformasi positif yang membawa ide-ide pembaruan kreatif dan solusi nyata guna memajukan masyarakat ke arah yang lebih baik.',
		explanation: 'Agent of Change mencerminkan kapasitas mahasiswa sebagai inisiator perubahan sosial yang progresif, visioner, dan solutif.'
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
		correctAnswer: 'Sebagai wadah aspirasi dan pengembangan potensi minat, bakat, keilmuan, sarana pembelajaran kepemimpinan (leadership), melatih kerja sama tim (teamwork), memperluas jaringan/relasi, mengasah soft skill manajemen, serta sarana kontribusi nyata mahasiswa bagi almamater dan masyarakat.',
		explanation: 'Organisasi kemahasiswaan seperti HIMA FST menjadi wadah kawah candradimuka dalam membentuk karakter kepemimpinan, kolaborasi, dan kontribusi nyata mahasiswa.'
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
		correctAnswer: 'Menerapkan etika forum dengan menyimak dan mendengarkan pembicaraan peserta lain sampai selesai secara tuntas, menunggu giliran berbicara atau meminta izin pimpinan sidang secara tertib, kemudian menyampaikan pandangan atau argumentasi penolakan secara santun, rasional, objektif, dan fokus pada substansi masalah tanpa menyerang pribadi.',
		explanation: 'Etika musyawarah dan persidangan menuntut ketertiban, saling menghargai giliran bicara, kesantunan berbahasa, dan argumentasi rasional berbasis fakta.'
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
		correctAnswer: 'Segera mengomunikasikan progres dan kendala yang dihadapi secara proaktif, transparan, dan jujur kepada ketua atau penanggung jawab tim sebelum batas waktu berakhir, serta berkoordinasi bersama untuk mencari solusi, meminta arahan, atau mendistribusikan bantuan agar tugas tetap tuntas.',
		explanation: 'Komunikasi proaktif sebelum batas waktu (deadline) menunjukkan kedewasaan berorganisasi, tanggung jawab, dan profesionalitas dalam manajemen kendala tim.'
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
		correctAnswer: 'Mengingatkan dan menegur rekan tersebut secara pribadi (empatik dan tertutup agar tidak mempermalukannya), menyampaikan letak kesalahan dengan bahasa yang baik, serta mengajaknya berkolaborasi untuk merevisi, mengoreksi, dan memperbaiki laporan tersebut secara jujur dan transparan.',
		explanation: 'Sikap saling mengingatkan secara konstruktif dan membantu perbaikan laporan mencerminkan kepedulian, integritas, dan kejujuran dalam berorganisasi.'
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
		correctAnswer: 'Mengajak anggota tersebut berdialog dan berdiskusi secara terbuka dalam suasana kekeluargaan yang santun, menjelaskan perspektif tim, mengedepankan musyawarah untuk mufakat, serta menekankan pentingnya mendahulukan tujuan dan kepentingan bersama organisasi di atas ego atau kepentingan pribadi.',
		explanation: 'Prinsip kolektif kolegial menyelesaikan perbedaan dengan musyawarah mufakat, menurunkan ego pribadi, dan memprioritaskan kesuksesan bersama.'
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
		correctAnswer: 'Mengambil inisiatif secara sukarela untuk mendekati, mendampingi, mengarahkan, dan membantunya memahami alur kerja kepanitiaan/organisasi sebagai wujud kepedulian, empati, dan solidaritas sesama kader demi terciptanya soliditas tim.',
		explanation: 'Inisiatif merangkul dan membimbing kader baru memperkuat rasa kekeluargaan, kaderisasi berkelanjutan, dan efektivitas kerja organisasi.'
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
		correctAnswer: 'Mengumpulkan data, fakta, dan bukti empiris yang valid di lapangan terlebih dahulu, menyusun telaah/kajian ilmiah secara komprehensif dan objektif, lalu menyampaikan aspirasi atau kritik secara santun dan terstruktur melalui forum dialog/jalur resmi dengan menyertakan tawaran rekomendasi solusi konkret.',
		explanation: 'Karakter gerakan mahasiswa berpijak pada kecendekiaan: kritik berbasis kajian fakta objektif, disampaikan secara beretika, dan berorientasi pada tawaran solusi perbaikan.'
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
		correctAnswer: 'Keterpaduan dan sinergi harmonis antara pilar Penelitian dan Pengembangan (riset keilmuan sains/teknologi) dengan pilar Pengabdian kepada Masyarakat, yaitu mengaplikasikan hasil riset dan metode ilmiah untuk menyelesaikan persoalan nyata di tengah masyarakat.',
		explanation: 'Penerapan hasil penelitian ilmiah untuk kemaslahatan publik merupakan integrasi nyata dari pilar ke-2 dan ke-3 Tridharma Perguruan Tinggi.'
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
		correctAnswer: 'Penerapan prinsip kolektif kolegial, etika berorganisasi, kedewasaan sikap (sikap sportif/legawa), serta komitmen loyalitas yang tinggi untuk menghormati dan menjalankan keputusan konsensus musyawarah mufakat demi kepentingan bersama.',
		explanation: 'Menghormati dan melaksanakan keputusan musyawarah dengan penuh tanggung jawab adalah cermin kedewasaan berdemokrasi dan komitmen kolektif kolegial.'
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
		correctAnswer: 'Organisasi kemahasiswaan bukan sekadar sarana formalitas mencari sertifikat atau kepentingan pragmatis pribadi, melainkan wahana proses pembelajaran jangka panjang untuk melatih tanggung jawab, integritas, kepemimpinan, kepedulian sosial, kerja sama, dan memberikan kontribusi nyata yang berkelanjutan.',
		explanation: 'Nilai sejati berorganisasi terletak pada proses pembentukan karakter, pengabdian yang tulus, tanggung jawab, dan kontribusi nyata, bukan sekadar sertifikat.'
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
		correctAnswer: 'Berkomitmen memberikan kontribusi aktif, tulus, dan optimal sesuai minat serta keahlian, senantiasa menjaga etika moral dan integritas, bertanggung jawab penuh atas setiap amanah yang diemban, membina kerja sama solid dengan seluruh pengurus, serta terus berikhtiar memajukan HIMA FST UT Bandung agar memberi manfaat luas bagi mahasiswa dan masyarakat.',
		explanation: 'Pemahaman utuh kaderisasi bermuara pada dedikasi tulus, integritas pribadi, kerja sama harmonis, dan komitmen kontribusi nyata memajukan HIMA FST UT Bandung.'
	}
];
