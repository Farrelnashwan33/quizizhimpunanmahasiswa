<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { toasts } from '$lib/stores/toast';
	import {
		ArrowLeft,
		User,
		Hash,
		Mail,
		BookOpen,
		Clock,
		CheckCircle2,
		XCircle,
		Check,
		X,
		FileText,
		Printer,
		HelpCircle,
		PenLine,
		Save,
		Sparkles,
		Award,
		ShieldCheck
	} from 'lucide-svelte';

	let { data } = $props();
	const attempt = $derived(data.attempt);
	const student = $derived(data.student);
	const quiz = $derived(data.quiz);
	const detailedQuestions = $derived(data.detailedQuestions || []);

	// Grading State
	let manualScore = $state<number>(0);
	let feedbackText = $state<string>('');
	let isSavingGrade = $state(false);

	// Local grading per question: 1 = full (100/30 ~ 3.33), 0.5 = half, 0 = zero
	let itemScores = $state<Record<number, number>>({});

	$effect(() => {
		if (attempt?.score !== null && attempt?.score !== undefined) {
			manualScore = attempt.score;
		}
	});

	function setQuickScore(multiplier: number) {
		manualScore = Math.round(multiplier * 100);
	}

	function calculateFromQuestions() {
		const totalQ = detailedQuestions.length || 30;
		const weightPerQuestion = 100 / totalQ;
		let total = 0;
		for (let i = 1; i <= totalQ; i++) {
			const sc = itemScores[i] ?? (detailedQuestions[i - 1]?.isCorrect ? 1 : 0);
			total += sc * weightPerQuestion;
		}
		manualScore = Math.round(total * 10) / 10;
		toasts.info(`Skor dihitung otomatis: ${manualScore}/100`);
	}

	const isPassed = $derived(manualScore >= 65);
</script>

<svelte:head>
	<title>Penilaian Essai: {student?.fullName} - Admin HIMA FST</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto pb-12">
	<!-- Navigation & Actions -->
	<div class="flex items-center justify-between pb-4 border-b border-slate-800">
		<Button href="/admin/peserta" variant="outline" size="sm" class="bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800">
			<ArrowLeft class="w-4 h-4 mr-1.5" />
			<span>Kembali ke Daftar Peserta</span>
		</Button>

		<Button variant="outline" size="sm" onclick={() => window.print()} class="bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800">
			<Printer class="w-4 h-4 mr-1.5" />
			<span>Cetak Detail Lembar Jawaban</span>
		</Button>
	</div>

	<!-- Student Information & Score Overview Card -->
	<div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
			<div>
				<div class="flex items-center gap-2 mb-1.5">
					<Badge variant="emerald" size="sm">Lembar Penilaian Essai</Badge>
					<span class="text-xs text-slate-400 font-medium">{quiz.title}</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
					{student?.fullName}
				</h1>
				<div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
					<span>NIM: <strong class="text-emerald-400 font-mono text-sm">{student?.nim}</strong></span>
					<span>•</span>
					<span>Prodi: <strong class="text-slate-200">{student?.programStudi}</strong></span>
					<span>•</span>
					<span>Email: <span class="font-mono">{student?.email}</span></span>
					{#if student?.whatsapp}
						<span>•</span>
						<span>WhatsApp: <span class="font-mono text-emerald-400">{student.whatsapp}</span></span>
					{/if}
				</div>
			</div>

			<!-- Score Badge -->
			<div class="shrink-0 p-4 rounded-2xl bg-slate-850 border border-slate-750 text-center min-w-[150px]">
				<p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nilai Akhir</p>
				<div class="my-1">
					<span class="text-4xl font-black {isPassed ? 'text-emerald-400' : 'text-rose-400'} font-mono">{manualScore}</span>
					<span class="text-xs text-slate-500">/100</span>
				</div>
				<span class="text-xs font-bold {isPassed ? 'text-emerald-400' : 'text-rose-400'}">
					{isPassed ? 'LULUS KADERISASI' : 'BELUM MEMENUHI KKM'}
				</span>
			</div>
		</div>

		<!-- Mini Stats Grid -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
			<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-750">
				<p class="text-slate-400 font-medium">Total Soal</p>
				<p class="text-lg font-bold text-white mt-1">30 Soal Essai</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-750">
				<p class="text-slate-400 font-medium">Status Pengiriman</p>
				<p class="text-sm font-bold text-emerald-400 mt-1">Telah Diserahkan</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-750">
				<p class="text-slate-400 font-medium">Waktu Mulai</p>
				<p class="text-xs font-semibold text-slate-200 mt-1">
					{new Date(attempt.startedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
				</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-750">
				<p class="text-slate-400 font-medium">Waktu Selesai</p>
				<p class="text-xs font-semibold text-slate-200 mt-1">
					{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Selesai'}
				</p>
			</div>
		</div>
	</div>

	<!-- Admin Grading Form Card -->
	<div class="p-6 rounded-3xl bg-slate-900 border border-emerald-900/50 shadow-xl space-y-4">
		<div class="flex items-center justify-between pb-3 border-b border-slate-800">
			<div class="flex items-center gap-2">
				<Award class="w-5 h-5 text-emerald-400" />
				<h2 class="text-base font-bold text-white">Panel Penilaian Manual Essai Admin</h2>
			</div>
			<Badge variant="emerald" size="sm">KKM: 65</Badge>
		</div>

		<form
			action="?/saveGrade"
			method="POST"
			use:enhance={() => {
				isSavingGrade = true;
				return async ({ result, update }) => {
					isSavingGrade = false;
					if (result.type === 'success') {
						toasts.success('Penilaian essai berhasil disimpan ke database!');
					} else {
						toasts.error('Gagal menyimpan penilaian.');
					}
					await update();
				};
			}}
			class="space-y-4"
		>
			<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<div class="space-y-1.5">
					<label for="score-input" class="block text-xs font-bold text-slate-200">
						Input Skor Akhir (0–100):
					</label>
					<input
						id="score-input"
						type="number"
						name="score"
						min="0"
						max="100"
						step="0.5"
						required
						bind:value={manualScore}
						class="w-full p-3 bg-slate-850 border-2 border-emerald-600 focus:border-emerald-400 rounded-xl text-lg font-black font-mono text-emerald-400 outline-none transition-colors"
					/>
				</div>

				<div class="sm:col-span-2 space-y-1.5">
					<label for="feedback-input" class="block text-xs font-bold text-slate-200">
						Catatan Evaluasi / Feedback Pengurus (Opsional):
					</label>
					<input
						id="feedback-input"
						type="text"
						name="feedback"
						bind:value={feedbackText}
						placeholder="Contoh: Pemahaman konsep Tridharma dan Etika Organisasi sangat mendalam."
						class="w-full p-3 bg-slate-850 border border-slate-700 focus:border-emerald-500 rounded-xl text-xs text-slate-200 outline-none transition-colors"
					/>
				</div>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3 pt-2">
				<div class="flex items-center gap-1.5 text-xs text-slate-400">
					<span>Template Skor Cepat:</span>
					<button type="button" onclick={() => setQuickScore(1)} class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold">100</button>
					<button type="button" onclick={() => setQuickScore(0.85)} class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold">85</button>
					<button type="button" onclick={() => setQuickScore(0.75)} class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold">75</button>
					<button type="button" onclick={() => setQuickScore(0.65)} class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold">65 (Pass)</button>
					<button type="button" onclick={() => setQuickScore(0.5)} class="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono font-bold">50</button>
				</div>

				<Button type="submit" variant="primary" size="md" loading={isSavingGrade} class="shadow-lg shadow-emerald-600/20 font-bold">
					<Save class="w-4 h-4 mr-2" />
					<span>Simpan Penilaian Essai</span>
				</Button>
			</div>
		</form>
	</div>

	<!-- 30 Questions Essay Answer Sheet Breakdown -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-white flex items-center gap-2">
				<FileText class="w-5 h-5 text-emerald-400" />
				<span>Lembar Perbandingan Jawaban Mahasiswa vs Pedoman Resmi (1–30)</span>
			</h2>
			<span class="text-xs text-slate-400">30 Butir Soal Essai</span>
		</div>

		{#each detailedQuestions as item, idx}
			{@const q = item.question}
			{@const studentAns = item.studentAnswer}
			{@const isAnswered = studentAns && studentAns.trim() !== ''}

			<div class="p-6 rounded-2xl border bg-slate-900 border-slate-800 space-y-4 shadow-md">
				<!-- Question Header -->
				<div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
					<div class="flex items-center gap-2.5">
						<span class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
							{q.questionNumber}
						</span>
						<span class="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
							{q.section}
						</span>
					</div>

					<div class="flex items-center gap-1.5 text-xs font-bold {isAnswered ? 'text-emerald-400' : 'text-slate-500'}">
						{#if isAnswered}
							<Check class="w-4 h-4 stroke-[3]" />
							<span>DIJAWAB ({studentAns.length} Karakter)</span>
						{:else}
							<X class="w-4 h-4 stroke-[3]" />
							<span>TIDAK DIJAWAB</span>
						{/if}
					</div>
				</div>

				<!-- Question Text -->
				<div>
					<p class="text-xs uppercase font-bold text-slate-400 mb-1">Pertanyaan #{q.questionNumber}:</p>
					<p class="text-sm font-semibold text-slate-100 whitespace-pre-line leading-relaxed">
						{q.questionText}
					</p>
				</div>

				<!-- Side-by-side: Student Essay Answer vs Official Guideline -->
				<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
					<!-- Student Answer Box -->
					<div class="p-4 rounded-xl bg-slate-850 border {isAnswered ? 'border-emerald-800/60' : 'border-rose-900/40'} space-y-2">
						<div class="flex items-center justify-between text-slate-400 font-bold">
							<span class="flex items-center gap-1.5 text-white">
								<PenLine class="w-3.5 h-3.5 text-emerald-400" />
								<span>Jawaban Mahasiswa:</span>
							</span>
							{#if isAnswered}
								<span class="text-emerald-400 text-[11px]">✓ Terisi</span>
							{:else}
								<span class="text-rose-400 text-[11px]">Kosong</span>
							{/if}
						</div>
						<p class="whitespace-pre-line leading-relaxed text-sm {isAnswered ? 'text-slate-100' : 'italic text-slate-500'}">
							{studentAns || '(Mahasiswa tidak menuliskan jawaban)'}
						</p>
					</div>

					<!-- Official Key / Guideline Box -->
					<div class="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/60 space-y-2">
						<div class="flex items-center justify-between text-emerald-300 font-bold">
							<span class="flex items-center gap-1.5">
								<ShieldCheck class="w-3.5 h-3.5 text-emerald-400" />
								<span>Pedoman Jawaban Resmi Essai:</span>
							</span>
							<span class="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">Master Key</span>
						</div>
						<p class="whitespace-pre-line leading-relaxed text-sm text-emerald-200 font-medium">
							{q.correctAnswer}
						</p>
					</div>
				</div>

				<!-- Explanation -->
				{#if q.explanation}
					<div class="p-3 bg-slate-850/80 rounded-xl border border-slate-800 text-xs text-slate-300">
						<strong class="text-emerald-400">Pembahasan:</strong> {q.explanation}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
