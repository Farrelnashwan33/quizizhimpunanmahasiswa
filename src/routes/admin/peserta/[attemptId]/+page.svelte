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
		ShieldCheck,
		KeyRound
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

	$effect(() => {
		if (attempt?.score !== null && attempt?.score !== undefined) {
			manualScore = attempt.score;
		}
	});

	const correctCount = $derived(detailedQuestions.filter((d: any) => d.isCorrect).length);
	const wrongCount = $derived(detailedQuestions.length - correctCount);
	const isPassed = $derived(manualScore >= 65);
</script>

<svelte:head>
	<title>Lembar Jawaban: {student?.fullName} - Admin HIMA FST</title>
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
					<Badge variant="emerald" size="sm">Lembar Jawaban Peserta</Badge>
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
			<div class="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
				<p class="text-slate-400 font-medium">Jawaban Sesuai</p>
				<p class="text-lg font-bold text-emerald-400 mt-1">{attempt.correctCount ?? correctCount} / 30 Butir</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
				<p class="text-slate-400 font-medium">Perlu Evaluasi</p>
				<p class="text-lg font-bold text-rose-400 mt-1">{attempt.wrongCount ?? wrongCount} / 30 Butir</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
				<p class="text-slate-400 font-medium">Waktu Mulai</p>
				<p class="text-xs font-semibold text-slate-200 mt-1">
					{new Date(attempt.startedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
				</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-850 border border-slate-750">
				<p class="text-slate-400 font-medium">Waktu Selesai</p>
				<p class="text-xs font-semibold text-slate-200 mt-1">
					{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Selesai'}
				</p>
			</div>
		</div>
	</div>

	<!-- Admin Score Adjustment Panel -->
	<div class="p-6 rounded-3xl bg-slate-900 border border-emerald-900/50 shadow-xl space-y-4">
		<div class="flex items-center justify-between pb-3 border-b border-slate-800">
			<div class="flex items-center gap-2">
				<Award class="w-5 h-5 text-emerald-400" />
				<h2 class="text-base font-bold text-white">Panel Penyesuaian Nilai Admin (Opsional)</h2>
			</div>
			<Badge variant="emerald" size="sm">Standar KKM: 65</Badge>
		</div>

		<form
			action="?/saveGrade"
			method="POST"
			use:enhance={() => {
				isSavingGrade = true;
				return async ({ result, update }) => {
					isSavingGrade = false;
					if (result.type === 'success') {
						toasts.success('Penilaian berhasil disimpan ke database!');
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
						step="1"
						required
						bind:value={manualScore}
						class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-mono text-base font-bold focus:border-emerald-500 outline-none"
					/>
				</div>

				<div class="sm:col-span-2 space-y-1.5">
					<label for="feedback-input" class="block text-xs font-bold text-slate-200">
						Catatan / Evaluasi Pembinaan (Opsional):
					</label>
					<input
						id="feedback-input"
						type="text"
						name="feedback"
						bind:value={feedbackText}
						placeholder="Contoh: Pemahaman materi baik, tingkatkan komitmen waktu..."
						class="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs focus:border-emerald-500 outline-none"
					/>
				</div>
			</div>

			<div class="flex items-center justify-end gap-3 pt-2">
				<Button type="submit" variant="primary" size="md" loading={isSavingGrade} class="font-bold">
					<Save class="w-4 h-4 mr-2" />
					<span>Simpan Penilaian ke Database</span>
				</Button>
			</div>
		</form>
	</div>

	<!-- 30 Questions Answer Sheet Breakdown -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-white flex items-center gap-2">
				<FileText class="w-5 h-5 text-emerald-400" />
				<span>Lembar Rincian Jawaban Peserta vs Kunci Resmi (1–30)</span>
			</h2>
			<span class="text-xs text-slate-400">30 Butir Soal Pilihan Ganda</span>
		</div>

		{#each detailedQuestions as item}
			{@const q = item.question || item}
			{@const studentAns = item.studentAnswer}
			{@const isAnswered = studentAns && studentAns.trim() !== ''}
			{@const isCorrect = item.isCorrect}

			<div class="p-6 rounded-2xl border bg-slate-900 border-slate-800 space-y-4 shadow-md">
				<!-- Question Header -->
				<div class="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
					<div class="flex items-center gap-2.5">
						<span class="w-7 h-7 rounded-lg {isCorrect ? 'bg-emerald-600' : 'bg-rose-600'} text-white flex items-center justify-center font-bold text-xs">
							{item.questionNumber}
						</span>
						<span class="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
							{item.section}
						</span>
					</div>

					<div class="flex items-center gap-1.5 text-xs font-bold {isCorrect ? 'text-emerald-400' : isAnswered ? 'text-rose-400' : 'text-slate-500'}">
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

				<!-- Question Text -->
				<div>
					<p class="text-xs uppercase font-bold text-slate-400 mb-1">Pertanyaan #{item.questionNumber}:</p>
					<p class="text-sm font-semibold text-slate-100 whitespace-pre-line leading-relaxed">
						{item.questionText}
					</p>
				</div>

				<!-- Options Breakdown -->
				{#if item.optionA || item.optionB || item.optionC || item.optionD}
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
						{#each [{ key: 'A', text: item.optionA }, { key: 'B', text: item.optionB }, { key: 'C', text: item.optionC }, { key: 'D', text: item.optionD }] as opt}
							{@const isStudentChoice = studentAns === opt.key}
							{@const isKey = item.correctAnswer === opt.key}
							<div class="p-3 rounded-xl border flex items-start gap-2.5 {isKey ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 font-bold' : isStudentChoice ? 'bg-rose-950/60 border-rose-700 text-rose-300 font-semibold' : 'bg-slate-850 border-slate-800 text-slate-400'}">
								<span class="w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center shrink-0 {isKey ? 'bg-emerald-600 text-white' : isStudentChoice ? 'bg-rose-600 text-white' : 'bg-slate-750 text-slate-300'}">
									{opt.key}
								</span>
								<div class="flex-1 leading-relaxed">
									<span>{opt.text}</span>
									{#if isStudentChoice && isKey}
										<span class="block text-[10px] text-emerald-400 font-bold mt-0.5">✓ Pilihan Mahasiswa (Tepat)</span>
									{:else if isStudentChoice}
										<span class="block text-[10px] text-rose-400 font-bold mt-0.5">✗ Pilihan Mahasiswa (Salah)</span>
									{:else if isKey}
										<span class="block text-[10px] text-emerald-400 font-bold mt-0.5">★ Kunci Jawaban Benar</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Explanation -->
				{#if item.explanation}
					<div class="p-3 bg-slate-850/80 rounded-xl border border-slate-800 text-xs text-slate-300">
						<strong class="text-emerald-400">Pembahasan:</strong> {item.explanation}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
