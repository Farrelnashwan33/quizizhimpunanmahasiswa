import { prisma, isDatabaseConfigured } from './prisma';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import {
	getAllAttempts as getMemoryAttempts,
	recordAttempt,
	type ParticipantAttempt
} from './participantStore';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';

export interface StudentProfile {
	id: string;
	fullName: string;
	nim: string;
	email: string;
	programStudi: string;
	whatsapp: string | null;
	role: 'mahasiswa' | 'admin';
	createdAt: Date | string;
	updatedAt?: Date | string;
}

export interface QuizInfo {
	id: string;
	title: string;
	description?: string | null;
	durationMinutes?: number;
	isActive?: boolean;
}

export interface DetailedAnswerItem {
	question?: any;
	questionNumber: number;
	section: string;
	questionText: string;
	optionA: string;
	optionB: string;
	optionC: string;
	optionD: string;
	studentAnswer: string | null;
	correctAnswer: string;
	isCorrect: boolean;
	status: 'Benar' | 'Salah' | 'Belum Dijawab';
	explanation: string | null;
	answeredAt?: Date | string | null;
}


export interface FormattedAttempt {
	id: string;
	quizId: string;
	studentId: string;
	status: 'in_progress' | 'completed' | 'timed_out';
	score: number | null;
	correctCount: number;
	wrongCount: number;
	totalQuestions: number;
	startedAt: Date | string;
	submittedAt: Date | string | null;
	student: StudentProfile;
	quiz: QuizInfo;
	answers?: any[];
	tabSwitchCount?: number;
}

// Normalizer helper: Converts snake_case from Supabase REST API to standard camelCase
function normalizeSupabaseAttempt(raw: any): FormattedAttempt {
	const studentRaw = raw.student || raw.profiles || {};
	const quizRaw = raw.quiz || raw.quizzes || {};

	const student: StudentProfile = {
		id: studentRaw.id || raw.student_id || 'std-' + (studentRaw.nim || 'unknown'),
		fullName: studentRaw.full_name || studentRaw.fullName || raw.student_name || 'Mahasiswa',
		nim: studentRaw.nim || raw.nim || '-',
		email: studentRaw.email || (studentRaw.nim ? `${studentRaw.nim}@student.ut.ac.id` : '-'),
		programStudi: studentRaw.program_studi || studentRaw.programStudi || 'Sains dan Teknologi',
		whatsapp: studentRaw.whatsapp || null,
		role: studentRaw.role || 'mahasiswa',
		createdAt: studentRaw.created_at || raw.started_at || new Date()
	};

	const quiz: QuizInfo = {
		id: quizRaw.id || raw.quiz_id || '11111111-1111-1111-1111-111111111111',
		title: quizRaw.title || 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
		description: quizRaw.description || null,
		durationMinutes: quizRaw.duration_minutes || 60,
		isActive: quizRaw.is_active ?? true
	};

	return {
		id: raw.id,
		quizId: quiz.id,
		studentId: student.id,
		status: raw.status || 'completed',
		score: raw.score !== null && raw.score !== undefined ? Number(raw.score) : null,
		correctCount: raw.correct_count ?? raw.correctCount ?? 0,
		wrongCount: raw.wrong_count ?? raw.wrongCount ?? 0,
		totalQuestions: raw.total_questions ?? raw.totalQuestions ?? 30,
		startedAt: raw.started_at || raw.startedAt || new Date(),
		submittedAt: raw.submitted_at || raw.submittedAt || null,
		student,
		quiz,
		answers: raw.answers || []
	};
}

/**
 * 1. GET ALL QUIZ ATTEMPTS (Daftar Peserta & Nilai Quiz)
 * Resilient dual-source fetching: Prisma -> Supabase REST API -> Memory Store
 */
export async function getAllQuizAttempts(params: {
	search?: string;
	prodi?: string;
	status?: string;
	sort?: string;
	page?: number;
	pageSize?: number;
} = {}) {
	const {
		search = '',
		prodi = '',
		status = '',
		sort = 'score_desc',
		page = 1,
		pageSize = 15
	} = params;

	let dbAttempts: FormattedAttempt[] = [];
	let dbProdis: string[] = [];
	let isDbQueried = false;

	// LAYER 1: Try Prisma Direct PostgreSQL Connection
	if (isDatabaseConfigured) {
		try {
			const prismaAttempts = await prisma.quizAttempt.findMany({
				include: {
					student: true,
					quiz: true,
					answers: {
						include: { question: true }
					}
				},
				orderBy: { startedAt: 'desc' }
			});

			if (prismaAttempts && prismaAttempts.length > 0) {
				dbAttempts = prismaAttempts.map((att: any) => ({
					id: att.id,
					quizId: att.quizId,
					studentId: att.studentId,
					status: att.status,
					score: att.score !== null ? Number(att.score) : null,
					correctCount: att.correctCount,
					wrongCount: att.wrongCount,
					totalQuestions: att.totalQuestions,
					startedAt: att.startedAt,
					submittedAt: att.submittedAt,
					student: {
						id: att.student.id,
						fullName: att.student.fullName,
						nim: att.student.nim,
						email: att.student.email,
						programStudi: att.student.programStudi,
						whatsapp: att.student.whatsapp,
						role: att.student.role,
						createdAt: att.student.createdAt
					},
					quiz: {
						id: att.quiz.id,
						title: att.quiz.title
					},
					answers: att.answers
				}));
				isDbQueried = true;
			}

			const prodiRows = await prisma.profile.findMany({
				where: { role: 'mahasiswa' },
				select: { programStudi: true },
				distinct: ['programStudi']
			});
			dbProdis = prodiRows.map((p) => p.programStudi).filter(Boolean);
		} catch (prismaErr) {
			console.warn('Prisma query in getAllQuizAttempts encountered error, falling back to Supabase REST API:', prismaErr);
		}
	}

	// LAYER 2: Try Supabase REST API via supabaseAdmin
	if (!isDbQueried && isSupabaseConfigured) {
		try {
			const { data: supaAttempts, error: supaErr } = await supabaseAdmin
				.from('quiz_attempts')
				.select(`
					id,
					quiz_id,
					student_id,
					started_at,
					submitted_at,
					status,
					score,
					correct_count,
					wrong_count,
					total_questions,
					student:profiles (
						id,
						full_name,
						nim,
						email,
						program_studi,
						whatsapp,
						role,
						created_at
					),
					quiz:quizzes (
						id,
						title
					),
					answers (
						id,
						attempt_id,
						question_id,
						selected_answer,
						is_correct,
						answered_at,
						question:questions (*)
					)
				`)
				.order('started_at', { ascending: false });

			if (!supaErr && supaAttempts && supaAttempts.length > 0) {
				dbAttempts = supaAttempts.map(normalizeSupabaseAttempt);
				isDbQueried = true;
			}

			const { data: supaProdis } = await supabaseAdmin
				.from('profiles')
				.select('program_studi')
				.eq('role', 'mahasiswa');

			if (supaProdis) {
				dbProdis = Array.from(new Set(supaProdis.map((p: any) => p.program_studi))).filter(Boolean);
			}
		} catch (supaErr) {
			console.warn('Supabase REST query in getAllQuizAttempts encountered error:', supaErr);
		}
	}

	// LAYER 3: Merge with In-Memory Store
	const memoryAttempts = getMemoryAttempts();
	const dbNims = new Set(dbAttempts.map((a) => a.student?.nim));
	const extraMemory = memoryAttempts.filter((m) => m.student && !dbNims.has(m.student.nim));
	const allAttempts: FormattedAttempt[] = [...dbAttempts, ...(extraMemory as any)];

	// Keep memory store synced with persistent records
	for (const item of dbAttempts) {
		recordAttempt(item as any);
	}

	// Apply Filters
	let filtered = allAttempts;

	if (search) {
		const s = search.toLowerCase();
		filtered = filtered.filter(
			(a) =>
				a.student?.fullName?.toLowerCase().includes(s) ||
				a.student?.nim?.toLowerCase().includes(s) ||
				a.student?.email?.toLowerCase().includes(s)
		);
	}

	if (prodi) {
		filtered = filtered.filter((a) => a.student?.programStudi === prodi);
	}

	if (status) {
		filtered = filtered.filter((a) => a.status === status);
	}

	// Apply Sorting
	filtered.sort((a, b) => {
		if (sort === 'score_asc') return (a.score ?? 0) - (b.score ?? 0);
		if (sort === 'time_desc') {
			const timeA = new Date(a.submittedAt || a.startedAt).getTime();
			const timeB = new Date(b.submittedAt || b.startedAt).getTime();
			return timeB - timeA;
		}
		if (sort === 'time_asc') {
			const timeA = new Date(a.startedAt).getTime();
			const timeB = new Date(b.startedAt).getTime();
			return timeA - timeB;
		}
		if (sort === 'name_asc') {
			return (a.student?.fullName || '').localeCompare(b.student?.fullName || '');
		}
		// Default: score_desc
		return (b.score ?? 0) - (a.score ?? 0);
	});

	const totalCount = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

	const allProdiList = Array.from(
		new Set([
			...dbProdis,
			...allAttempts.map((a) => a.student?.programStudi)
		])
	).filter(Boolean);

	return {
		attempts: paginated,
		totalCount,
		page,
		totalPages,
		prodiList: allProdiList,
		filters: { search, prodi, status, sort }
	};
}

/**
 * 2. GET ATTEMPT BY ID / NIM (Detail Jawaban 30 Soal)
 */
export async function getQuizAttemptById(idOrNim: string) {
	let attempt: FormattedAttempt | null = null;
	let questionsList: any[] = OFFICIAL_30_QUESTIONS;

	// Layer 1: Prisma
	if (isDatabaseConfigured) {
		try {
			const dbAttempt = await prisma.quizAttempt.findFirst({
				where: {
					OR: [
						{ id: idOrNim },
						{ studentId: idOrNim },
						{ student: { nim: idOrNim } }
					]
				},
				include: {
					student: true,
					quiz: true,
					answers: {
						include: { question: true }
					}
				}
			});

			if (dbAttempt) {
				attempt = {
					id: dbAttempt.id,
					quizId: dbAttempt.quizId,
					studentId: dbAttempt.studentId,
					status: dbAttempt.status,
					score: dbAttempt.score !== null ? Number(dbAttempt.score) : null,
					correctCount: dbAttempt.correctCount,
					wrongCount: dbAttempt.wrongCount,
					totalQuestions: dbAttempt.totalQuestions,
					startedAt: dbAttempt.startedAt,
					submittedAt: dbAttempt.submittedAt,
					student: dbAttempt.student as any,
					quiz: dbAttempt.quiz as any,
					answers: dbAttempt.answers
				};

				const dbQuestions = await prisma.question.findMany({
					where: { quizId: dbAttempt.quizId },
					orderBy: { questionNumber: 'asc' }
				});
				if (dbQuestions && dbQuestions.length > 0) {
					questionsList = dbQuestions;
				}
			}
		} catch (err) {
			console.warn('Prisma error in getQuizAttemptById, trying Supabase REST API:', err);
		}
	}

	// Layer 2: Supabase REST
	if (!attempt && isSupabaseConfigured) {
		try {
			// Query attempt directly or join profiles
			const { data: supaAttempt } = await supabaseAdmin
				.from('quiz_attempts')
				.select(`
					*,
					student:profiles (*),
					quiz:quizzes (*),
					answers (*, question:questions (*))
				`)
				.or(`id.eq.${idOrNim},student_id.eq.${idOrNim}`)
				.maybeSingle();

			if (supaAttempt) {
				attempt = normalizeSupabaseAttempt(supaAttempt);
			} else {
				// Try lookup by student nim
				const { data: prof } = await supabaseAdmin
					.from('profiles')
					.select('id')
					.eq('nim', idOrNim)
					.maybeSingle();

				if (prof) {
					const { data: supaAtt2 } = await supabaseAdmin
						.from('quiz_attempts')
						.select(`
							*,
							student:profiles (*),
							quiz:quizzes (*),
							answers (*, question:questions (*))
						`)
						.eq('student_id', prof.id)
						.order('started_at', { ascending: false })
						.limit(1)
						.maybeSingle();

					if (supaAtt2) {
						attempt = normalizeSupabaseAttempt(supaAtt2);
					}
				}
			}

			const { data: supaQuestions } = await supabaseAdmin
				.from('questions')
				.select('*')
				.order('question_number', { ascending: true });

			if (supaQuestions && supaQuestions.length > 0) {
				questionsList = supaQuestions.map((q: any) => ({
					id: q.id,
					questionNumber: q.question_number,
					section: q.section,
					questionText: q.question_text,
					optionA: q.option_a,
					optionB: q.option_b,
					optionC: q.option_c,
					optionD: q.option_d,
					correctAnswer: q.correct_answer,
					explanation: q.explanation
				}));
			}
		} catch (err) {
			console.warn('Supabase REST error in getQuizAttemptById:', err);
		}
	}

	// Layer 3: Memory Store Fallback
	if (!attempt) {
		const memList = getMemoryAttempts();
		const mem = memList.find((a) => a.id === idOrNim || a.student.nim === idOrNim || a.studentId === idOrNim);
		if (mem) {
			attempt = mem as any;
		}
	}

	if (!attempt) {
		return null;
	}

	// Build map of student answers
	const answerMap = new Map<string, any>();
	if (attempt.answers) {
		for (const a of attempt.answers) {
			const qId = a.questionId || a.question_id;
			const qNum = a.question?.questionNumber || a.question?.question_number || a.questionNumber;
			if (qId) answerMap.set(qId, a);
			if (qNum) answerMap.set(`num_${qNum}`, a);
		}
	}

	// Build detailed 30 questions breakdown
	const detailedQuestions: DetailedAnswerItem[] = questionsList.map((q) => {
		const ans = answerMap.get(q.id) || answerMap.get(`num_${q.questionNumber}`);
		const studentChoice = (ans?.selectedAnswer || ans?.selected_answer || ans?.studentAnswer || null)?.toUpperCase() || null;
		const isCorrect = studentChoice !== null && studentChoice === q.correctAnswer?.toUpperCase();
		const status: 'Benar' | 'Salah' | 'Belum Dijawab' = studentChoice
			? (isCorrect ? 'Benar' : 'Salah')
			: 'Belum Dijawab';

		return {
			question: q,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			optionA: q.optionA,
			optionB: q.optionB,
			optionC: q.optionC,
			optionD: q.optionD,
			studentAnswer: studentChoice,
			correctAnswer: q.correctAnswer,
			isCorrect,
			status,
			explanation: q.explanation || null,
			answeredAt: ans?.answeredAt || ans?.answered_at || attempt?.submittedAt || null
		};
	});


	return {
		attempt,
		student: attempt.student,
		quiz: attempt.quiz,
		detailedQuestions
	};
}

/**
 * 3. GET DASHBOARD STATISTICS
 */
export async function getDashboardStatistics() {
	const allRes = await getAllQuizAttempts({ pageSize: 10000 });
	const attempts = allRes.attempts;

	const completedAttempts = attempts.filter((a) => a.status === 'completed' && a.score !== null);
	const totalParticipants = attempts.length;
	const totalCompleted = completedAttempts.length;
	const totalInProgress = attempts.filter((a) => a.status === 'in_progress').length;

	let averageScore = 0;
	let highestScore = 0;
	let lowestScore = 0;

	const distribution = {
		'0-49': 0,
		'50-64': 0,
		'65-79': 0,
		'80-89': 0,
		'90-100': 0
	};

	if (completedAttempts.length > 0) {
		const scores = completedAttempts.map((a) => Number(a.score));
		const sum = scores.reduce((acc, val) => acc + val, 0);
		averageScore = Math.round((sum / scores.length) * 10) / 10;
		highestScore = Math.max(...scores);
		lowestScore = Math.min(...scores);

		scores.forEach((sc) => {
			if (sc < 50) distribution['0-49']++;
			else if (sc < 65) distribution['50-64']++;
			else if (sc < 80) distribution['65-79']++;
			else if (sc < 90) distribution['80-89']++;
			else distribution['90-100']++;
		});
	}

	const uniqueStudents = new Set(attempts.map((a) => a.student.nim)).size;

	return {
		stats: {
			totalStudents: uniqueStudents || totalParticipants,
			totalParticipants,
			totalCompleted,
			totalInProgress,
			averageScore,
			highestScore,
			lowestScore,
			totalQuestions: 30
		},
		distribution,
		recentAttempts: attempts.slice(0, 6)
	};
}

/**
 * 4. GET HASIL & STATISTIK SECTION ACCURACY
 */
export async function getHasilStatistics() {
	const allRes = await getAllQuizAttempts({ pageSize: 10000 });
	const completed = allRes.attempts.filter((a) => a.status === 'completed');

	const sectionStats: Record<string, { total: number; correct: number }> = {
		'Nilai dan Karakter Dasar': { total: 0, correct: 0 },
		'Gerakan Mahasiswa': { total: 0, correct: 0 },
		'Tridharma Perguruan Tinggi': { total: 0, correct: 0 },
		'Peran dan Fungsi Mahasiswa': { total: 0, correct: 0 },
		'Organisasi Kemahasiswaan dan HIMA FST': { total: 0, correct: 0 },
		'Studi Kasus': { total: 0, correct: 0 }
	};

	let totalPassed = 0;
	let totalFailed = 0;

	for (const att of completed) {
		if ((att.score ?? 0) >= 65) totalPassed++;
		else totalFailed++;

		if (att.answers && att.answers.length > 0) {
			for (const ans of att.answers) {
				const sec = ans.question?.section || ans.section;
				if (sec && sectionStats[sec]) {
					sectionStats[sec].total++;
					if (ans.isCorrect || ans.is_correct) {
						sectionStats[sec].correct++;
					}
				}
			}
		}
	}

	return {
		totalCompleted: completed.length,
		totalPassed,
		totalFailed,
		sectionStats
	};
}

/**
 * 5. GET ALL MAHASISWA (Data Mahasiswa)
 */
export async function getAllMahasiswa(params: { search?: string; prodi?: string } = {}) {
	const { search = '', prodi = '' } = params;
	const allRes = await getAllQuizAttempts({ pageSize: 10000 });
	const attempts = allRes.attempts;

	// Group attempts by student NIM
	const studentMap = new Map<string, any>();

	for (const att of attempts) {
		const s = att.student;
		if (!s || !s.nim) continue;

		if (!studentMap.has(s.nim)) {
			studentMap.set(s.nim, {
				id: s.id,
				fullName: s.fullName,
				nim: s.nim,
				email: s.email,
				programStudi: s.programStudi,
				whatsapp: s.whatsapp,
				role: s.role || 'mahasiswa',
				createdAt: s.createdAt,
				attempts: []
			});
		}

		studentMap.get(s.nim).attempts.push({
			id: att.id,
			status: att.status,
			score: att.score,
			startedAt: att.startedAt,
			submittedAt: att.submittedAt
		});
	}

	let students = Array.from(studentMap.values());

	if (search) {
		const q = search.toLowerCase();
		students = students.filter(
			(s) =>
				s.fullName?.toLowerCase().includes(q) ||
				s.nim?.toLowerCase().includes(q) ||
				s.email?.toLowerCase().includes(q)
		);
	}

	if (prodi) {
		students = students.filter((s) => s.programStudi === prodi);
	}

	const allProdis = Array.from(new Set(Array.from(studentMap.values()).map((s) => s.programStudi))).filter(Boolean);

	return {
		students,
		prodiList: allProdis,
		filters: { search, prodi }
	};
}

/**
 * 6. PERSISTENT QUIZ START
 */
export async function startQuizAttempt(data: {
	studentName: string;
	nim: string;
	programStudi: string;
	whatsapp?: string | null;
}) {
	const cleanName = data.studentName.trim();
	const cleanNim = data.nim.trim();
	const cleanProdi = data.programStudi.trim();
	const cleanWa = data.whatsapp?.trim() || null;
	const studentEmail = `${cleanNim}@student.ut.ac.id`;
	const now = new Date();

	let attemptId = 'att-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
	let studentId = 'std-' + cleanNim;
	let quizId = '11111111-1111-1111-1111-111111111111';

	// 1. Prisma Engine Write
	if (isDatabaseConfigured) {
		try {
			// Find or create quiz
			let quiz = await prisma.quiz.findFirst({ where: { isActive: true } });
			if (!quiz) {
				quiz = await prisma.quiz.findFirst();
			}
			if (!quiz) {
				quiz = await prisma.quiz.create({
					data: {
						id: quizId,
						title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
						durationMinutes: 60,
						isActive: true
					}
				});
			}
			quizId = quiz.id;

			// Find or create profile
			let profile = await prisma.profile.findFirst({
				where: { OR: [{ nim: cleanNim }, { email: studentEmail }] }
			});

			if (profile) {
				profile = await prisma.profile.update({
					where: { id: profile.id },
					data: {
						fullName: cleanName,
						programStudi: cleanProdi,
						whatsapp: cleanWa
					}
				});
			} else {
				profile = await prisma.profile.create({
					data: {
						fullName: cleanName,
						nim: cleanNim,
						email: studentEmail,
						programStudi: cleanProdi,
						whatsapp: cleanWa,
						role: 'mahasiswa'
					}
				});
			}

			studentId = profile.id;

			const attempt = await prisma.quizAttempt.create({
				data: {
					quizId,
					studentId: profile.id,
					status: 'in_progress',
					startedAt: now,
					totalQuestions: 30
				}
			});

			attemptId = attempt.id;
		} catch (prismaErr) {
			console.warn('Prisma start notice, trying Supabase REST API fallback:', prismaErr);
		}
	}

	// 2. Supabase REST Engine Write
	if (isSupabaseConfigured) {
		try {
			// Upsert profile in Supabase
			const { data: supaProf } = await supabaseAdmin
				.from('profiles')
				.upsert(
					{
						full_name: cleanName,
						nim: cleanNim,
						email: studentEmail,
						program_studi: cleanProdi,
						whatsapp: cleanWa,
						role: 'mahasiswa'
					},
					{ onConflict: 'nim' }
				)
				.select('id')
				.maybeSingle();

			if (supaProf) {
				studentId = supaProf.id;
			}

			// Create attempt
			const { data: supaAtt } = await supabaseAdmin
				.from('quiz_attempts')
				.insert({
					id: attemptId.includes('-') && attemptId.length === 36 ? attemptId : undefined,
					quiz_id: quizId,
					student_id: studentId,
					status: 'in_progress',
					started_at: now.toISOString(),
					total_questions: 30
				})
				.select('id')
				.maybeSingle();

			if (supaAtt) {
				attemptId = supaAtt.id;
			}
		} catch (supaErr) {
			console.warn('Supabase REST start notice:', supaErr);
		}
	}

	// 3. Mirror to Memory Store
	const attemptRecord: ParticipantAttempt = {
		id: attemptId,
		quizId,
		studentId,
		status: 'in_progress',
		score: null,
		correctCount: 0,
		wrongCount: 0,
		totalQuestions: 30,
		startedAt: now,
		submittedAt: null,
		student: {
			id: studentId,
			fullName: cleanName,
			nim: cleanNim,
			email: studentEmail,
			programStudi: cleanProdi,
			whatsapp: cleanWa,
			role: 'mahasiswa',
			createdAt: now
		},
		quiz: {
			id: quizId,
			title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
		},
		answers: []
	};

	recordAttempt(attemptRecord);

	return {
		attemptId,
		studentId,
		studentName: cleanName,
		nim: cleanNim,
		programStudi: cleanProdi,
		startedAt: now.toISOString()
	};
}

/**
 * 7. PERSISTENT SAVE SINGLE ANSWER
 */
export async function saveAnswer(data: {
	attemptId: string;
	questionId: string;
	selectedAnswer: string;
}) {
	const { attemptId, questionId, selectedAnswer } = data;
	const now = new Date();

	if (isDatabaseConfigured && attemptId.includes('-') && questionId.includes('-')) {
		try {
			await prisma.answer.upsert({
				where: {
					attemptId_questionId: { attemptId, questionId }
				},
				update: {
					selectedAnswer,
					answeredAt: now
				},
				create: {
					attemptId,
					questionId,
					selectedAnswer,
					answeredAt: now
				}
			});
		} catch (err) {}
	}

	if (isSupabaseConfigured && attemptId.includes('-') && questionId.includes('-')) {
		try {
			await supabaseAdmin
				.from('answers')
				.upsert(
					{
						attempt_id: attemptId,
						question_id: questionId,
						selected_answer: selectedAnswer,
						answered_at: now.toISOString()
					},
					{ onConflict: 'attempt_id,question_id' }
				);
		} catch (err) {}
	}

	return { success: true };
}

/**
 * 8. PERSISTENT SUBMIT QUIZ ATTEMPT (Hitung Nilai & Simpan Permanen)
 */
export async function submitQuizAttempt(data: {
	attemptId?: string;
	studentName: string;
	nim: string;
	programStudi?: string;
	whatsapp?: string | null;
	answers: Record<string, string>;
}) {
	const cleanName = data.studentName.trim();
	const cleanNim = data.nim.trim();
	const cleanProdi = data.programStudi?.trim() || 'Sains dan Teknologi';
	const cleanWa = data.whatsapp?.trim() || null;
	const studentEmail = `${cleanNim}@student.ut.ac.id`;
	const now = new Date();

	// 1. Calculate Score based on official 30 questions
	let correctCount = 0;
	const answersBreakdown = OFFICIAL_30_QUESTIONS.map((q) => {
		const studentChoice = (data.answers[q.id] || data.answers[q.questionNumber.toString()] || null)?.toUpperCase() || null;
		const isCorrect = studentChoice !== null && studentChoice === q.correctAnswer.toUpperCase();
		if (isCorrect) correctCount++;

		return {
			questionId: q.id,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			optionA: q.optionA,
			optionB: q.optionB,
			optionC: q.optionC,
			optionD: q.optionD,
			studentAnswer: studentChoice,
			correctAnswer: q.correctAnswer,
			isCorrect,
			explanation: q.explanation
		};
	});

	const totalQuestions = OFFICIAL_30_QUESTIONS.length;
	const wrongCount = totalQuestions - correctCount;
	const rawScore = (correctCount / totalQuestions) * 100;
	const score = Math.round(rawScore * 100) / 100;

	let attemptId = data.attemptId || 'att-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
	let studentId = 'std-' + cleanNim;
	let quizId = '11111111-1111-1111-1111-111111111111';

	// 2. Persist to Prisma
	if (isDatabaseConfigured) {
		try {
			let profile = await prisma.profile.findFirst({
				where: { OR: [{ nim: cleanNim }, { email: studentEmail }] }
			});

			if (profile) {
				profile = await prisma.profile.update({
					where: { id: profile.id },
					data: { fullName: cleanName, programStudi: cleanProdi, whatsapp: cleanWa }
				});
			} else {
				profile = await prisma.profile.create({
					data: {
						fullName: cleanName,
						nim: cleanNim,
						email: studentEmail,
						programStudi: cleanProdi,
						whatsapp: cleanWa,
						role: 'mahasiswa'
					}
				});
			}

			studentId = profile.id;

			let targetAttempt: any = null;
			if (data.attemptId && data.attemptId.includes('-') && data.attemptId.length === 36) {
				targetAttempt = await prisma.quizAttempt.findUnique({ where: { id: data.attemptId } });
			}

			if (!targetAttempt) {
				targetAttempt = await prisma.quizAttempt.findFirst({
					where: { studentId: profile.id, status: 'in_progress' },
					orderBy: { startedAt: 'desc' }
				});
			}

			if (!targetAttempt) {
				let qz = await prisma.quiz.findFirst();
				targetAttempt = await prisma.quizAttempt.create({
					data: {
						quizId: qz?.id || quizId,
						studentId: profile.id,
						status: 'in_progress',
						startedAt: now,
						totalQuestions
					}
				});
			}

			if (targetAttempt) {
				attemptId = targetAttempt.id;
				quizId = targetAttempt.quizId;

				// Save answers
				for (const item of answersBreakdown) {
					if (item.questionId && item.questionId.includes('-')) {
						try {
							await prisma.answer.upsert({
								where: {
									attemptId_questionId: {
										attemptId,
										questionId: item.questionId
									}
								},
								update: {
									selectedAnswer: item.studentAnswer,
									isCorrect: item.isCorrect,
									answeredAt: now
								},
								create: {
									attemptId,
									questionId: item.questionId,
									selectedAnswer: item.studentAnswer,
									isCorrect: item.isCorrect,
									answeredAt: now
								}
							});
						} catch (ansErr) {}
					}
				}

				// Update attempt status
				await prisma.quizAttempt.update({
					where: { id: attemptId },
					data: {
						status: 'completed',
						submittedAt: now,
						score,
						correctCount,
						wrongCount,
						totalQuestions
					}
				});
			}
		} catch (prismaErr) {
			console.warn('Prisma error during submit, continuing with Supabase REST API:', prismaErr);
		}
	}

	// 3. Persist to Supabase REST
	if (isSupabaseConfigured) {
		try {
			const { data: supaProf } = await supabaseAdmin
				.from('profiles')
				.upsert(
					{
						full_name: cleanName,
						nim: cleanNim,
						email: studentEmail,
						program_studi: cleanProdi,
						whatsapp: cleanWa,
						role: 'mahasiswa'
					},
					{ onConflict: 'nim' }
				)
				.select('id')
				.maybeSingle();

			if (supaProf) studentId = supaProf.id;

			// Upsert attempt in Supabase
			const { data: supaAtt } = await supabaseAdmin
				.from('quiz_attempts')
				.upsert(
					{
						id: attemptId.includes('-') && attemptId.length === 36 ? attemptId : undefined,
						quiz_id: quizId,
						student_id: studentId,
						status: 'completed',
						submitted_at: now.toISOString(),
						score,
						correct_count: correctCount,
						wrong_count: wrongCount,
						total_questions: totalQuestions
					},
					{ onConflict: 'id' }
				)
				.select('id')
				.maybeSingle();

			if (supaAtt) attemptId = supaAtt.id;
		} catch (supaErr) {
			console.warn('Supabase REST submit error:', supaErr);
		}
	}

	// 4. Mirror to In-Memory Cache
	const finalRecord: ParticipantAttempt = {
		id: attemptId,
		quizId,
		studentId,
		status: 'completed',
		score,
		correctCount,
		wrongCount,
		totalQuestions,
		startedAt: now,
		submittedAt: now,
		student: {
			id: studentId,
			fullName: cleanName,
			nim: cleanNim,
			email: studentEmail,
			programStudi: cleanProdi,
			whatsapp: cleanWa,
			role: 'mahasiswa',
			createdAt: now
		},
		quiz: {
			id: quizId,
			title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
		},
		answers: answersBreakdown
	};

	recordAttempt(finalRecord);

	return {
		success: true,
		attemptId,
		studentName: cleanName,
		nim: cleanNim,
		programStudi: cleanProdi,
		score,
		correctCount,
		wrongCount,
		totalQuestions,
		submittedAt: now.toISOString(),
		answersBreakdown
	};
}
