<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import { BarChart3, Award, CheckCircle2, XCircle, TrendingUp, Compass, Flame, Sparkles, Users, Lightbulb, Download } from 'lucide-svelte';

	let { data } = $props();
	const totalCompleted = $derived(data.totalCompleted || 0);
	const totalPassed = $derived(data.totalPassed || 0);
	const totalFailed = $derived(data.totalFailed || 0);
	const sectionStats = $derived(data.sectionStats || {});

	const passRate = $derived(
		totalCompleted > 0 ? Math.round((totalPassed / totalCompleted) * 100) : 0
	);

	const sectionIcons: Record<string, any> = {
		'Nilai dan Karakter Dasar': Sparkles,
		'Gerakan Mahasiswa': Flame,
		'Tridharma Perguruan Tinggi': Compass,
		'Peran dan Fungsi Mahasiswa': Award,
		'Organisasi Kemahasiswaan dan HIMA FST': Users,
		'Studi Kasus': Lightbulb
	};
</script>

<svelte:head>
	<title>Analisis Hasil & Kelulusan - Admin HIMA FST UT Bandung</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
		<div>
			<div class="flex items-center gap-2 mb-1">
				<Badge variant="emerald" size="sm">Analisis Hasil</Badge>
				<span class="text-xs text-slate-400">Tingkat Pemahaman Materi</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
				Hasil & Statistik Kelulusan
			</h1>
			<p class="text-xs sm:text-sm text-slate-400 mt-1">
				Persentase kelulusan kaderisasi dan tingkat penguasaan per kategori materi (A–F).
			</p>
		</div>

		<div class="flex items-center gap-3">
			<a
				href="/admin/peserta/export"
				data-sveltekit-reload
				download="Rekap_Nilai_Quiz_Kaderisasi_HIMA_FST.csv"
				class="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
			>
				<Download class="w-4 h-4 mr-2" />
				<span>Download Rekap Nilai (CSV)</span>
			</a>
		</div>
	</div>

	<!-- 3 Highlight Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
			<div class="flex items-center justify-between mb-2">
				<p class="text-xs font-semibold text-slate-400 uppercase">Tingkat Kelulusan</p>
				<TrendingUp class="w-5 h-5 text-emerald-400" />
			</div>
			<p class="text-3xl font-black text-emerald-400">{passRate}%</p>
			<p class="text-xs text-slate-500 mt-1">Standar KKM: Skor ≥ 65</p>
		</div>

		<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
			<div class="flex items-center justify-between mb-2">
				<p class="text-xs font-semibold text-slate-400 uppercase">Peserta Lulus</p>
				<CheckCircle2 class="w-5 h-5 text-emerald-400" />
			</div>
			<p class="text-3xl font-black text-white">{totalPassed}</p>
			<p class="text-xs text-emerald-500/80 mt-1">dari {totalCompleted} peserta selesai</p>
		</div>

		<div class="p-6 rounded-2xl bg-slate-900 border border-slate-800">
			<div class="flex items-center justify-between mb-2">
				<p class="text-xs font-semibold text-slate-400 uppercase">Belum Lulus</p>
				<XCircle class="w-5 h-5 text-rose-400" />
			</div>
			<p class="text-3xl font-black text-rose-400">{totalFailed}</p>
			<p class="text-xs text-rose-500/80 mt-1">Perlu materi remedi</p>
		</div>
	</div>

	<!-- Section Mastery Breakdown -->
	<div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
		<div>
			<h2 class="text-lg font-bold text-white flex items-center gap-2">
				<BarChart3 class="w-5 h-5 text-emerald-400" />
				<span>Tingkat Ketepatan Jawaban per Kategori Soal</span>
			</h2>
			<p class="text-xs text-slate-400 mt-0.5">Akurasi rata-rata jawaban benar seluruh peserta pada masing-masing topik.</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
			{#each Object.entries(sectionStats) as [sec, val]}
				{@const Icon = sectionIcons[sec] || Sparkles}
				{@const accuracy = val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0}

				<div class="p-5 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2.5">
							<div class="w-8 h-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
								<Icon class="w-4 h-4" />
							</div>
							<h3 class="text-xs font-bold text-white max-w-[220px] truncate">{sec}</h3>
						</div>
						<span class="text-sm font-mono font-extrabold {accuracy >= 70 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}">
							{accuracy}%
						</span>
					</div>

					<div class="h-2 bg-slate-800 rounded-full overflow-hidden">
						<div
							class="h-full rounded-full transition-all duration-500 {accuracy >= 70 ? 'bg-emerald-500' : accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}"
							style="width: {accuracy}%"
						></div>
					</div>

					<div class="flex items-center justify-between text-[11px] text-slate-500">
						<span>{val.correct} Jawaban Benar</span>
						<span>Total {val.total} Pertanyaan Terjawab</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
