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

	// Anti-Cheat & Tab Integrity State
	const MAX_TAB_VIOLATIONS = 3;
	let tabViolationsCount = $state(0);
	let showTabWarningModal = $state(false);
	let isAutoSubmittedDueToViolations = $state(false);

	// Quiz Working State
	let currentIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let reviewModalOpen = $state(false);
	let confirmSubmitOpen = $state(false);
	let isSubmitting = $state(false);
	let autoSaveStatus = $state<'saved' | 'saving' | 'error' | 'idle'>('saved');

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

	onMount(async () => {
		let loadedAttemptId = '';
		let loadedNim = '';

		try {
			const savedResult = localStorage.getItem('quiz_fst_result');
			if (savedResult) {
				quizResult = JSON.parse(savedResult);
				isIdentitySubmitted = true;
			}

			const savedId = localStorage.getItem('quiz_fst_student');
			const savedAttemptId = localStorage.getItem('quiz_fst_attempt_id');
			if (savedAttemptId) {
				attemptId = savedAttemptId;
				loadedAttemptId = savedAttemptId;
			}
			if (savedId) {
				const parsed = JSON.parse(savedId);
				studentName = parsed.studentName || '';
				nim = parsed.nim || '';
				loadedNim = parsed.nim || '';
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

			const savedViolations = localStorage.getItem('quiz_fst_tab_violations');
			if (savedViolations) {
				tabViolationsCount = parseInt(savedViolations, 10) || 0;
			}
		} catch (e) {}

		// Fetch and restore saved essay answers from Supabase Database on load/refresh
		if (loadedAttemptId || loadedNim) {
			try {
				const res = await fetch(`/api/quiz/load-attempt?attemptId=${encodeURIComponent(loadedAttemptId)}&nim=${encodeURIComponent(loadedNim)}`);
				if (res.ok) {
					const loadData = await res.json();
					if (loadData.success) {
						if (loadData.attempt?.id) {
							attemptId = loadData.attempt.id;
							try { localStorage.setItem('quiz_fst_attempt_id', attemptId); } catch (e) {}
						}
						if (loadData.savedAnswers && Object.keys(loadData.savedAnswers).length > 0) {
							answers = { ...answers, ...loadData.savedAnswers };
							try {
								localStorage.setItem('quiz_fst_answers', JSON.stringify(answers));
							} catch (e) {}
						}
					}
				}
			} catch (loadErr) {
				console.warn('Notice: Background attempt recovery check:', loadErr);
			}
		}

		// Anti-Cheat & Integrity Handlers
		let lastViolationTime = 0;
		const recordTabViolation = () => {
			if (!isIdentitySubmitted || quizResult || isSubmitting) return;
			const now = Date.now();
			if (now - lastViolationTime < 1500) return;
			lastViolationTime = now;

			tabViolationsCount += 1;
			showTabWarningModal = true;

			try {
				localStorage.setItem('quiz_fst_tab_violations', String(tabViolationsCount));
			} catch (e) {}

			if (tabViolationsCount >= MAX_TAB_VIOLATIONS) {
				isAutoSubmittedDueToViolations = true;
				toasts.error('Batas toleransi perpindahan tab habis! Kuis otomatis dikirimkan.');
				setTimeout(() => {
					showTabWarningModal = false;
					handleSubmitQuiz();
				}, 1500);
			} else {
				toasts.error(`Peringatan: Terdeteksi meninggalkan tab kuis! (${tabViolationsCount}/${MAX_TAB_VIOLATIONS})`);
			}
		};

		const handleVisibilityChange = () => {
			if (document.hidden) {
				recordTabViolation();
			}
		};

		const handleWindowBlur = () => {
			recordTabViolation();
		};

		const handleCopy = (e: ClipboardEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				e.preventDefault();
				toasts.warning('Penyalinan soal dinonaktifkan demi integritas ujian.');
			}
		};

		const handlePaste = (e: ClipboardEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				e.preventDefault();
				toasts.warning('Fitur tempel (paste) dinonaktifkan demi integritas ujian.');
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
				if ((e.ctrlKey || e.metaKey) && ['u', 'p', 'c', 'v'].includes(e.key.toLowerCase())) {
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

		document.addEventListener('visibilitychange', handleVisibilityChange);
		window.addEventListener('blur', handleWindowBlur);
		document.addEventListener('copy', handleCopy);
		document.addEventListener('paste', handlePaste);
		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('keydown', handleKeyDown);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('blur', handleWindowBlur);
			document.removeEventListener('copy', handleCopy);
			document.removeEventListener('paste', handlePaste);
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

				if (data.savedAnswers && Object.keys(data.savedAnswers).length > 0) {
					answers = { ...answers, ...data.savedAnswers };
					try {
						localStorage.setItem('quiz_fst_answers', JSON.stringify(answers));
					} catch (e) {}
				}

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

	function handleAnswerChange(text: string) {
		if (!currentQuestion || isSubmitting || quizResult) return;
		answers[currentQuestion.id] = text;
		answers[`num_${currentQuestion.questionNumber}`] = text;
		answers[String(currentQuestion.questionNumber)] = text;

		try {
			localStorage.setItem('quiz_fst_answers', JSON.stringify(answers));
		} catch (e) {}

		// Debounce auto-save to Supabase database
		autoSaveStatus = 'saving';
		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			if (attemptId && currentQuestion.id) {
				try {
					const res = await fetch('/api/quiz/save-answer', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							attemptId,
							questionId: currentQuestion.id,
							selectedAnswer: text
						})
					});
					if (res.ok) {
						autoSaveStatus = 'saved';
					} else {
						autoSaveStatus = 'error';
					}
				} catch (err) {
					autoSaveStatus = 'saved';
				}
			} else {
				autoSaveStatus = 'saved';
			}
		}, 400);
	}

	const handleSelectOption = handleAnswerChange;

	function goToQuestion(idx: number) {
		if (idx >= 0 && idx < totalQuestions) {
			// Trigger immediate flush of current answer to Supabase before switching
			if (currentQuestion && attemptId && answers[currentQuestion.id] !== undefined) {
				fetch('/api/quiz/save-answer', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						attemptId,
						questionId: currentQuestion.id,
						selectedAnswer: answers[currentQuestion.id] || ''
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
					localStorage.setItem('quiz_fst_result', JSON.stringify(data));
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

				toasts.success('Jawaban quiz essay berhasil dikirim dan tersimpan di Supabase!');
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
</script>

<svelte:head>
	<title>Quiz Kaderisasi Tingkat I - HIMA FST UT Bandung</title>
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
						Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi (30 Soal Essay)
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
								<span>Mulai Mengerjakan (30 Soal Essay)</span>
								<ArrowRight class="w-5 h-5 ml-2" />
							</Button>
						</div>
					</form>

					<div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
						<span>30 Soal Essay</span>
						<span>•</span>
						<span>Autosave Supabase Aktif</span>
						<span>•</span>
						<span>HIMA FST UT Bandung</span>
					</div>
				</Card>
			</div>
		</div>

	<!-- STATE 2: MENGERJAKAN 30 SOAL ESSAY -->
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

				<!-- Autosave, Anti-Cheat & Actions -->
				<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
					<!-- Anti-Cheat Status Badge -->
					<div class="hidden md:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-medium {tabViolationsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' : 'bg-slate-50 text-slate-600 border-slate-200'}">
						<ShieldAlert class="w-3.5 h-3.5 {tabViolationsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}" />
						<span>{tabViolationsCount > 0 ? `Peringatan Tab: ${tabViolationsCount}/${MAX_TAB_VIOLATIONS}` : 'Anti-Buka Tab Aktif'}</span>
					</div>

					<div class="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium">
						{#if autoSaveStatus === 'saving'}
							<span class="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
							<span class="text-amber-700">Menyimpan...</span>
						{:else}
							<CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
							<span>Tersimpan di Supabase</span>
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
						{@const currentAnswer = answers[currentQuestion.id] || answers[`num_${currentQuestion.questionNumber}`] || ''}

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
									<span>Soal Essay</span>
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

							<!-- Essay Answer Textarea -->
							<div class="space-y-3">
								<div class="flex items-center justify-between">
									<label for="essay-input-area" class="text-xs font-bold text-slate-700 uppercase tracking-wider">
										Tuliskan Jawaban Uraian Anda:
									</label>
									<span class="text-xs font-medium text-slate-500">
										{(currentAnswer || '').trim().split(/\s+/).filter(Boolean).length} Kata • {(currentAnswer || '').length} Karakter
									</span>
								</div>

								<div class="relative">
									<textarea
										id="essay-input-area"
										rows="7"
										placeholder="Ketikkan uraian, penjelasan, dan analisis jawaban Anda di sini secara lengkap, jelas, dan beretika..."
										value={currentAnswer || ''}
										oninput={(e) => handleAnswerChange((e.target as HTMLTextAreaElement).value)}
										class="w-full bg-slate-50/70 hover:bg-white focus:bg-white border-2 border-slate-200 focus:border-emerald-500 rounded-2xl p-4 text-slate-900 text-sm sm:text-base leading-relaxed outline-none transition-all resize-y shadow-inner"
									></textarea>
								</div>

								<div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
									<span class="flex items-center gap-1.5 text-emerald-700">
										<Save class="w-3.5 h-3.5 text-emerald-600" />
										Jawaban tersimpan otomatis ke Supabase saat mengetik dan berpindah nomor soal.
									</span>
									<span class="{(currentAnswer || '').trim().length >= 15 ? 'text-emerald-600 font-bold' : 'text-slate-400'}">
										{(currentAnswer || '').trim().length >= 15 ? '✓ Uraian Terisi' : (currentAnswer ? 'Tulis lebih lengkap' : 'Belum diisi')}
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
								{@const ans = answers[q.id] || answers[`num_${q.questionNumber}`] || answers[String(q.questionNumber)]}
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

	<!-- STATE 3: SUBMISSION COMPLETED WITH AUTOMATIC SCORE -->
	{:else}
		{@const finalScore = quizResult.score ?? 0}
		{@const isPassed = finalScore >= 65}

		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<!-- Header Buttons -->
			<div class="mb-6 flex items-center justify-between">
				<Button href="/" variant="outline" size="sm">
					<ArrowLeft class="w-4 h-4 mr-1.5" />
					<span>Kembali ke Beranda</span>
				</Button>

				<Button variant="outline" size="sm" onclick={() => window.print()}>
					<Printer class="w-4 h-4 mr-1.5" />
					<span>Cetak Hasil Quiz</span>
				</Button>
			</div>

			<!-- Result Card -->
			<Card class="overflow-hidden border-slate-200 shadow-xl mb-8">
				<div class="p-6 sm:p-8 {isPassed ? 'bg-linear-to-r from-emerald-700 to-teal-800' : 'bg-linear-to-r from-slate-800 to-slate-900'} text-white">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<div class="flex items-center gap-2 mb-2">
								<Badge variant="emerald" size="sm">Laporan Hasil Evaluasi Quiz</Badge>
								<span class="text-xs text-emerald-100 font-semibold">Kaderisasi Tingkat I</span>
							</div>
							<h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">{quizResult.studentName}</h1>
							<p class="text-xs sm:text-sm text-emerald-100/90 mt-1">
								NIM: <span class="font-mono font-bold text-white">{quizResult.nim}</span> • Prodi: {quizResult.programStudi}
							</p>
						</div>

						<div class="shrink-0">
							<div class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full {isPassed ? 'bg-white/20 text-white' : 'bg-amber-400/20 text-amber-200'} text-xs font-bold backdrop-blur-md">
								{#if isPassed}
									<CheckCircle2 class="w-4 h-4 text-emerald-300" />
									<span>LULUS KADERISASI TINGKAT I</span>
								{:else}
									<Clock class="w-4 h-4 text-amber-300" />
									<span>PERLU PEMBINAAN LANJUTAN</span>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<div class="p-6 sm:p-8 bg-white space-y-6">
					<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
						<div class="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-center">
							<p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nilai Akhir</p>
							<div class="my-2">
								<span class="text-5xl font-black {isPassed ? 'text-emerald-600' : 'text-slate-800'} tracking-tight">{finalScore}</span>
								<span class="text-slate-400 font-bold text-sm">/100</span>
							</div>
							<Badge variant={isPassed ? 'emerald' : 'amber'} size="sm" class="self-center">
								{isPassed ? 'Memenuhi Standar KKM' : 'Belum Memenuhi KKM'}
							</Badge>
						</div>

						<div class="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
								<CheckCircle2 class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Jawaban Sesuai</p>
							<p class="text-3xl font-extrabold text-emerald-700 mt-1">{quizResult.correctCount}</p>
							<p class="text-[11px] text-emerald-600 mt-0.5">dari {quizResult.totalQuestions} butir soal</p>
						</div>

						<div class="p-6 bg-rose-50/60 rounded-2xl border border-rose-200/80 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-2">
								<XCircle class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-rose-800 uppercase tracking-wider">Perlu Evaluasi</p>
							<p class="text-3xl font-extrabold text-rose-700 mt-1">{quizResult.wrongCount}</p>
							<p class="text-[11px] text-rose-600 mt-0.5">dari {quizResult.totalQuestions} butir soal</p>
						</div>
					</div>

					<div class="pt-2 text-center">
						<Button
							variant="primary"
							size="md"
							onclick={() => showDetailedReview = !showDetailedReview}
						>
							<FileText class="w-4 h-4 mr-2" />
							<span>{showDetailedReview ? 'Sembunyikan Lembar Jawaban' : 'Lihat Hasil Evaluasi & Pembahasan Lengkap (1–30)'}</span>
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
							<span>Lembar Evaluasi Soal Nomor 1–30</span>
						</h2>
						<span class="text-xs text-slate-500">Hasil Evaluasi Otomatis & Pembahasan</span>
					</div>

					{#each quizResult.answersBreakdown as item}
						{@const isAns = item.studentAnswer && item.studentAnswer.trim() !== ''}
						{@const isCorrect = item.isCorrect}

						<Card class="border {isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'}">
							<div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
								<div class="flex items-center gap-2">
									<span class="w-7 h-7 rounded-lg {isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'} flex items-center justify-center font-bold text-xs">
										{item.questionNumber}
									</span>
									<Badge variant={isCorrect ? 'emerald' : 'rose'} size="sm">
										{item.section}
									</Badge>
								</div>

								<div class="flex items-center gap-1.5 text-xs font-bold {isCorrect ? 'text-emerald-700' : 'text-rose-700'}">
									{#if isCorrect}
										<Check class="w-4 h-4 stroke-[3]" />
										<span>JAWABAN SESUAI (BENAR)</span>
									{:else if isAns}
										<X class="w-4 h-4 stroke-[3]" />
										<span>PERLU EVALUASI (SALAH)</span>
									{:else}
										<X class="w-4 h-4 stroke-[3]" />
										<span>TIDAK DIJAWAB</span>
									{/if}
								</div>
							</div>

							<p class="text-sm font-semibold text-slate-900 mb-3 whitespace-pre-line">
								{item.questionText}
							</p>

							<!-- Student Essay Answer -->
							<div class="p-3.5 rounded-xl border mb-2 {isCorrect ? 'bg-emerald-100/50 border-emerald-300 text-emerald-950' : isAns ? 'bg-amber-50/60 border-amber-300 text-amber-950' : 'bg-rose-50 border-rose-200 text-rose-900'}">
								<div class="flex items-center justify-between text-[11px] font-bold mb-1">
									<span class="{isCorrect ? 'text-emerald-800' : isAns ? 'text-amber-800' : 'text-rose-700'}">
										Jawaban Uraian Anda:
									</span>
									<span class="text-[10px] text-slate-500">
										{item.studentAnswer ? `${item.studentAnswer.trim().split(/\s+/).filter(Boolean).length} kata` : 'Kosong'}
									</span>
								</div>
								<p class="text-xs sm:text-sm whitespace-pre-line leading-relaxed">
									{item.studentAnswer || 'Tidak ada jawaban tertulis.'}
								</p>
							</div>

							<!-- Official Essay Reference Answer -->
							{#if item.correctAnswer}
								<div class="p-3.5 bg-emerald-900/10 rounded-xl border border-emerald-300/80 text-xs text-emerald-950 mb-2">
									<div class="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
										<Award class="w-3.5 h-3.5 text-emerald-700" />
										<span>Referensi Jawaban Resmi:</span>
									</div>
									<p class="text-xs sm:text-sm whitespace-pre-line leading-relaxed text-emerald-950 font-medium">
										{item.correctAnswer}
									</p>
								</div>
							{/if}

							{#if item.explanation}
								<div class="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
									<strong class="text-emerald-800">Pembahasan & Rubrik:</strong> {item.explanation}
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
<Modal bind:open={reviewModalOpen} title="Review Jawaban (30 Butir Soal)" maxWidth="xl">
	<div class="space-y-4">
		<p class="text-xs text-slate-600">
			Periksa kelengkapan jawaban essay Anda untuk masing-masing butir soal sebelum mengirim kuis.
		</p>

		<div class="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs font-semibold">
			<span class="text-emerald-700">Terjawab: {answeredCount} Soal</span>
			<span class="text-rose-600">Belum Terjawab: {totalQuestions - answeredCount} Soal</span>
		</div>

		<div class="grid grid-cols-6 sm:grid-cols-10 gap-2 max-h-[300px] overflow-y-auto p-1">
			{#each questions as q, idx}
				{@const ans = answers[q.id] || answers[`num_${q.questionNumber}`] || answers[String(q.questionNumber)]}
				{@const isAns = ans && typeof ans === 'string' && ans.trim().length > 0}
				<button
					type="button"
					class="p-2 rounded-xl text-center border transition-all cursor-pointer {isAns ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'}"
					onclick={() => goToQuestion(idx)}
				>
					<span class="block text-xs font-bold">{idx + 1}</span>
					<span class="block text-[10px] font-mono mt-0.5 {isAns ? 'font-bold text-emerald-700' : 'text-rose-500'}">
						{isAns ? '✓' : '-'}
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
		? "Seluruh 30 soal telah Anda jawab. Apakah Anda yakin ingin mengirim quiz sekarang?"
		: `Perhatian: Anda baru menjawab ${answeredCount} dari 30 soal (${totalQuestions - answeredCount} belum dijawab). Apakah Anda yakin ingin mengirim quiz sekarang?`}
	confirmText="Ya, Kirim Quiz"
	cancelText="Periksa Lagi"
	variant={isAllAnswered ? 'primary' : 'danger'}
	loading={isSubmitting}
	onconfirm={() => handleSubmitQuiz()}
/>

<!-- Anti-Tab Switch Warning Modal -->
<Modal bind:open={showTabWarningModal} title="Peringatan Integritas Ujian" maxWidth="md">
	<div class="space-y-4 text-center py-2">
		<div class="w-14 h-14 rounded-2xl {tabViolationsCount >= MAX_TAB_VIOLATIONS ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-amber-100 text-amber-600'} flex items-center justify-center mx-auto shadow-sm">
			<ShieldAlert class="w-8 h-8" />
		</div>

		<div>
			<h3 class="text-base font-extrabold text-slate-900">
				{tabViolationsCount >= MAX_TAB_VIOLATIONS ? 'Batas Pelanggaran Terlampaui!' : 'Terdeteksi Meninggalkan Halaman Kuis!'}
			</h3>
			<p class="text-xs text-slate-600 mt-1.5 leading-relaxed">
				{#if tabViolationsCount >= MAX_TAB_VIOLATIONS}
					Anda telah meninggalkan halaman kuis sebanyak <strong>{tabViolationsCount} kali</strong> (mencapai batas maksimal). Sistem sedang <strong>mengirimkan jawaban Anda secara otomatis</strong> ke panitia.
				{:else}
					Anda terdeteksi berpindah tab, meminimalkan browser, atau membuka aplikasi lain. Demi menjaga kejujuran dan integritas ujian, seluruh aktivitas perpindahan tab direkam oleh sistem.
				{/if}
			</p>
		</div>

		<!-- Violation Counter Card -->
		<div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
			<div class="flex items-center justify-between font-bold mb-2">
				<span class="text-slate-700">Status Pelanggaran Tab:</span>
				<span class="{tabViolationsCount >= 2 ? 'text-rose-600 font-extrabold' : 'text-amber-600'}">
					{tabViolationsCount} dari {MAX_TAB_VIOLATIONS} Toleransi
				</span>
			</div>
			<div class="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
				<div
					class="h-full transition-all duration-300 {tabViolationsCount >= MAX_TAB_VIOLATIONS ? 'bg-rose-600' : tabViolationsCount === 2 ? 'bg-amber-500' : 'bg-emerald-500'}"
					style="width: {Math.min(100, (tabViolationsCount / MAX_TAB_VIOLATIONS) * 100)}%"
				></div>
			</div>
			<p class="text-[11px] text-slate-500 mt-2 text-left">
				⚠️ <em>Kuis akan otomatis dikirim paksa jika Anda berganti tab {MAX_TAB_VIOLATIONS} kali.</em>
			</p>
		</div>
	</div>

	{#snippet footer()}
		{#if tabViolationsCount < MAX_TAB_VIOLATIONS}
			<Button
				variant="primary"
				fullWidth
				onclick={() => showTabWarningModal = false}
			>
				Saya Mengerti & Kembali Mengerjakan
			</Button>
		{:else}
			<Button
				variant="danger"
				fullWidth
				loading={isSubmitting}
				onclick={() => {
					showTabWarningModal = false;
					handleSubmitQuiz();
				}}
			>
				Kirim Sekarang
			</Button>
		{/if}
	{/snippet}
</Modal>
