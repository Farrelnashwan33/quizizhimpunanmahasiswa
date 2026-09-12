<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { toasts } from '$lib/stores/toast';
	import {
		GraduationCap,
		ArrowLeft,
		ArrowRight,
		CheckCircle2,
		Clock,
		Send,
		ListCheck,
		AlertCircle,
		Check,
		HelpCircle,
		ShieldCheck
	} from 'lucide-svelte';

	let { data } = $props();
	const quiz = $derived(data.quiz);
	const attempt = $derived(data.attempt);
	const questions = $derived(data.questions);

	// State
	let currentIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let savingStatus = $state<'saved' | 'saving' | 'error'>('saved');
	let reviewModalOpen = $state(false);
	let confirmSubmitOpen = $state(false);
	let isSubmitting = $state(false);

	$effect(() => {
		if (data.savedAnswers) {
			answers = { ...data.savedAnswers };
		}
	});

	const currentQuestion = $derived(questions[currentIndex]);
	const totalQuestions = $derived(questions.length);

	// Count answered questions
	const answeredCount = $derived(
		Object.values(answers).filter((a) => a && a.trim() !== '').length
	);
	const isAllAnswered = $derived(answeredCount === totalQuestions);

	// Select answer for current question
	async function selectOption(optionKey: string) {
		if (!currentQuestion || isSubmitting) return;

		const qId = currentQuestion.id;
		answers[qId] = optionKey;
		savingStatus = 'saving';

		try {
			const res = await fetch('/api/quiz/save-answer', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					attemptId: attempt.id,
					questionId: qId,
					selectedAnswer: optionKey
				})
			});

			if (res.ok) {
				savingStatus = 'saved';
			} else {
				savingStatus = 'error';
				toasts.error('Gagal menyimpan jawaban otomatis. Periksa koneksi internet Anda.');
			}
		} catch (err) {
			savingStatus = 'error';
			console.error('Error saving answer:', err);
		}
	}

	function goToQuestion(idx: number) {
		if (idx >= 0 && idx < totalQuestions) {
			currentIndex = idx;
			reviewModalOpen = false;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}

	function nextQuestion() {
		if (currentIndex < totalQuestions - 1) {
			goToQuestion(currentIndex + 1);
		} else {
			reviewModalOpen = true;
		}
	}

	function prevQuestion() {
		if (currentIndex > 0) {
			goToQuestion(currentIndex - 1);
		}
	}

	// Submit entire quiz
	async function handleFinalSubmit() {
		isSubmitting = true;
		confirmSubmitOpen = false;

		try {
			const res = await fetch('/api/quiz/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					attemptId: attempt.id,
					finalAnswers: answers
				})
			});

			const result = await res.json();

			if (result.success) {
				toasts.success('Quiz berhasil dikirim!');
				goto(`/hasil/${attempt.id}`);
			} else {
				isSubmitting = false;
				toasts.error(result.error || 'Gagal mengirim quiz. Silakan coba kembali.');
			}
		} catch (err) {
			isSubmitting = false;
			console.error('Submit error:', err);
			toasts.error('Terjadi kesalahan jaringan saat mengirim quiz.');
		}
	}
</script>

<svelte:head>
	<title>Mengerjakan Quiz ({currentIndex + 1}/{totalQuestions}) - HIMA FST UT Bandung</title>
</svelte:head>

<div class="min-h-screen bg-slate-50/90 flex flex-col">
	<!-- Sticky Clean Quiz Header -->
	<header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
		<div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
			<!-- Quiz Identity -->
			<div class="flex items-center gap-3">
				<a href="/dashboard" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors" title="Kembali ke Dashboard">
					<ArrowLeft class="w-4 h-4" />
				</a>
				<div>
					<div class="flex items-center gap-2">
						<span class="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
							Quiz Kaderisasi Tingkat I
						</span>
						<Badge variant="emerald" size="sm" class="hidden sm:inline-flex">HIMA FST</Badge>
					</div>
					<div class="flex items-center gap-2 text-xs text-slate-500">
						<span>Soal {currentIndex + 1} dari {totalQuestions}</span>
						<span>•</span>
						<span class="text-emerald-700 font-semibold">{answeredCount} Terjawab</span>
					</div>
				</div>
			</div>

			<!-- Autosave Status & Action Buttons -->
			<div class="flex items-center gap-2 sm:gap-3">
				<!-- Saving status badge -->
				<div class="hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg {savingStatus === 'saved' ? 'text-emerald-700 bg-emerald-50' : savingStatus === 'saving' ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50'}">
					{#if savingStatus === 'saved'}
						<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
						<span>Jawaban Tersimpan</span>
					{:else if savingStatus === 'saving'}
						<div class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
						<span>Menyimpan...</span>
					{:else}
						<AlertCircle class="w-3.5 h-3.5 text-rose-500" />
						<span>Gagal Menyimpan</span>
					{/if}
				</div>

				<!-- Review Modal Button -->
				<Button variant="outline" size="sm" onclick={() => reviewModalOpen = true}>
					<ListCheck class="w-4 h-4 sm:mr-1.5" />
					<span class="hidden sm:inline">Review Jawaban</span>
				</Button>

				<!-- Submit Button -->
				<Button variant="primary" size="sm" onclick={() => confirmSubmitOpen = true} loading={isSubmitting}>
					<Send class="w-3.5 h-3.5 mr-1.5" />
					<span>Kirim Quiz</span>
				</Button>
			</div>
		</div>

		<!-- Progress Bar Header Line -->
		<div class="max-w-7xl mx-auto mt-2">
			<ProgressBar value={answeredCount} max={totalQuestions} color="emerald" size="sm" />
		</div>
	</header>

	<!-- Main Quiz Workspace Container -->
	<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
			<!-- Center / Left: Current Question Area (3 Cols) -->
			<div class="lg:col-span-3 space-y-6">
				{#if currentQuestion}
					{@const currentAnswer = answers[currentQuestion.id]}

					<Card glass padding="lg" class="shadow-md border-slate-200">
						<!-- Category / Section Header -->
						<div class="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
							<div class="flex items-center gap-2">
								<span class="w-8 h-8 rounded-xl emerald-gradient text-white flex items-center justify-center font-bold text-sm shadow-xs">
									{currentQuestion.questionNumber}
								</span>
								<Badge variant="emerald" size="md">
									{currentQuestion.section}
								</Badge>
							</div>

							<span class="text-xs font-medium text-slate-400">
								Bobot: 1 Poin • Pilihan Ganda
							</span>
						</div>

						<!-- Question Text -->
						<div class="mb-8">
							<p class="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
								{currentQuestion.questionText}
							</p>
						</div>

						<!-- Option Choices: A, B, C, D -->
						<div class="space-y-3">
							{#each [
								{ key: 'A', text: currentQuestion.optionA },
								{ key: 'B', text: currentQuestion.optionB },
								{ key: 'C', text: currentQuestion.optionC },
								{ key: 'D', text: currentQuestion.optionD }
							] as opt}
								{@const isSelected = currentAnswer === opt.key}
								<button
									type="button"
									class="w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 group cursor-pointer {isSelected ? 'bg-emerald-50/80 border-emerald-500 shadow-xs shadow-emerald-500/10' : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'}"
									onclick={() => selectOption(opt.key)}
								>
									<!-- Letter Badge / Radio indicator -->
									<div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all {isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'}">
										{#if isSelected}
											<Check class="w-4 h-4 stroke-[3]" />
										{:else}
											{opt.key}
										{/if}
									</div>

									<!-- Option Text -->
									<div class="flex-1 text-sm leading-snug {isSelected ? 'font-semibold text-emerald-950' : 'text-slate-800'}">
										{opt.text}
									</div>
								</button>
							{/each}
						</div>

						<!-- Bottom Navigation Actions -->
						<div class="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
							<Button
								variant="outline"
								size="md"
								disabled={currentIndex === 0}
								onclick={prevQuestion}
							>
								<ArrowLeft class="w-4 h-4 mr-1.5" />
								<span>Sebelumnya</span>
							</Button>

							<div class="text-xs font-semibold text-slate-500 hidden sm:block">
								Nomor {currentIndex + 1} dari {totalQuestions}
							</div>

							{#if currentIndex === totalQuestions - 1}
								<Button
									variant="primary"
									size="md"
									onclick={() => reviewModalOpen = true}
								>
									<span>Review & Selesai</span>
									<ListCheck class="w-4 h-4 ml-1.5" />
								</Button>
							{:else}
								<Button
									variant="primary"
									size="md"
									onclick={nextQuestion}
								>
									<span>Berikutnya</span>
									<ArrowRight class="w-4 h-4 ml-1.5" />
								</Button>
							{/if}
						</div>
					</Card>
				{/if}
			</div>

			<!-- Right: Quick Question Navigator (1 Col) -->
			<div class="lg:col-span-1 space-y-4">
				<Card class="sticky top-24 p-5">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
						<h3 class="text-sm font-bold text-slate-900">Daftar Nomor Soal</h3>
						<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
							{answeredCount}/{totalQuestions}
						</span>
					</div>

					<!-- 30 Buttons Grid -->
					<div class="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
						{#each questions as q, idx}
							{@const isAns = !!answers[q.id]}
							{@const isCurr = idx === currentIndex}
							<button
								type="button"
								class="h-9 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer {isCurr ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105 ' + (isAns ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white') : isAns ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}"
								onclick={() => goToQuestion(idx)}
								title="Soal nomor {idx + 1}"
							>
								{idx + 1}
							</button>
						{/each}
					</div>

					<!-- Legend -->
					<div class="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
						<div class="flex items-center gap-2">
							<div class="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0"></div>
							<span>Sudah Dijawab ({answeredCount})</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 shrink-0"></div>
							<span>Belum ({totalQuestions - answeredCount})</span>
						</div>
					</div>

					<!-- Submit CTA in sidebar -->
					<div class="mt-5 pt-3">
						<Button
							variant="secondary"
							size="md"
							fullWidth
							onclick={() => confirmSubmitOpen = true}
							loading={isSubmitting}
						>
							<Send class="w-4 h-4 mr-2 text-emerald-400" />
							<span>Selesai & Kirim Quiz</span>
						</Button>
					</div>
				</Card>
			</div>
		</div>
	</main>
</div>

<!-- Review Jawaban Modal -->
<Modal bind:open={reviewModalOpen} title="Review Jawaban Soal (30 Butir)" maxWidth="xl">
	<div class="space-y-4">
		<p class="text-xs text-slate-600">
			Klik salah satu nomor di bawah ini untuk memeriksa kembali atau mengganti jawaban Anda sebelum mengirim quiz secara permanen.
		</p>

		<div class="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold">
			<span class="text-emerald-700">Terjawab: {answeredCount} Soal</span>
			<span class="text-rose-600">Belum Terjawab: {totalQuestions - answeredCount} Soal</span>
		</div>

		<div class="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-1">
			{#each questions as q, idx}
				{@const ans = answers[q.id]}
				<button
					type="button"
					class="p-2 rounded-xl text-center border transition-all cursor-pointer {ans ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'}"
					onclick={() => goToQuestion(idx)}
				>
					<span class="block text-xs font-bold">{idx + 1}</span>
					<span class="block text-[10px] font-mono mt-0.5 {ans ? 'font-black text-emerald-700' : 'text-rose-500'}">
						{ans || '-'}
					</span>
				</button>
			{/each}
		</div>
	</div>

	{#snippet footer()}
		<Button variant="outline" onclick={() => reviewModalOpen = false}>
			Lanjutkan Mengerjakan
		</Button>
		<Button
			variant="primary"
			onclick={() => {
				reviewModalOpen = false;
				confirmSubmitOpen = true;
			}}
		>
			<Send class="w-4 h-4 mr-1.5" />
			Kirim Sekarang
		</Button>
	{/snippet}
</Modal>

<!-- Confirmation Dialog Before Final Submit -->
<ConfirmDialog
	bind:open={confirmSubmitOpen}
	title="Kirim Jawaban Quiz Kaderisasi?"
	message={isAllAnswered
		? "Seluruh 30 soal telah Anda jawab. Setelah dikirim, jawaban tidak dapat diubah lagi dan nilai akan dihitung secara permanen."
		: `Perhatian: Anda baru menjawab ${answeredCount} dari 30 soal (${totalQuestions - answeredCount} soal belum dijawab). Apakah Anda yakin ingin mengirim quiz sekarang?`}
	confirmText="Ya, Kirim Quiz"
	cancelText="Periksa Lagi"
	variant={isAllAnswered ? 'primary' : 'danger'}
	loading={isSubmitting}
	onconfirm={handleFinalSubmit}
/>
