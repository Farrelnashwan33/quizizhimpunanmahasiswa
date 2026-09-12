<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		GraduationCap,
		BookOpen,
		CheckCircle,
		ShieldCheck,
		Clock,
		Award,
		Zap,
		ArrowRight,
		Layers,
		Check,
		Sparkles,
		Flame,
		Compass,
		Users,
		Lightbulb
	} from 'lucide-svelte';

	let { data } = $props();
	const user = $derived(data.user);
	const profile = $derived(data.profile);
	const activeQuiz = $derived(data.activeQuiz);

	const materiList = [
		{
			category: 'A. Nilai dan Karakter Dasar',
			total: 'Soal 1–8',
			desc: 'Integritas akademik, kemandirian belajar di UT, etika digital, akuntabilitas, resiliensi mental, dan toleransi.',
			icon: Sparkles,
			color: 'emerald'
		},
		{
			category: 'B. Gerakan Mahasiswa',
			total: 'Soal 9–11',
			desc: 'Sejarah pergerakan mahasiswa Indonesia, moral force, peran social control di era transformasi digital.',
			icon: Flame,
			color: 'amber'
		},
		{
			category: 'C. Tridharma Perguruan Tinggi',
			total: 'Soal 12–15',
			desc: 'Pendidikan & pengajaran mandiri, penelitian & PKM, serta pengabdian masyarakat terapan di Jawa Barat.',
			icon: Compass,
			color: 'blue'
		},
		{
			category: 'D. Peran dan Fungsi Mahasiswa',
			total: 'Soal 16–19',
			desc: 'Agent of Change, Iron Stock, Guardian of Value, dan Moral Force dalam dinamika kebangsaan.',
			icon: Award,
			color: 'purple'
		},
		{
			category: 'E. Organisasi Kemahasiswaan & HIMA FST',
			total: 'Soal 20',
			desc: 'Struktur, fungsi, visi-misi, serta AD/ART & GBHO sebagai konstitusi tertinggi organisasi.',
			icon: Users,
			color: 'emerald'
		},
		{
			category: 'F. Studi Kasus Kepemimpinan & Etika',
			total: 'Soal 21–30',
			desc: 'Skenario pemecahan masalah kepanitiaan, manajemen waktu kerja-kuliah, etika privasi data, dan mitigasi risiko.',
			icon: Lightbulb,
			color: 'rose'
		}
	];
</script>

<svelte:head>
	<title>Quiz Kaderisasi Tingkat I - HIMA FST UT Bandung</title>
</svelte:head>

<div class="relative overflow-hidden">
	<!-- Background glow blobs -->
	<div class="absolute -top-40 -right-40 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute top-96 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

	<!-- Hero Section -->
	<section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
		<div class="text-center max-w-3xl mx-auto">
			<!-- Header Badge -->
			<div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-6 shadow-xs animate-in fade-in slide-in-from-bottom-3 duration-500">
				<img src="/logo-hima.png" alt="Logo HIMA FST UT" class="w-5 h-5 object-contain" />
				<span>HIMPUNAN MAHASISWA FAKULTAS SAINS DAN TEKNOLOGI UNIVERSITAS TERBUKA</span>
			</div>

			<!-- Main Title -->
			<h1 class="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none mb-6">
				Quiz Kaderisasi <span class="text-emerald-600">Tingkat I</span>
			</h1>

			<!-- Subtitle -->
			<p class="text-lg sm:text-xl font-semibold text-emerald-700 mb-4">
				"Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi."
			</p>

			<!-- Description -->
			<p class="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
				Platform evaluasi interaktif daring untuk mengukur pemahaman nilai-nilai dasar kepemimpinan, Tridharma Perguruan Tinggi, dan etika sains teknologi bagi seluruh calon kader HIMA FST Universitas Terbuka Bandung.
			</p>

			<!-- Action Buttons -->
			<div class="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
				<Button href="/quiz" variant="primary" size="lg" fullWidth class="shadow-lg shadow-emerald-600/30 text-base font-bold py-4">
					<span>Mulai Quiz Sekarang (Isi Nama & NIM)</span>
					<ArrowRight class="w-5 h-5 ml-2" />
				</Button>
			</div>

			<div class="mt-5 flex items-center justify-center gap-4 text-xs">
				<a href="/quiz" class="text-emerald-700 font-semibold hover:underline">
					Langsung Kerjakan (Tanpa Perlu Login)
				</a>
				<span class="text-slate-300">•</span>
				<a href="/admin/login" class="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors">
					<ShieldCheck class="w-3.5 h-3.5" />
					Portal Admin Pengurus
				</a>
			</div>
		</div>

		<!-- 4 Key Information Cards -->
		<div class="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
			<!-- Card 1 -->
			<Card glass hover class="flex items-start gap-4">
				<div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
					<Layers class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-base font-bold text-slate-900">30 Soal Berbobot</h2>
					<p class="text-xs text-slate-500 mt-1">
						Mencakup pemahaman teoritis hingga studi kasus kepemimpinan riil.
					</p>
				</div>
			</Card>

			<!-- Card 2 -->
			<Card glass hover class="flex items-start gap-4">
				<div class="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
					<CheckCircle class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-base font-bold text-slate-900">Pilihan Ganda</h2>
					<p class="text-xs text-slate-500 mt-1">
						Opsi A, B, C, D dengan navigasi modern, review, dan autosave.
					</p>
				</div>
			</Card>

			<!-- Card 3 -->
			<Card glass hover class="flex items-start gap-4">
				<div class="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
					<BookOpen class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-base font-bold text-slate-900">Materi Kaderisasi</h2>
					<p class="text-xs text-slate-500 mt-1">
						Kurikulum komprehensif Tridharma, nilai dasar, dan HIMA FST.
					</p>
				</div>
			</Card>

			<!-- Card 4 -->
			<Card glass hover class="flex items-start gap-4">
				<div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
					<Zap class="w-6 h-6" />
				</div>
				<div>
					<h2 class="text-base font-bold text-slate-900">Penilaian Otomatis</h2>
					<p class="text-xs text-slate-500 mt-1">
						Perhitungan skor server-side 0–100 dan laporan kelulusan instan.
					</p>
				</div>
			</Card>
		</div>
	</section>

	<!-- Section Materi & Kategori Soal -->
	<section class="border-t border-slate-200/80 bg-white py-16 lg:py-24">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-2xl mx-auto mb-12">
				<Badge variant="emerald" size="md" class="mb-3">Struktur Materi</Badge>
				<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
					6 Domain Materi Kaderisasi Tingkat I
				</h2>
				<p class="text-sm text-slate-600 mt-2">
					Seluruh materi dirancang khusus untuk membangun fondasi karakter mahasiswa FST UT Bandung yang mandiri dan berintegritas.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each materiList as item}
					{@const Icon = item.icon}
					<Card hover class="border-slate-200 flex flex-col justify-between h-full">
						<div>
							<div class="flex items-center justify-between mb-4">
								<div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
									<Icon class="w-5 h-5" />
								</div>
								<Badge variant="emerald" size="sm">{item.total}</Badge>
							</div>
							<h3 class="text-base font-bold text-slate-900 mb-2">{item.category}</h3>
							<p class="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
						</div>

						<div class="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
							<Check class="w-3.5 h-3.5" />
							<span>Tercakup dalam 30 Soal Quiz</span>
						</div>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- Section Alur Pengerjaan -->
	<section class="py-16 lg:py-24 bg-slate-50/80 border-t border-slate-200/80">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center max-w-2xl mx-auto mb-14">
				<Badge variant="slate" size="md" class="mb-3">Petunjuk Pengerjaan</Badge>
				<h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900">
					Alur Pelaksanaan Quiz
				</h2>
				<p class="text-sm text-slate-600 mt-2">
					Ikuti 4 langkah mudah untuk menyelesaikan evaluasi kaderisasi Anda.
				</p>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
				<div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
					<div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">1</div>
					<h3 class="text-sm font-bold text-slate-900 mb-1">Isi Nama & NIM</h3>
					<p class="text-xs text-slate-500">Cukup masukkan Nama Lengkap, NIM, dan Program Studi tanpa registrasi kata sandi.</p>
				</div>

				<div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
					<div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">2</div>
					<h3 class="text-sm font-bold text-slate-900 mb-1">Kerjakan 30 Soal</h3>
					<p class="text-xs text-slate-500">Jawab 30 pertanyaan pilihan ganda dengan navigasi nomor 1–30 dan auto-save respons.</p>
				</div>

				<div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
					<div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">3</div>
					<h3 class="text-sm font-bold text-slate-900 mb-1">Review Jawaban</h3>
					<p class="text-xs text-slate-500">Periksa ringkasan jawaban soal yang telah terjawab atau belum sebelum konfirmasi kirim.</p>
				</div>

				<div class="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm relative">
					<div class="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">4</div>
					<h3 class="text-sm font-bold text-slate-900 mb-1">Hasil & Pembahasan</h3>
					<p class="text-xs text-slate-500">Skor 0–100 keluar secara instan lengkap dengan status kelulusan dan pembahasan soal.</p>
				</div>
			</div>

			<!-- Bottom CTA Banner -->
			<div class="mt-16 p-8 sm:p-12 rounded-3xl emerald-gradient text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
				<div>
					<h3 class="text-xl sm:text-2xl font-extrabold tracking-tight">Siap Memulai Kaderisasi FST?</h3>
					<p class="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
						Tunjukkan komitmen dan pemahaman terbaik Anda untuk kemajuan HIMA FST UT Bandung.
					</p>
				</div>
				<div class="shrink-0 flex items-center gap-3">
					<Button href="/quiz" variant="secondary" size="lg" class="bg-white text-emerald-800 hover:bg-slate-100 font-bold">
						<span>Mulai Kerjakan Quiz</span>
						<ArrowRight class="w-4 h-4 ml-2" />
					</Button>
				</div>
			</div>
		</div>
	</section>
</div>
