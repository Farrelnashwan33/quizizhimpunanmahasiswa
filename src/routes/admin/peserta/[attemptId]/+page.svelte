<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
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
		HelpCircle
	} from 'lucide-svelte';

	let { data } = $props();
	const attempt = $derived(data.attempt);
	const student = $derived(data.student);
	const quiz = $derived(data.quiz);
	const detailedQuestions = $derived(data.detailedQuestions || []);

	const isPassed = $derived((attempt.score ?? 0) >= 65);
</script>

<svelte:head>
	<title>Detail Jawaban: {student?.fullName} - Admin HIMA FST</title>
</svelte:head>

<div class="space-y-6 max-w-5xl mx-auto">
	<!-- Navigation & Actions -->
	<div class="flex items-center justify-between pb-4 border-b border-slate-800">
		<Button href="/admin/peserta" variant="outline" size="sm" class="bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800">
			<ArrowLeft class="w-4 h-4 mr-1.5" />
			<span>Kembali ke Daftar Peserta</span>
		</Button>

		<Button variant="outline" size="sm" onclick={() => window.print()} class="bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800">
			<Printer class="w-4 h-4 mr-1.5" />
			<span>Cetak Detail Jawaban</span>
		</Button>
	</div>

	<!-- Student Information & Score Overview Card -->
	<div class="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
			<div>
				<div class="flex items-center gap-2 mb-1.5">
					<Badge variant="emerald" size="sm">Hasil Evaluasi Mahasiswa</Badge>
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
			<div class="shrink-0 p-4 rounded-2xl bg-slate-850 border border-slate-750 text-center min-w-[140px]">
				<p class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nilai Akhir</p>
				<div class="my-1">
					<span class="text-4xl font-black {isPassed ? 'text-emerald-400' : 'text-rose-400'} font-mono">{attempt.score ?? 0}</span>
					<span class="text-xs text-slate-500">/100</span>
				</div>
				<span class="text-xs font-bold {isPassed ? 'text-emerald-400' : 'text-rose-400'}">
					{isPassed ? 'LULUS KADERISASI' : 'BELUM LULUS'}
				</span>
			</div>
		</div>

		<!-- Mini Stats Grid -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
			<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-750">
				<p class="text-slate-400 font-medium">Jawaban Benar</p>
				<p class="text-lg font-bold text-emerald-400 mt-1">{attempt.correctCount} Soal</p>
			</div>
			<div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-750">
				<p class="text-slate-400 font-medium">Jawaban Salah</p>
				<p class="text-lg font-bold text-rose-400 mt-1">{attempt.wrongCount} Soal</p>
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
					{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : 'Belum selesai'}
				</p>
			</div>
		</div>
	</div>

	<!-- 30 Questions Answer Sheet Breakdown -->
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-bold text-white flex items-center gap-2">
				<FileText class="w-5 h-5 text-emerald-400" />
				<span>Lembar Jawaban Soal Nomor 1–30</span>
			</h2>
			<span class="text-xs text-slate-400">Pilihan Mahasiswa vs Kunci Jawaban</span>
		</div>

		{#each detailedQuestions as item, idx}
			{@const q = item.question}
			{@const studentAns = item.studentAnswer}
			{@const isCorrect = item.isCorrect}
			{@const isAnswered = studentAns !== null}

			<div class="p-5 rounded-2xl border transition-colors {isCorrect ? 'bg-slate-900 border-emerald-900/60' : !isAnswered ? 'bg-slate-900 border-slate-800' : 'bg-slate-900 border-rose-900/60'}">
				<!-- Question Header -->
				<div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-800">
					<div class="flex items-center gap-2.5">
						<span class="w-7 h-7 rounded-lg {isCorrect ? 'bg-emerald-600 text-white' : !isAnswered ? 'bg-slate-700 text-slate-300' : 'bg-rose-600 text-white'} flex items-center justify-center font-bold text-xs">
							{q.questionNumber}
						</span>
						<span class="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
							{q.section}
						</span>
					</div>

					<!-- Right: Answer Status -->
					<div class="flex items-center gap-1.5 text-xs font-bold {isCorrect ? 'text-emerald-400' : !isAnswered ? 'text-slate-500' : 'text-rose-400'}">
						{#if isCorrect}
							<Check class="w-4 h-4 stroke-[3]" />
							<span>BENAR (+1)</span>
						{:else if !isAnswered}
							<HelpCircle class="w-4 h-4" />
							<span>TIDAK DIJAWAB (0)</span>
						{:else}
							<X class="w-4 h-4 stroke-[3]" />
							<span>SALAH (0)</span>
						{/if}
					</div>
				</div>

				<!-- Question Text -->
				<p class="text-sm font-semibold text-slate-100 mb-4 whitespace-pre-line leading-relaxed">
					{q.questionText}
				</p>

				<!-- Options Matrix (A, B, C, D) -->
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
					{#each [
						{ key: 'A', text: q.optionA },
						{ key: 'B', text: q.optionB },
						{ key: 'C', text: q.optionC },
						{ key: 'D', text: q.optionD }
					] as opt}
						{@const isStudentChoice = studentAns === opt.key}
						{@const isKey = q.correctAnswer === opt.key}

						<div class="p-3 rounded-xl border flex items-start gap-2.5 transition-all {isKey ? 'bg-emerald-950/60 border-emerald-600 text-white font-semibold shadow-xs' : isStudentChoice && !isCorrect ? 'bg-rose-950/60 border-rose-600 text-white font-semibold' : 'bg-slate-850 border-slate-750 text-slate-300'}">
							<span class="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 {isKey ? 'bg-emerald-600 text-white' : isStudentChoice ? 'bg-rose-600 text-white' : 'bg-slate-750 text-slate-400'}">
								{opt.key}
							</span>
							<span class="flex-1 leading-snug">{opt.text}</span>
							{#if isKey}
								<span class="text-[10px] font-bold text-emerald-400 shrink-0 bg-emerald-900/60 px-1.5 py-0.5 rounded">KUNCI</span>
							{:else if isStudentChoice}
								<span class="text-[10px] font-bold text-rose-400 shrink-0 bg-rose-900/60 px-1.5 py-0.5 rounded">JAWABAN MAHASISWA</span>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Explanation -->
				{#if q.explanation}
					<div class="p-3 bg-slate-850 rounded-xl border border-slate-750 text-xs text-slate-300">
						<strong class="text-emerald-400">Pembahasan:</strong> {q.explanation}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
