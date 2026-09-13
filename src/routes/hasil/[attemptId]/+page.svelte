<script lang="ts">
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		Award,
		CheckCircle2,
		XCircle,
		Clock,
		ArrowLeft,
		BookOpen,
		User,
		Hash,
		Sparkles,
		Check,
		X,
		FileText,
		Printer,
		PenLine
	} from 'lucide-svelte';

	let { data } = $props();
	const attempt = $derived(data.attempt);
	const quiz = $derived(data.quiz);
	const student = $derived(data.student);
	const answers = $derived(data.answers || []);
	const canReviewAnswers = $derived(data.canReviewAnswers);

	const score = $derived(attempt.score);
	const isGraded = $derived(score !== null && score !== undefined);
	const isPassed = $derived(isGraded && typeof score === 'number' && score >= 65);

	// Calculate duration
	const durationText = $derived(() => {
		if (!attempt.startedAt || !attempt.submittedAt) return '-';
		const start = new Date(attempt.startedAt).getTime();
		const end = new Date(attempt.submittedAt).getTime();
		const diffMins = Math.round((end - start) / (1000 * 60));
		return `${diffMins} Menit`;
	});

	onMount(() => {
		if (isPassed) {
			try {
				confetti({
					particleCount: 80,
					spread: 70,
					origin: { y: 0.6 }
				});
			} catch (e) {}
		}
	});

	let showDetailedAnswers = $state(false);
</script>

<svelte:head>
	<title>Hasil Quiz Kaderisasi I (Essai) - {student?.fullName || 'Peserta'}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
	<!-- Top Navigation -->
	<div class="mb-6 flex items-center justify-between">
		<Button href="/dashboard" variant="outline" size="sm">
			<ArrowLeft class="w-4 h-4 mr-1.5" />
			<span>Kembali ke Dashboard</span>
		</Button>

		<Button variant="ghost" size="sm" onclick={() => window.print()} class="print:hidden">
			<Printer class="w-4 h-4 mr-1.5" />
			<span>Cetak Bukti Hasil</span>
		</Button>
	</div>

	<!-- Main Score Result Card -->
	<Card class="overflow-hidden border-slate-200 shadow-xl mb-8">
		<!-- Header Banner -->
		<div class="p-6 sm:p-8 {isPassed ? 'bg-linear-to-r from-emerald-700 to-teal-800' : isGraded ? 'bg-linear-to-r from-slate-800 to-slate-900' : 'bg-linear-to-r from-teal-700 to-emerald-800'} text-white relative">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<Badge variant="emerald" size="sm">Laporan Evaluasi Quiz Essai</Badge>
						<span class="text-xs text-emerald-100 font-semibold">{quiz.title}</span>
					</div>
					<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">{student?.fullName}</h1>
					<p class="text-xs sm:text-sm text-emerald-100/90 mt-1">
						NIM: <span class="font-mono font-bold text-white">{student?.nim}</span> • Prodi: {student?.programStudi}
					</p>
				</div>

				<div class="shrink-0 text-center sm:text-right">
					<div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full {isPassed ? 'bg-white/20 text-white' : isGraded ? 'bg-amber-400/20 text-amber-200' : 'bg-white/20 text-white'} text-xs font-bold backdrop-blur-md">
						{#if isPassed}
							<CheckCircle2 class="w-4 h-4 text-emerald-300" />
							<span>Lulus Kaderisasi Tingkat I</span>
						{:else if isGraded}
							<Clock class="w-4 h-4 text-amber-300" />
							<span>Perlu Pembinaan Lanjutan</span>
						{:else}
							<CheckCircle2 class="w-4 h-4 text-emerald-300" />
							<span>Jawaban Telah Diserahkan</span>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Main Stats Grid -->
		<div class="p-6 sm:p-8 bg-white space-y-6">
			<!-- Big Score Display -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
				<!-- Score -->
				<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
					<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Akhir</p>
					<div class="my-2">
						{#if isGraded}
							<span class="text-5xl font-black {isPassed ? 'text-emerald-600' : 'text-slate-800'} tracking-tight">{score}</span>
							<span class="text-slate-400 font-bold text-sm">/100</span>
						{:else}
							<span class="text-2xl font-bold text-emerald-700">Dalam Evaluasi</span>
						{/if}
					</div>
					<Badge variant={isPassed ? 'emerald' : isGraded ? 'amber' : 'emerald'} size="sm" class="self-center">
						{isPassed ? 'Lulus KKM' : isGraded ? 'Belum Memenuhi' : 'Menunggu Koreksi'}
					</Badge>
				</div>

				<!-- Soal Terjawab -->
				<div class="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col justify-center">
					<div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
						<CheckCircle2 class="w-5 h-5" />
					</div>
					<p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Tipe Soal</p>
					<p class="text-2xl font-extrabold text-emerald-700 mt-1">30 Soal Essai</p>
					<p class="text-[11px] text-emerald-600 mt-0.5">Kaderisasi Tingkat I</p>
				</div>

				<!-- Durasi -->
				<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
					<div class="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-2">
						<Clock class="w-5 h-5" />
					</div>
					<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Waktu Pengerjaan</p>
					<p class="text-xl font-extrabold text-slate-800 mt-1">{durationText()}</p>
					<p class="text-[11px] text-slate-500 mt-0.5">
						Selesai: {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
					</p>
				</div>
			</div>

			<!-- Toggle Review Button -->
			{#if canReviewAnswers && answers.length > 0}
				<div class="pt-4 border-t border-slate-100 text-center">
					<Button
						variant="outline"
						size="md"
						onclick={() => showDetailedAnswers = !showDetailedAnswers}
					>
						<FileText class="w-4 h-4 mr-2 text-emerald-600" />
						<span>{showDetailedAnswers ? 'Sembunyikan Lembar Jawaban' : 'Lihat Detail Lembar Jawaban Essai (1–30)'}</span>
					</Button>
				</div>
			{:else}
				<div class="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
					Kunci pedoman jawaban dan pembahasan ditinjau oleh pengurus HIMA FST UT Bandung.
				</div>
			{/if}
		</div>
	</Card>

	<!-- Detailed Answers Section (Only when enabled) -->
	{#if canReviewAnswers && showDetailedAnswers && answers.length > 0}
		<div class="space-y-4 animate-in fade-in duration-300">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
					<FileText class="w-5 h-5 text-emerald-600" />
					<span>Lembar Jawaban Essai (1–30)</span>
				</h2>
				<span class="text-xs text-slate-500">Tersimpan di Database</span>
			</div>

			{#each answers as ans, idx}
				{@const q = ans.question}
				{@const studentText = ans.studentAnswer}
				{@const isAnswered = studentText && studentText.trim() !== ''}

				<Card class="border border-slate-200 bg-white">
					<div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-7 h-7 rounded-lg {isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'} flex items-center justify-center font-bold text-xs">
								{q?.questionNumber || idx + 1}
							</span>
							<Badge variant="emerald" size="sm">
								{q?.section || 'Materi'}
							</Badge>
						</div>

						<div class="flex items-center gap-1.5 text-xs font-bold {isAnswered ? 'text-emerald-700' : 'text-slate-400'}">
							{#if isAnswered}
								<Check class="w-4 h-4 stroke-[3]" />
								<span>DIJAWAB</span>
							{:else}
								<span>TIDAK DIJAWAB</span>
							{/if}
						</div>
					</div>

					<!-- Question text -->
					<p class="text-sm font-semibold text-slate-900 mb-3 whitespace-pre-line">
						{q?.questionText}
					</p>

					<!-- Student essay response -->
					<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-3">
						<p class="font-bold text-slate-600 mb-1 flex items-center gap-1.5">
							<PenLine class="w-3.5 h-3.5 text-emerald-600" />
							<span>Jawaban Essai Anda:</span>
						</p>
						<p class="whitespace-pre-line leading-relaxed {isAnswered ? 'text-slate-800' : 'italic text-slate-400'}">
							{studentText || '(Tidak ada jawaban ditulis)'}
						</p>
					</div>

					<!-- Official answer key guideline & Explanation -->
					{#if q?.correctAnswer}
						<div class="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-slate-700 mb-2">
							<strong class="text-emerald-800">Pedoman Jawaban:</strong> {q.correctAnswer}
						</div>
					{/if}

					{#if q?.explanation}
						<div class="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
							<strong class="text-emerald-800">Pembahasan:</strong> {q.explanation}
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	{/if}
</div>
