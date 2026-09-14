<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import {
		GraduationCap,
		User,
		Hash,
		BookOpen,
		Clock,
		CheckCircle,
		AlertCircle,
		Play,
		Award,
		Calendar,
		ArrowRight,
		Eye,
		HelpCircle,
		ShieldAlert
	} from 'lucide-svelte';

	let { data } = $props();
	const profile = $derived(data.profile);
	const quiz = $derived(data.quiz);
	const attempts = $derived(data.attempts || []);
	const currentAttempt = $derived(data.currentAttempt);

	const isUnauthorizedAdmin = $derived(page.url.searchParams.get('error') === 'unauthorized_admin');

	const isCompleted = $derived(currentAttempt?.status === 'completed');
	const isInProgress = $derived(currentAttempt?.status === 'in_progress');
	const hasStarted = $derived(!!currentAttempt);

	const answerProgress = $derived(
		currentAttempt ? currentAttempt._count?.answers || 0 : 0
	);
	const totalQuestions = $derived(quiz?._count?.questions || 30);
</script>

<svelte:head>
	<title>Dashboard Mahasiswa - Quiz Kaderisasi I HIMA FST</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
	<!-- Unauthorized Admin Warning if user tried accessing /admin/* -->
	{#if isUnauthorizedAdmin}
		<div class="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
			<ShieldAlert class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
			<div>
				<h4 class="text-sm font-bold">Akses Ditolak</h4>
				<p class="text-xs text-amber-700 mt-0.5">
					Akun Anda terdaftar sebagai Mahasiswa dan tidak memiliki hak akses administrator. Silakan hubungi pengurus jika terdapat kesalahan.
				</p>
			</div>
		</div>
	{/if}

	<!-- Welcome Header Card -->
	<div class="mb-8 p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-slate-850 to-emerald-950 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
		<div class="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

		<div class="flex items-start gap-4">
			<div class="w-14 h-14 rounded-2xl emerald-gradient flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-600/30">
				<GraduationCap class="w-7 h-7" />
			</div>
			<div>
				<div class="flex items-center gap-2 mb-1">
					<Badge variant="emerald" size="sm">Peserta Kaderisasi</Badge>
					<span class="text-xs text-slate-400 font-medium">Semester Ganjil</span>
				</div>
				<h1 class="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
					Selamat Datang, {profile?.fullName || 'Mahasiswa'}!
				</h1>
				<div class="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1.5 font-medium">
					<span>NIM: <strong class="text-emerald-400 font-mono">{profile?.nim || '-'}</strong></span>
					<span>•</span>
					<span>Prodi: <strong class="text-white">{profile?.programStudi || 'Sains dan Teknologi'}</strong></span>
				</div>
			</div>
		</div>

		<!-- Status Badge on Right -->
		<div class="shrink-0 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center sm:text-right">
			<p class="text-[11px] uppercase tracking-wider text-slate-300 font-bold">Status Evaluasi</p>
			{#if isCompleted}
				<div class="flex items-center gap-1.5 text-emerald-400 font-bold text-sm mt-0.5 justify-center sm:justify-end">
					<CheckCircle class="w-4 h-4" />
					<span>Sudah Selesai</span>
				</div>
			{:else if isInProgress}
				<div class="flex items-center gap-1.5 text-amber-400 font-bold text-sm mt-0.5 justify-center sm:justify-end">
					<Clock class="w-4 h-4" />
					<span>Sedang Berjalan</span>
				</div>
			{:else}
				<div class="flex items-center gap-1.5 text-slate-300 font-bold text-sm mt-0.5 justify-center sm:justify-end">
					<BookOpen class="w-4 h-4" />
					<span>Belum Dikerjakan</span>
				</div>
			{/if}
		</div>
	</div>

	<!-- Main Grid: Quiz Card & Result / Overview -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Left: Active Quiz Card (2 Cols) -->
		<div class="lg:col-span-2 space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
					<BookOpen class="w-5 h-5 text-emerald-600" />
					<span>Quiz Kaderisasi Aktif</span>
				</h2>
			</div>

			{#if quiz}
				<Card class="border-emerald-200/80 shadow-md">
					<div class="flex flex-col sm:flex-row items-start justify-between gap-4 pb-6 border-b border-slate-100">
						<div>
							<Badge variant="emerald" size="sm" class="mb-2">Wajib Diikuti</Badge>
							<h3 class="text-xl font-bold text-slate-900">{quiz.title}</h3>
							<p class="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xl">
								{quiz.description || 'Evaluasi pemahaman materi kaderisasi Tingkat I HIMA FST UT Bandung.'}
							</p>
						</div>
					</div>

					<!-- Quiz Stats Attributes -->
					<div class="grid grid-cols-3 gap-3 my-6 py-3 bg-slate-50 rounded-2xl text-center">
						<div>
							<p class="text-[11px] text-slate-500 font-semibold uppercase">Total Soal</p>
							<p class="text-base sm:text-lg font-extrabold text-slate-900">{totalQuestions} Butir</p>
						</div>
						<div class="border-x border-slate-200">
							<p class="text-[11px] text-slate-500 font-semibold uppercase">Tipe Soal</p>
							<p class="text-base sm:text-lg font-extrabold text-slate-900">Pilihan Ganda</p>
						</div>
						<div>
							<p class="text-[11px] text-slate-500 font-semibold uppercase">Batas Waktu</p>
							<p class="text-base sm:text-lg font-extrabold text-slate-900">{quiz.durationMinutes} Menit</p>
						</div>
					</div>

					<!-- Progress bar if started -->
					{#if hasStarted && !isCompleted}
						<div class="mb-6 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
							<div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
								<span>Progres Jawaban Tersimpan</span>
								<span class="text-emerald-700">{answerProgress} / {totalQuestions} Soal</span>
							</div>
							<ProgressBar value={answerProgress} max={totalQuestions} color="emerald" size="md" />
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
						{#if isCompleted && currentAttempt}
							<div class="flex items-center gap-2 text-xs font-semibold text-emerald-700">
								<CheckCircle class="w-4 h-4" />
								<span>Anda telah menyelesaikan kuis ini.</span>
							</div>
							<Button href="/hasil/{currentAttempt.id}" variant="primary" size="md">
								<Award class="w-4 h-4 mr-2" />
								<span>Lihat Laporan Nilai</span>
							</Button>
						{:else if isInProgress}
							<div class="flex items-center gap-2 text-xs text-amber-700 font-semibold">
								<Clock class="w-4 h-4" />
								<span>Kuis sedang berjalan. Jawaban otomatis tersimpan.</span>
							</div>
							<Button href="/quiz/{quiz.id}" variant="primary" size="lg" class="shadow-lg shadow-emerald-600/30">
								<Play class="w-4 h-4 mr-2 fill-current" />
								<span>Lanjutkan Mengerjakan ({answerProgress}/{totalQuestions})</span>
							</Button>
						{:else}
							<div class="flex items-center gap-2 text-xs text-slate-500 font-medium">
								<AlertCircle class="w-4 h-4 text-emerald-600" />
								<span>Pastikan koneksi internet stabil sebelum menekan tombol mulai.</span>
							</div>
							<Button href="/quiz/{quiz.id}" variant="primary" size="lg" class="shadow-lg shadow-emerald-600/30">
								<Play class="w-4 h-4 mr-2 fill-current" />
								<span>Mulai Kerjakan Quiz</span>
							</Button>
						{/if}
					</div>
				</Card>
			{:else}
				<Card class="p-8 text-center text-slate-500">
					<AlertCircle class="w-8 h-8 text-slate-400 mx-auto mb-2" />
					<p class="font-bold text-slate-800">Tidak ada quiz yang sedang aktif saat ini.</p>
					<p class="text-xs text-slate-500 mt-1">Silakan tunggu pengumuman resmi dari panitia kaderisasi.</p>
				</Card>
			{/if}

			<!-- Riwayat Pengerjaan -->
			<div class="pt-4">
				<h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
					<Calendar class="w-4 h-4 text-slate-500" />
					<span>Riwayat Pengerjaan Quiz</span>
				</h3>

				{#if attempts.length > 0}
					<div class="space-y-3">
						{#each attempts as att}
							<div class="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between hover:border-slate-300 transition-all">
								<div class="flex items-center gap-3">
									<div class="w-10 h-10 rounded-xl {att.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'} flex items-center justify-center font-bold">
										{#if att.status === 'completed'}
											<CheckCircle class="w-5 h-5" />
										{:else}
											<Clock class="w-5 h-5" />
										{/if}
									</div>
									<div>
										<p class="text-xs font-bold text-slate-900">
											{att.status === 'completed' ? 'Selesai Dikerjakan' : 'Sedang Berlangsung'}
										</p>
										<p class="text-[11px] text-slate-500">
											Mulai: {new Date(att.startedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
										</p>
									</div>
								</div>

								<div class="flex items-center gap-3">
									{#if att.status === 'completed'}
										<div class="text-right">
											<p class="text-xs text-slate-400 font-semibold">Skor</p>
											<p class="text-sm font-extrabold text-emerald-600">{att.score ?? '-'}/100</p>
										</div>
										<Button href="/hasil/{att.id}" variant="outline" size="sm">
											<Eye class="w-3.5 h-3.5 mr-1" />
											Hasil
										</Button>
									{:else}
										<Button href="/quiz/{att.quizId}" variant="primary" size="sm">
											Lanjutkan
										</Button>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
						Belum ada riwayat pengerjaan quiz.
					</div>
				{/if}
			</div>
		</div>

		<!-- Right: Score Summary & Guidelines (1 Col) -->
		<div class="space-y-6">
			<!-- Nilai Card if Completed -->
			{#if isCompleted && currentAttempt}
				<Card class="bg-linear-to-b from-emerald-800 to-emerald-950 text-white shadow-xl">
					<div class="text-center">
						<div class="inline-flex p-3 rounded-2xl bg-white/10 mb-3">
							<Award class="w-8 h-8 text-emerald-300" />
						</div>
						<h3 class="text-xs uppercase font-bold tracking-wider text-emerald-200">Hasil Evaluasi Anda</h3>
						<div class="my-4">
							<span class="text-5xl font-black text-white tracking-tight">{currentAttempt.score ?? 0}</span>
							<span class="text-emerald-200 text-lg font-bold">/100</span>
						</div>

						<div class="grid grid-cols-2 gap-2 my-4 pt-4 border-t border-white/10 text-xs">
							<div class="p-2.5 bg-white/5 rounded-xl">
								<p class="text-emerald-200">Jawaban Sesuai</p>
								<p class="text-base font-extrabold text-white">{currentAttempt.correctCount} Soal</p>
							</div>
							<div class="p-2.5 bg-white/5 rounded-xl">
								<p class="text-emerald-200">Perlu Evaluasi</p>
								<p class="text-base font-extrabold text-rose-300">{currentAttempt.wrongCount} Soal</p>
							</div>
						</div>

						<Button href="/hasil/{currentAttempt.id}" variant="secondary" size="md" fullWidth class="bg-white text-emerald-900 hover:bg-slate-100">
							Detail Laporan Lengkap
						</Button>
					</div>
				</Card>
			{/if}

			<!-- Tata Tertib Quiz -->
			<Card class="space-y-4">
				<h3 class="text-sm font-bold text-slate-900 flex items-center gap-2">
					<HelpCircle class="w-4 h-4 text-emerald-600" />
					<span>Tata Tertib Pengerjaan</span>
				</h3>
				<ul class="space-y-3 text-xs text-slate-600">
					<li class="flex items-start gap-2">
						<span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
						<span>Quiz terdiri dari <strong>30 butir soal pilihan ganda</strong> dengan durasi 60 menit.</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
						<span>Setiap jawaban yang Anda pilih langsung <strong>tersimpan otomatis</strong> ke server Supabase.</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
						<span>Anda bebas berpindah antar nomor soal melalui panel nomor navigasi.</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
						<span>Gunakan tombol <strong>Review Jawaban</strong> sebelum mengklik <strong>Kirim Quiz</strong>.</span>
					</li>
				</ul>
			</Card>

			<!-- Help Box -->
			<div class="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 space-y-2">
				<p class="font-bold text-slate-900">Butuh Bantuan Kendala Teknis?</p>
				<p class="leading-relaxed">Jika mengalami kendala jaringan atau kesalahan data NIM, hubungi divisi IT HIMA FST melalui grup WhatsApp resmi kaderisasi.</p>
			</div>
		</div>
	</div>
</div>
