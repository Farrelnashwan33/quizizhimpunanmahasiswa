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
		Maximize2
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

	// Quiz Working State
	let currentIndex = $state(0);
	let answers = $state<Record<string, string>>({});
	let reviewModalOpen = $state(false);
	let confirmSubmitOpen = $state(false);
	let isSubmitting = $state(false);

	// Anti-Cheat & Tab Switch State
	let tabSwitchCount = $state(0);
	const maxViolations = 3;
	let cheatWarningOpen = $state(false);
	let cheatWarningMessage = $state('');

	// Quiz Result State
	let quizResult = $state<any>(null);
	let showDetailedReview = $state(false);

	const currentQuestion = $derived(questions[currentIndex]);
	const answeredCount = $derived(
		Object.values(answers).filter((a) => a && a.trim() !== '').length
	);
	const isAllAnswered = $derived(answeredCount === totalQuestions);

	function playAlarmSound() {
		try {
			const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
			if (!AudioCtx) return;
			const ctx = new AudioCtx();
			const now = ctx.currentTime;

			// 3 High-pitch Warning Siren Pulses
			for (let i = 0; i < 3; i++) {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();

				osc.type = 'sawtooth';
				osc.frequency.setValueAtTime(880, now + i * 0.28);
				osc.frequency.exponentialRampToValueAtTime(440, now + i * 0.28 + 0.22);

				gain.gain.setValueAtTime(0.35, now + i * 0.28);
				gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.28 + 0.22);

				osc.connect(gain);
				gain.connect(ctx.destination);

				osc.start(now + i * 0.28);
				osc.stop(now + i * 0.28 + 0.25);
			}
		} catch (e) {}
	}

	async function reportViolationToAdmin(count: number, msg: string) {
		try {
			fetch('/api/quiz/violation', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					studentName,
					nim,
					programStudi,
					violationCount: count,
					message: msg
				})
			}).catch(() => {});
		} catch (e) {}
	}

	// Anti-Cheat Event Handlers & LocalStorage Setup
	onMount(() => {
		try {
			const savedId = localStorage.getItem('quiz_fst_student');
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

		// 1. Tab Switch & Visibility Change Detection
		const handleVisibilityChange = () => {
			if (document.hidden && isIdentitySubmitted && !quizResult && !isSubmitting) {
				tabSwitchCount++;
				cheatWarningOpen = true;

				// Play Warning Alarm Siren Sound
				playAlarmSound();

				let msg = '';
				if (tabSwitchCount >= maxViolations) {
					msg = `Anda telah keluar/pindah tab sebanyak ${tabSwitchCount} kali (batas toleransi ${maxViolations} kali terlampaui). Kuis Anda otomatis dikumpulkan oleh sistem pengawas!`;
					cheatWarningMessage = msg;
					reportViolationToAdmin(tabSwitchCount, msg);
					handleSubmitQuiz(true);
				} else {
					msg = `PERINGATAN SISTEM PENGAWAS: Anda terdeteksi membuka tab baru atau berpindah aplikasi! (Pelanggaran ke-${tabSwitchCount} dari batas maksimal ${maxViolations} kali). Jika mengulangi, kuis akan otomatis dikumpulkan dan nilai terkunci!`;
					cheatWarningMessage = msg;
					reportViolationToAdmin(tabSwitchCount, msg);
				}
			}
		};

		// 2. Prevent Copy, Cut, Paste & Right Click
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

		// 3. Block Shortcuts (Ctrl+C, Ctrl+V, Ctrl+U, F12)
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'u', 'a', 'p'].includes(e.key.toLowerCase())) {
					e.preventDefault();
					toasts.warning('Pintasan keyboard dinonaktifkan.');
				}
				if (e.key === 'F12') {
					e.preventDefault();
				}
			}
		};

		// 4. Warn on Page Reload/Close
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (isIdentitySubmitted && !quizResult) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		document.addEventListener('copy', handleCopy);
		document.addEventListener('contextmenu', handleContextMenu);
		document.addEventListener('keydown', handleKeyDown);
		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			document.removeEventListener('copy', handleCopy);
			document.removeEventListener('contextmenu', handleContextMenu);
			document.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	function startQuiz() {
		if (!studentName.trim() || !nim.trim() || !programStudi.trim()) {
			toasts.error('Nama Lengkap, NIM, dan Program Studi wajib diisi.');
			return;
		}

		try {
			localStorage.setItem(
				'quiz_fst_student',
				JSON.stringify({ studentName, nim, programStudi, whatsapp })
			);
		} catch (e) {}

		// Attempt Fullscreen for Exam Integrity
		try {
			if (document.documentElement.requestFullscreen) {
				document.documentElement.requestFullscreen().catch(() => {});
			}
		} catch (e) {}

		isIdentitySubmitted = true;
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function selectOption(optionKey: string) {
		if (!currentQuestion || isSubmitting || quizResult) return;
		answers[currentQuestion.id] = optionKey;

		try {
			localStorage.setItem('quiz_fst_answers', JSON.stringify(answers));
		} catch (e) {}
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

	async function handleSubmitQuiz(isAuto = false) {
		isSubmitting = true;
		confirmSubmitOpen = false;

		try {
			const res = await fetch('/api/quiz/submit-direct', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					studentName,
					nim,
					programStudi,
					whatsapp,
					answers,
					tabSwitchCount
				})
			});

			const data = await res.json();

			if (data.success) {
				quizResult = data;
				try {
					localStorage.removeItem('quiz_fst_answers');
				} catch (e) {}

				if (data.score >= 65) {
					try {
						confetti({
							particleCount: 90,
							spread: 70,
							origin: { y: 0.6 }
						});
					} catch (e) {}
				}

				if (isAuto) {
					toasts.error('Kuis otomatis dikumpulkan karena terdeteksi pelanggaran pindah tab.');
				} else {
					toasts.success('Quiz berhasil dikirim dan nilai telah dihitung!');
				}
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
		tabSwitchCount = 0;
		showDetailedReview = false;
		try {
			localStorage.removeItem('quiz_fst_answers');
		} catch (e) {}
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

<svelte:head>
	<title>Quiz Kaderisasi Tingkat I - HIMA FST UT Bandung</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex flex-col">
	<!-- STATE 1: ISI IDENTITAS MAHASISWA (TANPA LOGIN / REGISTER) -->
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
						Himpunan Mahasiswa Fakultas Sains dan Teknologi Universitas Terbuka
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
							<Button type="submit" variant="primary" size="lg" fullWidth class="shadow-lg shadow-emerald-600/30 font-bold">
								<span>Mulai Mengerjakan (30 Soal)</span>
								<ArrowRight class="w-5 h-5 ml-2" />
							</Button>
						</div>
					</form>

					<div class="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
						<span>30 Pilihan Ganda</span>
						<span>•</span>
						<span>Otomatis Dinilai</span>
						<span>•</span>
						<span>HIMA FST UT Bandung</span>
					</div>
				</Card>
			</div>
		</div>

	<!-- STATE 2: MENGERJAKAN 30 SOAL QUIZ -->
	{:else if !quizResult}
		<!-- Sticky Quiz Header -->
		<header class="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
			<div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
				<!-- Student Info & Title -->
				<div class="flex items-center gap-3">
					<div class="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200 shadow-xs overflow-hidden shrink-0">
						<img src={logoHima} alt="Logo HIMA FST UT" class="w-full h-full object-contain" />
					</div>
					<div>
						<div class="flex items-center gap-2">
							<span class="font-bold text-sm sm:text-base text-slate-900 line-clamp-1">
								{studentName}
							</span>
							<Badge variant="emerald" size="sm">NIM: {nim}</Badge>
							{#if tabSwitchCount > 0}
								<span class="inline-flex items-center gap-1 text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded-full animate-pulse">
									<AlertTriangle class="w-3 h-3" />
									Pindah Tab: {tabSwitchCount}/3
								</span>
							{:else}
								<span class="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
									<ShieldAlert class="w-3 h-3 text-emerald-600" />
									Pengawas Aktif
								</span>
							{/if}
						</div>
						<div class="text-xs text-slate-500">
							Prodi: {programStudi} • Soal {currentIndex + 1} dari {totalQuestions}
						</div>
					</div>
				</div>

				<!-- Actions -->
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={() => reviewModalOpen = true}>
						<ListCheck class="w-4 h-4 sm:mr-1.5" />
						<span class="hidden sm:inline">Review ({answeredCount}/{totalQuestions})</span>
					</Button>

					<Button variant="primary" size="sm" onclick={() => confirmSubmitOpen = true} loading={isSubmitting}>
						<Send class="w-3.5 h-3.5 mr-1.5" />
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
		<main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 select-none">
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
				<!-- Left/Center: Question Card (3 Cols) -->
				<div class="lg:col-span-3 space-y-6">
					{#if currentQuestion}
						{@const currentAnswer = answers[currentQuestion.id]}

						<Card glass padding="lg" class="shadow-md border-slate-200 select-none">
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
								<span class="text-xs font-semibold text-slate-400">
									Pilihan Ganda
								</span>
							</div>

							<!-- Question Text -->
							<div class="mb-8">
								<p class="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
									{currentQuestion.questionText}
								</p>
							</div>

							<!-- Options A, B, C, D -->
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
										class="w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 cursor-pointer group {isSelected ? 'bg-emerald-50/80 border-emerald-500 shadow-xs shadow-emerald-500/10' : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'}"
										onclick={() => selectOption(opt.key)}
									>
										<div class="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-all {isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'}">
											{#if isSelected}
												<Check class="w-4 h-4 stroke-[3]" />
											{:else}
												{opt.key}
											{/if}
										</div>
										<div class="flex-1 text-sm leading-snug {isSelected ? 'font-semibold text-emerald-950' : 'text-slate-800'}">
											{opt.text}
										</div>
									</button>
								{/each}
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
								{@const isAns = !!answers[q.id]}
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

	<!-- STATE 3: HASIL PENILAIAN LENGKAP -->
	{:else}
		{@const isPassed = quizResult.score >= 65}

		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
			<!-- Header Buttons -->
			<div class="mb-6 flex items-center justify-between">
				<Button variant="outline" size="sm" onclick={resetAndRetake}>
					<RotateCcw class="w-4 h-4 mr-1.5" />
					<span>Kerjakan Ulang</span>
				</Button>

				<Button variant="outline" size="sm" onclick={() => window.print()}>
					<Printer class="w-4 h-4 mr-1.5" />
					<span>Cetak Hasil</span>
				</Button>
			</div>

			<!-- Result Card -->
			<Card class="overflow-hidden border-slate-200 shadow-xl mb-8">
				<div class="p-6 sm:p-8 {isPassed ? 'bg-linear-to-r from-emerald-700 to-teal-800' : 'bg-linear-to-r from-slate-800 to-slate-900'} text-white">
					<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<div class="flex items-center gap-2 mb-2">
								<Badge variant="emerald" size="sm">Laporan Hasil Quiz</Badge>
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
								<span class="text-5xl font-black {isPassed ? 'text-emerald-600' : 'text-slate-800'} tracking-tight">{quizResult.score}</span>
								<span class="text-slate-400 font-bold text-sm">/100</span>
							</div>
							<Badge variant={isPassed ? 'emerald' : 'amber'} size="sm" class="self-center">
								{isPassed ? 'Memenuhi Standar' : 'Belum Memenuhi'}
							</Badge>
						</div>

						<div class="p-6 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
								<CheckCircle2 class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-emerald-800 uppercase tracking-wider">Jawaban Benar</p>
							<p class="text-3xl font-extrabold text-emerald-700 mt-1">{quizResult.correctCount}</p>
							<p class="text-[11px] text-emerald-600 mt-0.5">dari {quizResult.totalQuestions} soal</p>
						</div>

						<div class="p-6 bg-rose-50/60 rounded-2xl border border-rose-200/80 flex flex-col justify-center">
							<div class="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-2">
								<XCircle class="w-5 h-5" />
							</div>
							<p class="text-xs font-bold text-rose-800 uppercase tracking-wider">Jawaban Salah</p>
							<p class="text-3xl font-extrabold text-rose-700 mt-1">{quizResult.wrongCount}</p>
							<p class="text-[11px] text-rose-600 mt-0.5">dari {quizResult.totalQuestions} soal</p>
						</div>
					</div>

					<div class="pt-4 border-t border-slate-100 text-center">
						<Button
							variant="primary"
							size="md"
							onclick={() => showDetailedReview = !showDetailedReview}
						>
							<FileText class="w-4 h-4 mr-2" />
							<span>{showDetailedReview ? 'Sembunyikan Pembahasan' : 'Lihat Kunci & Pembahasan Lengkap (1–30)'}</span>
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
							<span>Pembahasan Soal Nomor 1–30</span>
						</h2>
						<span class="text-xs text-slate-500">Kunci Jawaban Resmi HIMA FST</span>
					</div>

					{#each quizResult.answersBreakdown as item}
						{@const isCorrect = item.isCorrect}
						{@const isAnswered = item.studentAnswer !== null}

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
										<span>BENAR (+1)</span>
									{:else if !isAnswered}
										<X class="w-4 h-4 stroke-[3]" />
										<span>TIDAK DIJAWAB (0)</span>
									{:else}
										<X class="w-4 h-4 stroke-[3]" />
										<span>SALAH (0)</span>
									{/if}
								</div>
							</div>

							<p class="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-line">
								{item.questionText}
							</p>

							<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
								{#each [
									{ key: 'A', text: item.optionA },
									{ key: 'B', text: item.optionB },
									{ key: 'C', text: item.optionC },
									{ key: 'D', text: item.optionD }
								] as opt}
									{@const isStudentChoice = item.studentAnswer === opt.key}
									{@const isKey = item.correctAnswer === opt.key}

									<div class="p-2.5 rounded-xl border flex items-start gap-2 {isKey ? 'bg-emerald-100/70 border-emerald-300 font-semibold text-emerald-950' : isStudentChoice && !isCorrect ? 'bg-rose-100/70 border-rose-300 font-semibold text-rose-950' : 'bg-white border-slate-200 text-slate-700'}">
										<span class="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 {isKey ? 'bg-emerald-600 text-white' : isStudentChoice ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}">
											{opt.key}
										</span>
										<span class="flex-1 leading-tight">{opt.text}</span>
										{#if isKey}
											<span class="text-[10px] font-bold text-emerald-700 shrink-0">KUNCI</span>
										{:else if isStudentChoice}
											<span class="text-[10px] font-bold text-rose-700 shrink-0">PILIHAN ANDA</span>
										{/if}
									</div>
								{/each}
							</div>

							{#if item.explanation}
								<div class="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
									<strong class="text-emerald-800">Pembahasan:</strong> {item.explanation}
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
			Klik salah satu nomor untuk memeriksa kembali sebelum mengirim kuis.
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
		? "Seluruh 30 soal telah Anda jawab. Apakah Anda yakin ingin mengirim quiz dan melihat nilai sekarang?"
		: `Perhatian: Anda baru menjawab ${answeredCount} dari 30 soal (${totalQuestions - answeredCount} belum dijawab). Apakah Anda yakin ingin mengirim quiz sekarang?`}
	confirmText="Ya, Kirim Quiz"
	cancelText="Periksa Lagi"
	variant={isAllAnswered ? 'primary' : 'danger'}
	loading={isSubmitting}
	onconfirm={() => handleSubmitQuiz(false)}
/>

<!-- Anti-Cheat / Tab Switch Alert Modal -->
<Modal bind:open={cheatWarningOpen} title="⚠️ Peringatan Pengawas Ujian Daring" maxWidth="md">
	<div class="space-y-4 py-2 text-center">
		<div class="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50 animate-bounce">
			<ShieldAlert class="w-8 h-8" />
		</div>

		<div>
			<h3 class="text-base font-bold text-slate-900">
				Terdeteksi Meninggalkan Halaman / Buka Tab Baru!
			</h3>
			<p class="text-xs text-slate-600 mt-2 leading-relaxed">
				{cheatWarningMessage}
			</p>
		</div>

		<div class="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
			<span>Status Pelanggaran:</span>
			<span class="font-black text-sm">{tabSwitchCount} / {maxViolations} Kali</span>
		</div>

		<p class="text-[11px] text-slate-400">
			Seluruh aktivitas perpindahan tab terekam di sistem pengawas panitia Kaderisasi HIMA FST UT Bandung.
		</p>
	</div>

	{#snippet footer()}
		{#if tabSwitchCount >= maxViolations}
			<Button variant="danger" size="md" fullWidth loading={isSubmitting} onclick={() => handleSubmitQuiz(true)}>
				<span>Kuis Dikumpulkan Otomatis</span>
			</Button>
		{:else}
			<Button variant="danger" size="md" fullWidth onclick={() => cheatWarningOpen = false}>
				<span>Saya Mengerti & Kembali ke Soal</span>
			</Button>
		{/if}
	{/snippet}
</Modal>
