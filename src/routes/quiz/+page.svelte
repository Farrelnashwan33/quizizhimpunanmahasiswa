<script lang="ts">
	import { onMount } from 'svelte';
	import confetti from 'canvas-confetti';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ProgressBar from '$lib/components/ui/ProgressBar.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
	import { toasts } from '$lib/stores/toast';
	import logoHima from '$lib/assets/logo-hima.png';
	import {
		GraduationCap,
		User,
		Hash,
		BookOpen,
		Phone,
		ArrowRight,
		ArrowLeft,
		CheckCircle2,
		XCircle,
		Clock,
		Send,
		ListCheck,
		Check,
		X,
		FileText,
		Award,
		Printer,
		Sparkles,
		RotateCcw,
		ShieldAlert,
		AlertTriangle,
		PenLine,
		Save
	} from 'lucide-svelte';

	let { data } = $props();
	const questions = $derived(data.questions || []);
	const totalQuestions = $derived(questions.length);

	// Student Identity State
	let studentName = $state('');
	let nim = $state('');
	let programStudi = $state('');
	let whatsapp = $state('');
	let isIdentitySubmitted = $state(false);
	let isStarting = $state(false);
	let attemptId = $state('');

	// Quiz Working State
	let currentIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let reviewModalOpen = $state(false);
	let confirmSubmitOpen = $state(false);
	let isSubmitting = $state(false);
	let autoSaveStatus = $state<'saved' | 'saving' | 'idle'>('saved');

	// Quiz Result State
	let quizResult = $state<any>(null);
	let showDetailedReview = $state(false);

	const currentQuestion = $derived(questions[currentIndex]);
	const answeredCount = $derived(
		Object.values(answers).filter((a) => a && typeof a === 'string' && a.trim().length > 0).length
	);
	const isAllAnswered = $derived(answeredCount === totalQuestions);

	// Debounce timer for saving answers
	let saveTimeout: any = null;

	onMount(() => {
		try {
			const savedId = localStorage.getItem('quiz_fst_student');
			const savedAttemptId = localStorage.getItem('quiz_fst_attempt_id');
			if (savedAttemptId) {
				attemptId = savedAttemptId;
			}
			if (savedId) {
				const parsed = JSON.parse(savedId);
				studentName = parsed.studentName || '';
				nim = parsed.nim || '';
				programStudi = parsed.programStudi || '';
				whatsapp = parsed.whatsapp || '';
				if (studentName && nim) {
					isIdentitySubmitted = true;
				}
			}

			const savedAns = localStorage.getItem('quiz_fst_answers');
			if (savedAns) {
				answers = JSON.parse(savedAns);
			}
		} catch (e) {}

		// Anti-Cheat & Integrity Handlers
		const handleCopy = (e: ClipboardEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				e.preventDefault();
				toasts.warning('Penyalinan soal dinonaktifkan demi integritas ujian.');
			}
		};

		const handleContextMenu = (e: MouseEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				e.preventDefault();
				toasts.warning('Klik kanan dinonaktifkan selama kuis berlangsung.');
			}
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				if ((e.ctrlKey || e.metaKey) && ['u', 'p'].includes(e.key.toLowerCase())) {
					e.preventDefault();
					toasts.warning('Pintasan keyboard dinonaktifkan.');
				}
				if (e.key === 'F12') {
					e.preventDefault();
				}
			}
		};

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		document.addEventListener('copy', handleCopy);
		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('keydown', handleKeyDown);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			document.removeEventListener('copy', handleCopy);
			document.removeEventListener('contextmenu', handleContextMenu);
			document.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	async function startQuiz() {
		if (!studentName.trim() || !nim.trim() || !programStudi.trim()) {
			toasts.error('Nama Lengkap, NIM, dan Program Studi wajib diisi.');
			return;
		}

		isStarting = true;

		try {
			const res = await fetch('/api/quiz/start', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					studentName: studentName.trim(),
					nim: nim.trim(),
					programStudi: programStudi.trim(),
					whatsapp: whatsapp.trim()
				})
			});

			const data = await res.json();

			if (data.success) {
				attemptId = data.attemptId;
				try {
					localStorage.setItem(
						'quiz_fst_student',
						JSON.stringify({ studentName, nim, programStudi, whatsapp })
					);
					localStorage.setItem('quiz_fst_attempt_id', data.attemptId);
				} catch (e) {}

				isIdentitySubmitted = true;
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				toasts.error(data.error || 'Gagal memulai kuis di sistem database.');
			}
		} catch (err) {
			console.error('Error starting quiz:', err);
			isIdentitySubmitted = true;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} finally {
			isStarting = false;
		}
	}

	function handleAnswerInput(text: string) {
		if (!currentQuestion || isSubmitting || quizResult) return;
		answers[currentQuestion.id] = text;

		try {
			localStorage.setItem('quiz_fst_answers', JSON.stringify(answers));
		} catch (e) {}

		// Debounce auto-save to database
		autoSaveStatus = 'saving';
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			if (attemptId && currentQuestion.id) {
				try {
					await fetch('/api/quiz/save-answer', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							attemptId,
							questionId: currentQuestion.id,
							selectedAnswer: text
						})
					});
					autoSaveStatus = 'saved';
				} catch (err) {
					autoSaveStatus = 'saved';
				}
			} else {
				autoSaveStatus = 'saved';
			}
		}, 600);
	}

	function goToQuestion(idx: number) {
		if (idx >= 0 && idx < totalQuestions) {
			// Trigger immediate save of current answer before switching
			if (currentQuestion && attemptId && answers[currentQuestion.id]) {
				fetch('/api/quiz/save-answer', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						attemptId,
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

	async function handleSubmitQuiz() {
		isSubmitting = true;
		confirmSubmitOpen = false;

		try {
			const res = await fetch('/api/quiz/submit-direct', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					attemptId,
					studentName,
					nim,
					programStudi,
					whatsapp,
					answers
				})
			});

			const data = await res.json();

			if (data.success) {
				quizResult = data;
				try {
					localStorage.removeItem('quiz_fst_answers');
					localStorage.removeItem('quiz_fst_attempt_id');
				} catch (e) {}

				try {
					confetti({
						particleCount: 90,
						spread: 70,
						origin: { y: 0.6 }
					});
				} catch (e) {}

				toasts.success('Jawaban quiz essai berhasil dikirim!');
				window.scrollTo({ top: 0, behavior: 'smooth' });
			} else {
				toasts.error(data.error || 'Gagal mengirim quiz.');
			}
		} catch (err) {
			console.error('Submit error:', err);
			toasts.error('Terjadi kesalahan jaringan.');
		} finally {
			isSubmitting = false;
		}
	}

	function resetAndRetake() {
		answers = {};
		quizResult = null;
		currentIndex = 0;
		attemptId = '';
		showDetailedReview = false;
		try {
			localStorage.removeItem('quiz_fst_answers');
			localStorage.removeItem('quiz_fst_attempt_id');
		} catch (e) {}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Quiz Kaderisasi Tingkat I (Essai) - HIMA FST UT Bandung</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex flex-col">
	<!-- STATE 1: ISI IDENTITAS MAHASISWA -->
	{#if !isIdentitySubmitted && !quizResult}
		<div class="flex-1 flex items-center justify-center px-4 py-12 bg-linear-to-b from-emerald-50/50 via-slate-50 to-slate-100">
			<div class="max-w-lg w-full">
				<!-- Header -->
				<div class="text-center mb-8">
					<div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white p-2 border border-slate-200 shadow-xl shadow-emerald-600/10 mb-4 overflow-hidden">
						<img src={logoHima} alt="Logo HIMA FST UT" class="w-full h-full object-contain" />
					</div>
					<Badge variant="emerald" size="md" class="mb-3">Kaderisasi Tingkat I</Badge>
					<h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
						Quiz Kaderisasi HIMA FST UT Bandung
					</h1>
					<p class="text-xs sm:text-sm text-slate-600 mt-2">
						Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi (Sistem Soal Essai)
					</p>
				</div>

				<!-- Identity Form Card -->
				<Card glass padding="lg" class="shadow-xl border-slate-200">
					<form onsubmit={(e) => { e.preventDefault(); startQuiz(); }} class="space-y-4">
						<Input
							label="Nama Lengkap"
							id="studentName"
							name="studentName"
							required
							placeholder="Masukkan nama lengkap Anda"
							bind:value={studentName}
						>
							{#snippet iconLeft()}
								<User class="w-4 h-4" />
							{/snippet}
						</Input>

						<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<Input
								label="NIM (Nomor Induk Mahasiswa)"
								id="nim"
								name="nim"
								required
								placeholder="Contoh: 045123456"
								bind:value={nim}
							>
								{#snippet iconLeft()}
									<Hash class="w-4 h-4" />
								{/snippet}
							</Input>

							<Input
								label="Program Studi"
								id="programStudi"
								name="programStudi"
								required
								placeholder="Contoh: Sistem Informasi"
								bind:value={programStudi}
							>
								{#snippet iconLeft()}
									<BookOpen class="w-4 h-4" />
								{/snippet}
							</Input>
						</div>

						<Input
							label="Nomor WhatsApp"
							type="tel"
							id="whatsapp"
							name="whatsapp"
							placeholder="081234567890 (Opsional)"
							bind:value={whatsapp}
						>
							{#snippet iconLeft()}
								<Phone class="w-4 h-4" />
							{/snippet}
						</Input>

						<div class="pt-4">
							<Button type="submit" variant="primary" size="lg" fullWidth loading={isStarting} class="shadow-lg shadow-emerald-600/30 font-bold">
								<span>Mulai Mengerjakan (30 Soal Essai)</span>
								<ArrowRight class="w-5 h-5 ml-2" />
							</Button>
						</div>
					</form>

					<div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
						<span>30 Soal Essai</span>
						<span>•</span>
						<span>Autosave Aktif</span>
						<span>•</span>
						<span>HIMA FST UT Bandung</span>
					</div>
				</Card>
			</div>
		</div>

	<!-- STATE 2: MENGERJAKAN 30 SOAL ESSAI -->
	{:else if !quizResult}
		<!-- Sticky Quiz Header -->
		<header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 shadow-xs">
			<div class="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
				<!-- Student Info & Title -->
				<div class="flex items-center gap-2 sm:gap-3 min-w-0">
					<div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-white p-0.5 sm:p-1 flex items-center justify-center border border-slate-200 shadow-xs overflow-hidden shrink-0">
						<img src={logoHima} alt="Logo HIMA FST UT" class="w-full h-full object-contain" />
					</div>
					<div class="min-w-0">
						<div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
							<span class="font-bold text-xs sm:text-base text-slate-900 truncate max-w-[110px] sm:max-w-none">
								{studentName}
							</span>
							<Badge variant="emerald" size="sm" class="text-[10px] sm:text-xs">NIM: {nim}</Badge>
							<span class="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
								<BookOpen class="w-3 h-3 text-emerald-600" />
								Kaderisasi I
							</span>
						</div>
						<div class="text-[11px] sm:text-xs text-slate-500 truncate">
							Soal {currentIndex + 1} dari {totalQuestions} • {programStudi}
						</div>
					</div>
				</div>

				<!-- Autosave & Actions -->
				<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
					<div class="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
						{#if autoSaveStatus === 'saving'}
							<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
							<span class="text-amber-700">Menyimpan...</span>
						{:else}
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
							<span>Tersimpan</span>
						{/if}
					</div>

					<Button variant="outline" size="sm" class="px-2 sm:px-3 text-xs" onclick={() => reviewModalOpen = true}>
						<ListCheck class="w-4 h-4 sm:mr-1.5" />
						<span class="hidden sm:inline">Review ({answeredCount}/{totalQuestions})</span>
					</Button>

					<Button variant="primary" size="sm" class="px-2.5 sm:px-3.5 text-xs font-bold" onclick={() => confirmSubmitOpen = true} loading={isSubmitting}>
						<Send class="w-3.5 h-3.5 mr-1" />
						<span>Kirim Quiz</span>
					</Button>
				</div>
			</div>

			<!-- Progress bar line -->
			<div class="max-w-7xl mx-auto mt-2">
				<ProgressBar value={answeredCount} max={totalQuestions} color="emerald" size="sm" />
			</div>
		</header>

		<!-- Main Question Workspace -->
		<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
				<!-- Left/Center: Question Card (3 Cols) -->
				<div class="lg:col-span-3 space-y-6">
					{#if currentQuestion}
						{@const currentAnswer = answers[currentQuestion.id] || ''}

						<Card glass padding="lg" class="shadow-md border-slate-200">
							<!-- Header -->
							<div class="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
								<div class="flex items-center gap-2.5">
									<span class="w-8 h-8 rounded-xl emerald-gradient text-white flex items-center justify-center font-bold text-sm">
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
									<label for="essay-answer" class="font-bold text-slate-700 flex items-center gap-1.5">
										<PenLine class="w-3.5 h-3.5 text-emerald-600" />
										<span>Jawaban Essai Mahasiswa:</span>
									</label>
									<span class="text-slate-400 font-mono text-[11px]">
										{currentAnswer.trim().length} Karakter
									</span>
								</div>

								<div class="relative">
									<textarea
										id="essay-answer"
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
										Jawaban otomatis tersimpan saat Anda mengetik atau berpindah nomor.
									</span>
									<span class="{currentAnswer.trim() ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
										{currentAnswer.trim() ? '✓ Terisi' : 'Belum diisi'}
									</span>
								</div>
							</div>

							<!-- Navigation -->
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
										<span>Review Jawaban</span>
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

	<!-- STATE 3: SUBMISSION COMPLETED -->
	{:else}
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<!-- Header Buttons -->
			<div class="mb-6 flex items-center justify-between">
				<Button variant="outline" size="sm" onclick={resetAndRetake}>
					<RotateCcw class="w-4 h-4 mr-1.5" />
					<span>Kerjakan Ulang</span>
				</Button>

				<Button variant="outline" size="sm" onclick={() => window.print()}>
					<Printer class="w-4 h-4 mr-1.5" />
					<span>Cetak Bukti Pengerjaan</span>
				</Button>
			</div>

			<!-- Result Card -->
			<Card class="overflow-hidden border-slate-200 shadow-xl mb-8">
				<div class="p-6 sm:p-8 bg-linear-to-r from-emerald-700 to-teal-800 text-white">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<div class="flex items-center gap-2 mb-2">
								<Badge variant="emerald" size="sm">Laporan Submisi Quiz Essai</Badge>
								<span class="text-xs text-emerald-100 font-semibold">Kaderisasi Tingkat I</span>
							</div>
							<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">{quizResult.studentName}</h1>
							<p class="text-xs sm:text-sm text-emerald-100/90 mt-1">
								NIM: <span class="font-mono font-bold text-white">{quizResult.nim}</span> • Prodi: {quizResult.programStudi}
							</p>
						</div>

						<div class="shrink-0">
							<div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
								<CheckCircle2 class="w-4 h-4 text-emerald-300" />
								<span>JAWABAN BERHASIL DISERAHKAN</span>
							</div>
						</div>
					</div>
				</div>

				<div class="p-6 sm:p-8 bg-white space-y-6">
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
						<div class="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
								<CheckCircle2 class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Soal Terjawab</p>
							<p class="text-3xl font-extrabold text-emerald-700 mt-1">{quizResult.answeredCount || quizResult.correctCount}</p>
							<p class="text-[11px] text-emerald-600 mt-0.5">dari {quizResult.totalQuestions} butir essai</p>
						</div>

						<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center mx-auto mb-2">
								<Clock class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Evaluasi</p>
							<p class="text-sm font-bold text-slate-800 mt-1">Menunggu Penilaian</p>
							<p class="text-[11px] text-slate-500 mt-0.5">Oleh Admin Pengurus</p>
						</div>

						<div class="p-6 bg-teal-50/60 rounded-2xl border border-teal-200/80 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2">
								<FileText class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-teal-800 uppercase tracking-wider">Tipe Ujian</p>
							<p class="text-lg font-extrabold text-teal-800 mt-1">30 Soal Essai</p>
							<p class="text-[11px] text-teal-600 mt-0.5">HIMA FST UT Bandung</p>
						</div>
					</div>

					<div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
						<ShieldAlert class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
						<span>
							Jawaban Anda telah tercatat dengan aman di database. Tim Pengurus HIMA FST UT Bandung akan memeriksa jawaban essai Anda berdasarkan pedoman penilaian resmi.
						</span>
					</div>

					<div class="pt-2 text-center">
						<Button
							variant="primary"
							size="md"
							onclick={() => showDetailedReview = !showDetailedReview}
						>
							<FileText class="w-4 h-4 mr-2" />
							<span>{showDetailedReview ? 'Sembunyikan Lembar Jawaban' : 'Lihat Ringkasan Jawaban Essai yang Dikirim (1–30)'}</span>
						</Button>
					</div>
				</div>
			</Card>

			<!-- Detailed 30 Questions Review -->
			{#if showDetailedReview && quizResult.answersBreakdown}
				<div class="space-y-4 animate-in fade-in duration-300">
					<div class="flex items-center justify-between">
						<h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
							<FileText class="w-5 h-5 text-emerald-600" />
							<span>Lembar Jawaban Essai Nomor 1–30</span>
						</h2>
						<span class="text-xs text-slate-500">Tersimpan di Database</span>
					</div>

					{#each quizResult.answersBreakdown as item}
						{@const isAnswered = item.studentAnswer && item.studentAnswer.trim() !== ''}

						<Card class="border border-slate-200 bg-white">
							<div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
								<div class="flex items-center gap-2">
									<span class="w-7 h-7 rounded-lg {isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'} flex items-center justify-center font-bold text-xs">
										{item.questionNumber}
									</span>
									<Badge variant="emerald" size="sm">
										{item.section}
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

							<p class="text-sm font-semibold text-slate-900 mb-3 whitespace-pre-line">
								{item.questionText}
							</p>

							<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 mb-3">
								<p class="font-bold text-slate-600 mb-1 flex items-center gap-1.5">
									<PenLine class="w-3.5 h-3.5 text-emerald-600" />
									<span>Jawaban Anda:</span>
								</p>
								<p class="whitespace-pre-line leading-relaxed {isAnswered ? 'text-slate-800' : 'italic text-slate-400'}">
									{item.studentAnswer || '(Tidak ada jawaban ditulis)'}
								</p>
							</div>

							{#if item.explanation}
								<div class="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 text-xs text-slate-600">
									<strong class="text-emerald-800">Catatan/Pembahasan:</strong> {item.explanation}
								</div>
							{/if}
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Review Modal -->
<Modal bind:open={reviewModalOpen} title="Review Jawaban (30 Butir Soal Essai)" maxWidth="xl">
	<div class="space-y-4">
		<p class="text-xs text-slate-600">
			Periksa kelengkapan jawaban essai Anda untuk masing-masing butir soal sebelum mengirim kuis.
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
		? "Seluruh 30 soal essai telah Anda jawab. Apakah Anda yakin ingin mengirim quiz sekarang?"
		: `Perhatian: Anda baru menjawab ${answeredCount} dari 30 soal (${totalQuestions - answeredCount} belum dijawab). Apakah Anda yakin ingin mengirim quiz sekarang?`}
	confirmText="Ya, Kirim Quiz"
	cancelText="Periksa Lagi"
	variant={isAllAnswered ? 'primary' : 'danger'}
	loading={isSubmitting}
	onconfirm={() => handleSubmitQuiz()}
/>
