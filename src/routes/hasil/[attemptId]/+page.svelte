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
		PenLine,
		RotateCcw
	} from 'lucide-svelte';

	let { data } = $props();
	const attempt = $derived(data.attempt);
	const quiz = $derived(data.quiz);
	const student = $derived(data.student);
	const answers = $derived(data.answers || []);
	const canReviewAnswers = $derived(data.canReviewAnswers);

	const score = $derived(attempt.score);
	const isGraded = $derived(score !== null && score !== undefined);
	const isPassed = $derived(isGraded && typeof score === 'number' && score >= 70);

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
	<title>Hasil Evaluasi Quiz - {student?.fullName || 'Peserta'}</title>
</svelte:head>

<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
	<!-- Top Navigation -->
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
		<Button href="/dashboard" variant="outline" size="sm">
			<ArrowLeft class="w-4 h-4 mr-1.5" />
			<span>Kembali ke Dashboard</span>
		</Button>

		<div class="flex items-center gap-2">
			<Button
				href="/quiz?retry=true"
				variant={isPassed ? 'outline' : 'primary'}
				size="sm"
				class={!isPassed ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold' : ''}
			>
				<RotateCcw class="w-4 h-4 mr-1.5" />
				<span>{isPassed ? 'Kerjakan Ulang' : 'Ulangi Kuis (Remedial)'}</span>
			</Button>

			<Button variant="ghost" size="sm" onclick={() => window.print()} class="print:hidden">
				<Printer class="w-4 h-4 mr-1.5" />
				<span>Cetak Bukti Hasil</span>
			</Button>
		</div>
	</div>

	<!-- Remedial Notice Banner (If Score < 70) -->
	{#if isGraded && !isPassed}
		<div class="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-300 shadow-sm">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div class="flex items-start gap-3">
					<div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
						<RotateCcw class="w-5 h-5" />
					</div>
					<div>
						<div class="flex items-center gap-2 mb-1">
							<Badge variant="amber" size="sm">Kesempatan Remedial Terbuka</Badge>
							<span class="text-xs font-bold text-amber-900">Standar Minimal KKM: 70 Poin</span>
						</div>
						<h3 class="text-sm sm:text-base font-extrabold text-amber-950">
							Nilai Anda ({score ?? 0}/100) Belum Mencapai Batas Minimal KKM
						</h3>
						<p class="text-xs text-amber-800 mt-1 leading-relaxed">
							Jangan berkecil hati! Anda dapat langsung memulai pengerjaan ulang (remedial) sekarang. Riwayat pengerjaan sebelumnya tetap tersimpan aman di database admin sebagai arsip.
						</p>
					</div>
				</div>
				<div class="shrink-0 sm:self-center">
					<Button
						href="/quiz?retry=true"
						variant="primary"
						size="md"
						class="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
					>
						<RotateCcw class="w-4 h-4 mr-2" />
						<span>Mulai Remedial Sekarang</span>
					</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Main Score Result Card -->
	<Card class="overflow-hidden border-slate-200 shadow-xl mb-8">
		<!-- Header Banner -->
		<div class="p-6 sm:p-8 {isPassed ? 'bg-linear-to-r from-emerald-700 to-teal-800' : isGraded ? 'bg-linear-to-r from-slate-800 to-slate-900' : 'bg-linear-to-r from-teal-700 to-emerald-800'} text-white relative">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<div class="flex items-center gap-2 mb-2">
						<Badge variant="emerald" size="sm">Laporan Hasil Evaluasi Quiz</Badge>
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
			<!-- Big Score Display (Auto Evaluated) -->
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
				<!-- Score -->
				<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
					<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Akhir</p>
					<div class="my-2">
						<span class="text-5xl font-black {isPassed ? 'text-emerald-600' : 'text-slate-800'} tracking-tight">{score ?? 0}</span>
						<span class="text-slate-400 font-bold text-sm">/100</span>
					</div>
					<Badge variant={isPassed ? 'emerald' : 'amber'} size="sm" class="self-center">
						{isPassed ? 'Memenuhi Standar KKM (≥ 70)' : 'Belum Memenuhi KKM (< 70)'}
					</Badge>
				</div>

				<!-- Jawaban Sesuai -->
				<div class="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col justify-center">
					<div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
						<CheckCircle2 class="w-5 h-5" />
					</div>
					<p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Jawaban Sesuai</p>
					<p class="text-3xl font-extrabold text-emerald-700 mt-1">{attempt.correctCount ?? 0}</p>
					<p class="text-[11px] text-emerald-600 mt-0.5">dari 30 butir soal</p>
				</div>

				<!-- Perlu Evaluasi -->
				<div class="p-6 bg-rose-50/60 rounded-2xl border border-rose-200/80 flex flex-col justify-center">
					<div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-2">
						<XCircle class="w-5 h-5" />
					</div>
					<p class="text-xs font-bold text-rose-800 uppercase tracking-wider">Perlu Evaluasi</p>
					<p class="text-3xl font-extrabold text-rose-700 mt-1">{attempt.wrongCount ?? 0}</p>
					<p class="text-[11px] text-rose-600 mt-0.5">dari 30 butir soal</p>
				</div>
			</div>

			<!-- Toggle Review Button -->
			{#if canReviewAnswers && answers.length > 0}
				<div class="pt-4 border-t border-slate-100 text-center flex flex-wrap items-center justify-center gap-3">
					<Button
						variant="primary"
						size="md"
						onclick={() => showDetailedAnswers = !showDetailedAnswers}
					>
						<FileText class="w-4 h-4 mr-2" />
						<span>{showDetailedAnswers ? 'Sembunyikan Lembar Jawaban' : 'Lihat Hasil Evaluasi & Pembahasan Lengkap (1–30)'}</span>
					</Button>

					{#if !isPassed}
						<Button
							href="/quiz?retry=true"
							variant="outline"
							size="md"
							class="border-amber-400 text-amber-800 hover:bg-amber-50 font-bold"
						>
							<RotateCcw class="w-4 h-4 mr-2 text-amber-600" />
							<span>Ulangi Pengerjaan Quiz (Remedial)</span>
						</Button>
					{/if}
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
					<span>Lembar Evaluasi Soal Nomor 1–30</span>
				</h2>
				<span class="text-xs text-slate-500">Hasil Evaluasi Otomatis & Pembahasan</span>
			</div>

			{#each answers as ans, idx}
				{@const q = ans.question}
				{@const studentText = ans.studentAnswer}
				{@const isAnswered = studentText && studentText.trim() !== ''}
				{@const isCorrect = ans.isCorrect}

				<Card class="border {isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'}">
					<div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
						<div class="flex items-center gap-2">
							<span class="w-7 h-7 rounded-lg {isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} flex items-center justify-center font-bold text-xs">
								{q?.questionNumber || idx + 1}
							</span>
							<Badge variant={isCorrect ? 'emerald' : 'rose'} size="sm">
								{q?.section || 'Materi'}
							</Badge>
						</div>

						<div class="flex items-center gap-1.5 text-xs font-bold {isCorrect ? 'text-emerald-700' : 'text-rose-700'}">
							{#if isCorrect}
								<Check class="w-4 h-4 stroke-[3]" />
								<span>JAWABAN SESUAI (BENAR)</span>
							{:else if isAnswered}
								<X class="w-4 h-4 stroke-[3]" />
								<span>PERLU EVALUASI (SALAH)</span>
							{:else}
								<X class="w-4 h-4 stroke-[3]" />
								<span>TIDAK DIJAWAB</span>
							{/if}
						</div>
					</div>

					<!-- Question text -->
					<p class="text-sm font-semibold text-slate-900 mb-3 whitespace-pre-line">
						{q?.questionText}
					</p>

					<!-- Student Essay Answer -->
					<div class="p-3.5 rounded-xl border mb-2 {isCorrect ? 'bg-emerald-100/50 border-emerald-300 text-emerald-950' : isAnswered ? 'bg-amber-50/60 border-amber-300 text-amber-950' : 'bg-rose-50 border-rose-200 text-rose-900'}">
						<div class="flex items-center justify-between text-[11px] font-bold mb-1">
							<span class="{isCorrect ? 'text-emerald-800' : isAnswered ? 'text-amber-800' : 'text-rose-700'}">
								Jawaban Uraian Anda:
							</span>
							<span class="text-[10px] text-slate-500">
								{studentText ? `${studentText.trim().split(/\s+/).filter(Boolean).length} kata` : 'Kosong'}
							</span>
						</div>
						<p class="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
							{studentText || 'Tidak ada jawaban tertulis.'}
						</p>
					</div>

					<!-- Official answer key & Explanation -->
					{#if q?.correctAnswer}
						<div class="p-3.5 bg-emerald-900/10 rounded-xl border border-emerald-300/80 text-xs text-emerald-950 mb-2">
							<div class="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
								<Award class="w-3.5 h-3.5 text-emerald-700" />
								<span>Referensi Jawaban Resmi:</span>
							</div>
							<p class="text-xs sm:text-sm whitespace-pre-line leading-relaxed text-emerald-950 font-medium">
								{q.correctAnswer}
							</p>
						</div>
					{/if}

					{#if q?.explanation}
						<div class="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
							<strong class="text-emerald-800">Pembahasan & Rubrik:</strong> {q.explanation}
						</div>
					{/if}
				</Card>
			{/each}
		</div>
	{/if}
</div>
