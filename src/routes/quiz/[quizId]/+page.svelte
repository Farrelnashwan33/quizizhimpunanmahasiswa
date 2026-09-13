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
		ShieldCheck,
		PenLine,
		Save
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

	let saveTimeout: any = null;

	$effect(() => {
		if (data.savedAnswers) {
			answers = { ...data.savedAnswers };
		}
	});

	const currentQuestion = $derived(questions[currentIndex]);
	const totalQuestions = $derived(questions.length);

	// Count answered questions (non-empty strings)
	const answeredCount = $derived(
		Object.values(answers).filter((a) => a && typeof a === 'string' && a.trim().length > 0).length
	);
	const isAllAnswered = $derived(answeredCount === totalQuestions);

	// Handle essay answer text input with autosave
	function handleAnswerInput(text: string) {
		if (!currentQuestion || isSubmitting) return;

		const qId = currentQuestion.id;
		answers[qId] = text;
		savingStatus = 'saving';

		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			try {
				const res = await fetch('/api/quiz/save-answer', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						attemptId: attempt.id,
						questionId: qId,
						selectedAnswer: text
					})
				});

				if (res.ok) {
					savingStatus = 'saved';
				} else {
					savingStatus = 'error';
				}
			} catch (err) {
				savingStatus = 'error';
			}
		}, 600);
	}

	function goToQuestion(idx: number) {
		if (idx >= 0 && idx < totalQuestions) {
			// Trigger immediate flush of current answer if pending
			if (currentQuestion && attempt && answers[currentQuestion.id]) {
				fetch('/api/quiz/save-answer', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						attemptId: attempt.id,
						questionId: currentQuestion.id,
						selectedAnswer: answers[currentQuestion.id]
					})
				}).catch(() => {});
			}

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
				toasts.success('Quiz essai berhasil dikirim!');
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
	<title>Mengerjakan Soal Essai ({currentIndex + 1}/{totalQuestions}) - HIMA FST UT Bandung</title>
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
							Quiz Kaderisasi Tingkat I (Essai)
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
					{@const currentAnswer = answers[currentQuestion.id] || ''}

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

							<div class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
								<PenLine class="w-3.5 h-3.5 text-emerald-600" />
								<span>Soal Essai</span>
							</div>
						</div>

						<!-- Question Text -->
						<div class="mb-6">
							<h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
								Soal {currentQuestion.questionNumber} — {currentQuestion.section}
							</h2>
							<p class="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
								{currentQuestion.questionText}
							</p>
						</div>

						<!-- Essay Textarea Input -->
						<div class="space-y-2">
							<div class="flex items-center justify-between text-xs">
								<label for="essay-auth-answer" class="font-bold text-slate-700 flex items-center gap-1.5">
									<PenLine class="w-3.5 h-3.5 text-emerald-600" />
									<span>Jawaban Essai Anda:</span>
								</label>
								<span class="text-slate-400 font-mono text-[11px]">
									{currentAnswer.trim().length} Karakter
								</span>
							</div>

							<div class="relative">
								<textarea
									id="essay-auth-answer"
									rows="7"
									value={currentAnswer}
									oninput={(e) => handleAnswerInput((e.target as HTMLTextAreaElement).value)}
									placeholder="Tuliskan jawaban essai Anda secara jelas, terstruktur, dan lengkap di sini..."
									class="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-800 text-sm leading-relaxed transition-all placeholder:text-slate-400 bg-white resize-y min-h-[160px]"
								></textarea>
							</div>

							<div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
								<span class="flex items-center gap-1 text-emerald-700">
									<Save class="w-3 h-3 text-emerald-600" />
									Autosave aktif: jawaban tersimpan otomatis saat Anda mengetik.
								</span>
								<span class="{currentAnswer.trim() ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
									{currentAnswer.trim() ? '✓ Terisi' : 'Belum diisi'}
								</span>
							</div>
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

			<!-- Right: Navigator 30 Soal (1 Col) -->
			<div class="lg:col-span-1 space-y-4">
				<Card class="sticky top-24 p-5">
					<div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
						<h3 class="text-sm font-bold text-slate-900">Daftar Soal</h3>
						<span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
							{answeredCount}/{totalQuestions}
						</span>
					</div>

					<div class="grid grid-cols-5 gap-2 max-h-[380px] overflow-y-auto pr-1">
						{#each questions as q, idx}
							{@const ans = answers[q.id]}
							{@const isAns = ans && typeof ans === 'string' && ans.trim().length > 0}
							{@const isCurr = idx === currentIndex}
							<button
								type="button"
								class="h-9 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center cursor-pointer {isCurr ? 'ring-2 ring-emerald-600 ring-offset-2 scale-105 ' + (isAns ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white') : isAns ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'}"
								onclick={() => goToQuestion(idx)}
							>
								{idx + 1}
							</button>
						{/each}
					</div>

					<div class="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-medium text-slate-600">
						<div class="flex items-center gap-1.5">
							<div class="w-3.5 h-3.5 rounded-md bg-emerald-600 shrink-0"></div>
							<span>Terjawab ({answeredCount})</span>
						</div>
						<div class="flex items-center gap-1.5">
							<div class="w-3.5 h-3.5 rounded-md bg-slate-100 border border-slate-300 shrink-0"></div>
							<span>Belum ({totalQuestions - answeredCount})</span>
						</div>
					</div>

					<div class="mt-5 pt-3">
						<Button
							variant="secondary"
							size="md"
							fullWidth
							onclick={() => confirmSubmitOpen = true}
							loading={isSubmitting}
						>
							<Send class="w-4 h-4 mr-2 text-emerald-400" />
							<span>Kirim Jawaban</span>
						</Button>
					</div>
				</Card>
			</div>
		</div>
	</main>
</div>

<!-- Review Modal -->
<Modal bind:open={reviewModalOpen} title="Review Jawaban (30 Butir Soal Essai)" maxWidth="xl">
	<div class="space-y-4">
		<p class="text-xs text-slate-600">
			Pastikan seluruh 30 soal essai telah Anda jawab dengan baik sebelum melakukan pengiriman final.
		</p>

		<div class="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold">
			<span class="text-emerald-700">Terjawab: {answeredCount} Soal</span>
			<span class="text-rose-600">Belum Terjawab: {totalQuestions - answeredCount} Soal</span>
		</div>

		<div class="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-1">
			{#each questions as q, idx}
				{@const ans = answers[q.id]}
				{@const isAns = ans && typeof ans === 'string' && ans.trim().length > 0}
				<button
					type="button"
					class="p-2 rounded-xl text-center border transition-all cursor-pointer {isAns ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'}"
					onclick={() => goToQuestion(idx)}
				>
					<span class="block text-xs font-bold">{idx + 1}</span>
					<span class="block text-[10px] font-mono mt-0.5 {isAns ? 'font-bold text-emerald-700' : 'text-rose-500'}">
						{isAns ? 'Isi' : '-'}
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
		? "Seluruh 30 soal essai telah Anda jawab. Apakah Anda yakin ingin mengirim kuis sekarang?"
		: `Perhatian: Anda baru menjawab ${answeredCount} dari 30 butir soal (${totalQuestions - answeredCount} belum dijawab). Apakah Anda yakin ingin mengirim quiz sekarang?`}
	confirmText="Ya, Kirim Quiz"
	cancelText="Periksa Lagi"
	variant={isAllAnswered ? 'primary' : 'danger'}
	loading={isSubmitting}
	onconfirm={handleFinalSubmit}
/>
