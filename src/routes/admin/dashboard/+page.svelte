<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		Users,
		ClipboardCheck,
		CheckCircle2,
		Clock,
		TrendingUp,
		Award,
		AlertTriangle,
		HelpCircle,
		ArrowRight,
		FileSpreadsheet,
		Eye,
		Activity,
		ShieldCheck
	} from 'lucide-svelte';

	let { data } = $props();
	const stats = $derived(data.stats);
	const distribution = $derived(data.distribution);
	const recentAttempts = $derived(data.recentAttempts);

	const maxDistValue = $derived(
		Math.max(...Object.values(distribution), 1)
	);
</script>

<svelte:head>
	<title>Dashboard Statistik - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-8">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Panel Eksekutif</Badge>
				<span class="text-xs text-slate-400">Kaderisasi Tingkat I</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Dashboard Statistik Pengurus
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Pemantauan real-time partisipasi, kelulusan, dan distribusi nilai mahasiswa FST UT Bandung.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<Button href="/admin/peserta" variant="primary" size="md">
				<ClipboardCheck class="w-4 h-4 mr-2" />
				<span>Lihat Peserta Quiz</span>
			</Button>
		</div>
	</div>

	<!-- 7 Key Stats Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Card 1: Total Mahasiswa -->
		<div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
			<div class="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
				<Users class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs font-semibold text-slate-400">Total Mahasiswa</p>
				<p class="text-2xl font-black text-white mt-1">{stats.totalStudents}</p>
				<p class="text-[11px] text-slate-500 mt-0.5">Akun Terdaftar</p>
			</div>
		</div>

		<!-- Card 2: Peserta Quiz Selesai -->
		<div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
			<div class="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
				<CheckCircle2 class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs font-semibold text-slate-400">Quiz Selesai</p>
				<p class="text-2xl font-black text-emerald-400 mt-1">{stats.totalCompleted}</p>
				<p class="text-[11px] text-emerald-500/80 mt-0.5">Sudah Mengirim</p>
			</div>
		</div>

		<!-- Card 3: Sedang Mengerjakan -->
		<div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
			<div class="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
				<Clock class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs font-semibold text-slate-400">Belum Selesai</p>
				<p class="text-2xl font-black text-amber-400 mt-1">{stats.totalInProgress}</p>
				<p class="text-[11px] text-amber-500/80 mt-0.5">Dalam Pengerjaan</p>
			</div>
		</div>

		<!-- Card 4: Nilai Rata-rata -->
		<div class="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3.5">
			<div class="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
				<TrendingUp class="w-5 h-5" />
			</div>
			<div>
				<p class="text-xs font-semibold text-slate-400">Nilai Rata-rata</p>
				<p class="text-2xl font-black text-white mt-1">{stats.averageScore}</p>
				<p class="text-[11px] text-slate-500 mt-0.5">Skala 0 - 100</p>
			</div>
		</div>
	</div>

	<!-- 3 Extreme Score Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center justify-between">
			<div>
				<p class="text-xs text-emerald-400 font-bold uppercase tracking-wider">Nilai Tertinggi</p>
				<p class="text-2xl font-extrabold text-white mt-0.5">{stats.highestScore} <span class="text-xs font-normal text-emerald-300">/100</span></p>
			</div>
			<Award class="w-8 h-8 text-emerald-400 opacity-80" />
		</div>

		<div class="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-between">
			<div>
				<p class="text-xs text-rose-400 font-bold uppercase tracking-wider">Nilai Terendah</p>
				<p class="text-2xl font-extrabold text-white mt-0.5">{stats.lowestScore} <span class="text-xs font-normal text-rose-300">/100</span></p>
			</div>
			<AlertTriangle class="w-8 h-8 text-rose-400 opacity-80" />
		</div>

		<div class="p-4 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-between">
			<div>
				<p class="text-xs text-slate-400 font-bold uppercase tracking-wider">Bank Soal Aktif</p>
				<p class="text-2xl font-extrabold text-white mt-0.5">{stats.totalQuestions} <span class="text-xs font-normal text-slate-400">Butir</span></p>
			</div>
			<HelpCircle class="w-8 h-8 text-emerald-500 opacity-80" />
		</div>
	</div>

	<!-- Middle Section: Histogram Chart & Recent Submissions -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Distribution Chart (2 Cols) -->
		<div class="lg:col-span-2 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-base font-bold text-white flex items-center gap-2">
						<Activity class="w-5 h-5 text-emerald-400" />
						<span>Distribusi Rentang Nilai Peserta</span>
					</h3>
					<p class="text-xs text-slate-400 mt-0.5">Grafik sebaran skor akhir kaderisasi tingkat I</p>
				</div>
				<Badge variant="emerald" size="sm">30 Soal</Badge>
			</div>

			<!-- Visual CSS Bar Histogram -->
			<div class="space-y-4 pt-2">
				{#each Object.entries(distribution) as [range, count]}
					{@const percentage = Math.round((count / (stats.totalCompleted || 1)) * 100)}
					{@const barWidth = Math.max((count / maxDistValue) * 100, count > 0 ? 8 : 0)}

					<div class="space-y-1.5">
						<div class="flex items-center justify-between text-xs font-semibold">
							<span class="text-slate-300 font-mono">Skor {range}</span>
							<span class="text-slate-400">{count} Peserta ({percentage}%)</span>
						</div>
						<div class="h-5 bg-slate-800 rounded-lg overflow-hidden flex items-center p-1">
							<div
								class="h-full rounded-md transition-all duration-500 flex items-center px-2 text-[10px] font-bold text-white {range === '90-100' ? 'bg-emerald-500' : range === '80-89' ? 'bg-teal-500' : range === '65-79' ? 'bg-blue-500' : range === '50-64' ? 'bg-amber-500' : 'bg-rose-500'}"
								style="width: {barWidth}%"
							>
								{#if count > 0}
									{count}
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
				<span>Batas Kelulusan Kaderisasi: <strong>65 Poin</strong></span>
				<a href="/admin/peserta" class="text-emerald-400 hover:text-emerald-300 font-bold inline-flex items-center gap-1">
					Buka Daftar Lengkap Peserta
					<ArrowRight class="w-3.5 h-3.5" />
				</a>
			</div>
		</div>

		<!-- Quick Recent Activity (1 Col) -->
		<div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
			<div>
				<h3 class="text-base font-bold text-white flex items-center gap-2 mb-1">
					<Clock class="w-4 h-4 text-emerald-400" />
					<span>Peserta Terbaru</span>
				</h3>
				<p class="text-xs text-slate-400 mb-4">Aktivitas pengerjaan kuis terkini</p>

				{#if recentAttempts.length > 0}
					<div class="space-y-3">
						{#each recentAttempts as att}
							<div class="p-3 bg-slate-800/80 rounded-xl border border-slate-750 flex items-center justify-between">
								<div class="truncate mr-2">
									<p class="text-xs font-bold text-white truncate">{att.student?.fullName}</p>
									<p class="text-[11px] text-slate-400">NIM: {att.student?.nim}</p>
								</div>
								<div class="shrink-0 text-right">
									{#if att.status === 'completed'}
										<span class="text-xs font-extrabold text-emerald-400">{att.score} Poin</span>
									{:else}
										<Badge variant="amber" size="sm">Berjalan</Badge>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
						Belum ada aktivitas pengerjaan quiz.
					</div>
				{/if}
			</div>

			<div class="pt-4 border-t border-slate-800">
				<Button href="/admin/peserta" variant="outline" size="sm" fullWidth class="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700">
					Lihat Semua Peserta
				</Button>
			</div>
		</div>
	</div>
</div>
