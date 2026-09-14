import { prisma, isDatabaseConfigured } from './prisma';
import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import {
	getAllAttempts as getMemoryAttempts,
	recordAttempt,
	type ParticipantAttempt
} from './participantStore';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';
export { OFFICIAL_30_QUESTIONS };

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
	optionA?: string;
	optionB?: string;
	optionC?: string;
	optionD?: string;
	studentAnswer: string | null;
	correctAnswer: string;
	isCorrect: boolean | null;
	status: 'Sesuai' | 'Perlu Evaluasi' | 'Sudah Dijawab' | 'Belum Dijawab' | string;
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(val: any): boolean {
	return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

/**
 * Deterministic Question UUID Resolver:
 * Ensures questionId ('q-01', '1', 'num_1', etc.) maps to a valid UUID
 * matching the Supabase questions table migration.
 */
export function resolveQuestionUuid(questionIdOrNum: any): string {
	if (typeof questionIdOrNum === 'string' && isUuid(questionIdOrNum)) {
		return questionIdOrNum.trim();
	}
	const str = String(questionIdOrNum || '');
	const numMatch = str.match(/\d+/);
	if (numMatch) {
		const num = parseInt(numMatch[0], 10);
		if (num >= 1 && num <= 30) {
			return `00000000-0000-0000-0000-${String(num).padStart(12, '0')}`;
		}
	}
	return '00000000-0000-0000-0000-000000000001';
}

export function extractQuestionNumber(questionIdOrNum: any): number {
	const str = String(questionIdOrNum || '');
	const numMatch = str.match(/\d+/);
	if (numMatch) {
		const num = parseInt(numMatch[0], 10);
		if (num >= 1 && num <= 30) return num;
	}
	return 1;
}

/**
 * ULTRA-RESILIENT DATA LOADER:
 * 1. Queries Prisma (quiz_attempts & profiles)
 * 2. Queries Supabase REST API across all known tables (quiz_attempts, attempts, profiles, users, answers)
 * 3. Joins profiles + attempts + answers with multiple key strategies (id, student_id, nim, email)
 * 4. Merges with in-memory store
 */
async function fetchAllRawDataFromDatabase(): Promise<FormattedAttempt[]> {
	const attemptMap = new Map<string, FormattedAttempt>(); // Key: attemptId or student NIM

	// ==========================================
	// 1. FETCH VIA PRISMA (POSTGRESQL DIRECT)
	// ==========================================
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

			for (const att of prismaAttempts) {
				attemptMap.set(att.id, {
					id: att.id,
					quizId: att.quizId,
					studentId: att.studentId,
					status: att.status,
					score: att.score !== null && att.score !== undefined ? Number(att.score) : 0,
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
						id: att.quiz?.id || '11111111-1111-1111-1111-111111111111',
						title: att.quiz?.title || 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
					},
					answers: att.answers
				});
			}

			// Also fetch profiles that might not have an attempt row yet
			const prismaProfiles = await prisma.profile.findMany({
				where: { role: 'mahasiswa' }
			});

			const existingStudentIds = new Set(prismaAttempts.map((a) => a.studentId));
			for (const prof of prismaProfiles) {
				if (!existingStudentIds.has(prof.id)) {
					const profAttId = 'att-prof-' + prof.id;
					attemptMap.set(profAttId, {
						id: profAttId,
						quizId: '11111111-1111-1111-1111-111111111111',
						studentId: prof.id,
						status: 'in_progress',
						score: null,
						correctCount: 0,
						wrongCount: 0,
						totalQuestions: 30,
						startedAt: prof.createdAt,
						submittedAt: null,
						student: {
							id: prof.id,
							fullName: prof.fullName,
							nim: prof.nim,
							email: prof.email,
							programStudi: prof.programStudi,
							whatsapp: prof.whatsapp,
							role: prof.role,
							createdAt: prof.createdAt
						},
						quiz: {
							id: '11111111-1111-1111-1111-111111111111',
							title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
						},
						answers: []
					});
				}
			}
		} catch (prismaErr) {
			console.warn('Prisma query warning in fetchAllRawDataFromDatabase:', prismaErr);
		}
	}

	// ==========================================
	// 2. FETCH VIA SUPABASE REST API (SERVICE ROLE / DIRECT REST)
	// ==========================================
	if (isSupabaseConfigured) {
		try {
			// A. Fetch all profiles from Supabase
			let supaProfiles: any[] = [];
			const { data: pData } = await supabaseAdmin.from('profiles').select('*');
			if (pData && pData.length > 0) {
				supaProfiles = pData;
			} else {
				const { data: uData } = await supabaseAdmin.from('users').select('*');
				if (uData && uData.length > 0) supaProfiles = uData;
			}

			const profileById = new Map<string, any>();
			const profileByNim = new Map<string, any>();
			const profileByEmail = new Map<string, any>();

			for (const p of supaProfiles) {
				const nim = p.nim || p.student_nim || p.NIM || '';
				const id = p.id || p.user_id || '';
				const email = p.email || '';
				const normalizedProfile: StudentProfile = {
					id: id || 'std-' + (nim || Math.random().toString(36).substring(2, 8)),
					fullName: p.full_name || p.fullName || p.name || p.nama || 'Mahasiswa',
					nim: nim || '-',
					email: email || (nim ? `${nim}@student.ut.ac.id` : '-'),
					programStudi: p.program_studi || p.programStudi || p.prodi || 'Sains dan Teknologi',
					whatsapp: p.whatsapp || p.no_wa || p.phone || null,
					role: p.role || 'mahasiswa',
					createdAt: p.created_at || new Date()
				};

				if (id) profileById.set(id, normalizedProfile);
				if (nim && nim !== '-') profileByNim.set(nim, normalizedProfile);
				if (email && email !== '-') profileByEmail.set(email, normalizedProfile);
			}

			// B. Fetch all answers from Supabase
			let supaAnswers: any[] = [];
			const { data: ansData } = await supabaseAdmin.from('answers').select('*');
			if (ansData && ansData.length > 0) supaAnswers = ansData;

			const answersByAttemptId = new Map<string, any[]>();
			for (const a of supaAnswers) {
				const attId = a.attempt_id || a.attemptId;
				if (attId) {
					if (!answersByAttemptId.has(attId)) answersByAttemptId.set(attId, []);
					answersByAttemptId.get(attId)!.push({
						id: a.id,
						attemptId: attId,
						questionId: a.question_id || a.questionId,
						selectedAnswer: a.selected_answer || a.selectedAnswer,
						isCorrect: a.is_correct ?? a.isCorrect,
						answeredAt: a.answered_at || a.answeredAt
					});
				}
			}

			// C. Fetch all quiz attempts from Supabase
			let supaAttempts: any[] = [];
			const { data: attData } = await supabaseAdmin.from('quiz_attempts').select('*');
			if (attData && attData.length > 0) {
				supaAttempts = attData;
			} else {
				const { data: altAtt } = await supabaseAdmin.from('attempts').select('*');
				if (altAtt && altAtt.length > 0) supaAttempts = altAtt;
			}

			for (const att of supaAttempts) {
				const attId = att.id;
				const studentId = att.student_id || att.studentId || att.user_id;
				const matchedProfile: StudentProfile =
					profileById.get(studentId) ||
					profileByNim.get(att.nim || '') ||
					profileByEmail.get(att.email || '') || {
						id: studentId || 'std-unknown',
						fullName: att.student_name || att.fullName || 'Mahasiswa',
						nim: att.nim || '-',
						email: att.email || '-',
						programStudi: att.program_studi || att.programStudi || 'Sains dan Teknologi',
						whatsapp: att.whatsapp || null,
						role: 'mahasiswa',
						createdAt: att.started_at || new Date()
					};

				const answers = answersByAttemptId.get(attId) || [];

				if (!attemptMap.has(attId)) {
					attemptMap.set(attId, {
						id: attId,
						quizId: att.quiz_id || att.quizId || '11111111-1111-1111-1111-111111111111',
						studentId: matchedProfile.id,
						status: att.status || 'completed',
						score: att.score !== null && att.score !== undefined ? Number(att.score) : 0,
						correctCount: att.correct_count ?? att.correctCount ?? 0,
						wrongCount: att.wrong_count ?? att.wrongCount ?? 0,
						totalQuestions: att.total_questions ?? att.totalQuestions ?? 30,
						startedAt: att.started_at || att.startedAt || new Date(),
						submittedAt: att.submitted_at || att.submittedAt || null,
						student: matchedProfile,
						quiz: {
							id: att.quiz_id || '11111111-1111-1111-1111-111111111111',
							title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
						},
						answers
					});
				}
			}
		} catch (supaErr) {
			console.warn('Supabase REST query warning in fetchAllRawDataFromDatabase:', supaErr);
		}
	}

	// ==========================================
	// 3. MERGE IN-MEMORY STORE & SINKRONISASI
	// ==========================================
	const memoryAttempts = getMemoryAttempts();
	for (const mem of memoryAttempts) {
		if (!attemptMap.has(mem.id)) {
			attemptMap.set(mem.id, mem as any);
		}
	}

	const allResults = Array.from(attemptMap.values());

	// Mirror all to memory store
	for (const item of allResults) {
		recordAttempt(item as any);
	}

	return allResults;
}

/**
 * 1. GET ALL QUIZ ATTEMPTS (Daftar Peserta & Nilai Quiz)
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

	const allAttempts = await fetchAllRawDataFromDatabase();

	const prodiList = Array.from(
		new Set(allAttempts.map((a) => a.student?.programStudi).filter(Boolean))
	);

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
		return (b.score ?? 0) - (a.score ?? 0);
	});

	const totalCount = filtered.length;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

	return {
		attempts: paginated,
		totalCount,
		page,
		totalPages,
		prodiList,
		filters: { search, prodi, status, sort }
	};
}

/**
 * 2. GET ATTEMPT BY ID / NIM (Detail Jawaban 30 Soal)
 */
export async function getQuizAttemptById(idOrNim: string) {
	const allAttempts = await fetchAllRawDataFromDatabase();

	const attempt = allAttempts.find(
		(a) => a.id === idOrNim || a.student?.nim === idOrNim || a.studentId === idOrNim
	);

	if (!attempt) {
		return null;
	}

	const answerMap = new Map<string, any>();

	if (attempt.answers && attempt.answers.length > 0) {
		for (const a of attempt.answers) {
			const qId = a.questionId || a.question_id;
			const qNum = a.question?.questionNumber || a.question?.question_number || a.questionNumber;
			if (qId) answerMap.set(String(qId), a);
			if (qNum !== undefined && qNum !== null) answerMap.set(`num_${qNum}`, a);
		}
	}

	if (answerMap.size < OFFICIAL_30_QUESTIONS.length && isDatabaseConfigured && isUuid(attempt.id)) {
		try {
			const directPrismaAnswers = await prisma.answer.findMany({
				where: { attemptId: attempt.id },
				include: { question: true }
			});
			for (const a of directPrismaAnswers) {
				if (a.questionId) answerMap.set(String(a.questionId), a);
				if (a.question?.questionNumber) answerMap.set(`num_${a.question.questionNumber}`, a);
			}
		} catch (err) {
			console.warn('Prisma direct answers query notice:', err);
		}
	}

	if (answerMap.size < OFFICIAL_30_QUESTIONS.length && isSupabaseConfigured) {
		try {
			const { data: supaDirectAnswers } = await supabaseAdmin
				.from('answers')
				.select('*')
				.eq('attempt_id', attempt.id);

			if (supaDirectAnswers && supaDirectAnswers.length > 0) {
				for (const a of supaDirectAnswers) {
					const qId = a.question_id || a.questionId;
					const qNum = a.question_number || a.questionNumber || extractQuestionNumber(qId);
					if (qId) answerMap.set(String(qId), a);
					if (qNum) answerMap.set(`num_${qNum}`, a);
				}
			}
		} catch (supaErr) {
			console.warn('Supabase direct answers query notice:', supaErr);
		}
	}

	const detailedQuestions: DetailedAnswerItem[] = OFFICIAL_30_QUESTIONS.map((q) => {
		const deterministicUuid = resolveQuestionUuid(q.questionNumber);
		const ans =
			answerMap.get(String(q.id)) ||
			answerMap.get(deterministicUuid) ||
			answerMap.get(`num_${q.questionNumber}`) ||
			answerMap.get(String(q.questionNumber));

		const studentChoice = (
			ans?.selectedAnswer ||
			ans?.selected_answer ||
			ans?.jawaban ||
			ans?.studentAnswer ||
			null
		);

		const evaluation = evaluateQuestionAnswer(q.questionNumber, studentChoice);
		const isGraded = ans?.isCorrect !== undefined && ans?.isCorrect !== null;
		const isCorrect = isGraded ? Boolean(ans.isCorrect) : (studentChoice ? evaluation.isCorrect : null);
		const status: string = studentChoice && String(studentChoice).trim() !== ''
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
	const allAttempts = await fetchAllRawDataFromDatabase();

	const completedAttempts = allAttempts.filter((a) => a.status === 'completed' && a.score !== null);
	const totalParticipants = allAttempts.length;
	const totalCompleted = completedAttempts.length;
	const totalInProgress = allAttempts.filter((a) => a.status === 'in_progress').length;

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

	const uniqueStudents = new Set(allAttempts.map((a) => a.student?.nim)).size;

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
		recentAttempts: allAttempts.slice(0, 6)
	};
}

/**
 * 4. GET HASIL & STATISTIK
 */
export async function getHasilStatistics() {
	const allAttempts = await fetchAllRawDataFromDatabase();
	const completed = allAttempts.filter((a) => a.status === 'completed');

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
 * 5. GET ALL MAHASISWA
 */
export async function getAllMahasiswa(params: { search?: string; prodi?: string } = {}) {
	const { search = '', prodi = '' } = params;
	const allAttempts = await fetchAllRawDataFromDatabase();

	const studentMap = new Map<string, any>();

	for (const att of allAttempts) {
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
 * 6. START QUIZ ATTEMPT (WITH RECOVERY OF EXISTING IN-PROGRESS STATE)
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

	let attemptId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0');
	let studentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'std-' + cleanNim;
	let quizId = '11111111-1111-1111-1111-111111111111';
	const savedAnswers: Record<string, string> = {};

	// 1. SUPABASE PROFILE & ATTEMPT MANAGEMENT
	if (isSupabaseConfigured) {
		try {
			// Ensure Quiz row exists
			await supabaseAdmin.from('quizzes').upsert({
				id: quizId,
				title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
				duration_minutes: 60,
				is_active: true
			}, { onConflict: 'id' });

			// Upsert Profile
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

			if (supaProf && supaProf.id) {
				studentId = supaProf.id;
			}

			// Check if student already has an in_progress attempt
			const { data: existingSupaAttempt } = await supabaseAdmin
				.from('quiz_attempts')
				.select('id, started_at, status')
				.eq('student_id', studentId)
				.eq('quiz_id', quizId)
				.eq('status', 'in_progress')
				.order('started_at', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (existingSupaAttempt && existingSupaAttempt.id) {
				attemptId = existingSupaAttempt.id;
			} else {
				// Create new attempt row in Supabase
				const { data: newSupaAtt } = await supabaseAdmin
					.from('quiz_attempts')
					.insert({
						id: attemptId,
						quiz_id: quizId,
						student_id: studentId,
						status: 'in_progress',
						started_at: now.toISOString(),
						total_questions: 30
					})
					.select('id')
					.maybeSingle();

				if (newSupaAtt && newSupaAtt.id) {
					attemptId = newSupaAtt.id;
				}
			}

			// Load any existing answers for this attempt from Supabase
			const { data: existingAnswers } = await supabaseAdmin
				.from('answers')
				.select('question_id, selected_answer')
				.eq('attempt_id', attemptId);

			if (existingAnswers && existingAnswers.length > 0) {
				for (const a of existingAnswers) {
					if (a.selected_answer) {
						const num = extractQuestionNumber(a.question_id);
						savedAnswers[a.question_id] = a.selected_answer;
						savedAnswers[`q-${String(num).padStart(2, '0')}`] = a.selected_answer;
						savedAnswers[String(num)] = a.selected_answer;
					}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase startQuizAttempt warning:', supaErr);
		}
	}

	// 2. PRISMA BACKEND SINKRONISASI
	if (isDatabaseConfigured) {
		try {
			let quiz = await prisma.quiz.findFirst();
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
						id: isUuid(studentId) ? studentId : undefined,
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

			let targetAttempt = await prisma.quizAttempt.findFirst({
				where: { studentId: profile.id, quizId, status: 'in_progress' },
				orderBy: { startedAt: 'desc' },
				include: { answers: true }
			});

			if (!targetAttempt) {
				targetAttempt = await prisma.quizAttempt.create({
					data: {
						id: isUuid(attemptId) ? attemptId : undefined,
						quizId,
						studentId: profile.id,
						status: 'in_progress',
						startedAt: now,
						totalQuestions: 30
					},
					include: { answers: true }
				});
			}

			if (targetAttempt) {
				attemptId = targetAttempt.id;
				if (targetAttempt.answers) {
					for (const ans of targetAttempt.answers) {
						if (ans.selectedAnswer) {
							const num = extractQuestionNumber(ans.questionId);
							savedAnswers[ans.questionId] = ans.selectedAnswer;
							savedAnswers[`q-${String(num).padStart(2, '0')}`] = ans.selectedAnswer;
							savedAnswers[String(num)] = ans.selectedAnswer;
						}
					}
				}
			}
		} catch (prismaErr) {
			console.warn('Prisma startQuizAttempt notice:', prismaErr);
		}
	}

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
		startedAt: now.toISOString(),
		savedAnswers
	};
}

/**
 * 7. LOAD ATTEMPT & ANSWERS FOR REFRESH RECOVERY
 */
export async function loadAttemptAnswers(params: { attemptId?: string; nim?: string }) {
	const { attemptId, nim } = params;
	const savedAnswers: Record<string, string> = {};
	let activeAttempt: any = null;
	let studentProfile: any = null;

	// A. Query Supabase
	if (isSupabaseConfigured) {
		try {
			if (attemptId && isUuid(attemptId)) {
				const { data: att } = await supabaseAdmin
					.from('quiz_attempts')
					.select('*, profiles(*)')
					.eq('id', attemptId)
					.maybeSingle();
				if (att) {
					activeAttempt = att;
					studentProfile = att.profiles;
				}
			} else if (nim) {
				const { data: prof } = await supabaseAdmin
					.from('profiles')
					.select('id, full_name, nim, email, program_studi, whatsapp, role')
					.eq('nim', nim)
					.maybeSingle();

				if (prof) {
					studentProfile = prof;
					const { data: att } = await supabaseAdmin
						.from('quiz_attempts')
						.select('*')
						.eq('student_id', prof.id)
						.order('started_at', { ascending: false })
						.limit(1)
						.maybeSingle();
					if (att) activeAttempt = att;
				}
			}

			const targetAttemptId = activeAttempt?.id || attemptId;
			if (targetAttemptId && isUuid(targetAttemptId)) {
				const { data: supaAnswers } = await supabaseAdmin
					.from('answers')
					.select('question_id, selected_answer, is_correct')
					.eq('attempt_id', targetAttemptId);

				if (supaAnswers && supaAnswers.length > 0) {
					for (const ans of supaAnswers) {
						if (ans.selected_answer) {
							const num = extractQuestionNumber(ans.question_id);
							savedAnswers[ans.question_id] = ans.selected_answer;
							savedAnswers[`q-${String(num).padStart(2, '0')}`] = ans.selected_answer;
							savedAnswers[String(num)] = ans.selected_answer;
						}
					}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase loadAttemptAnswers notice:', supaErr);
		}
	}

	// B. Query Prisma as secondary source
	if (isDatabaseConfigured && Object.keys(savedAnswers).length === 0) {
		try {
			const targetAttId = activeAttempt?.id || attemptId;
			if (targetAttId && isUuid(targetAttId)) {
				const prismaAnswers = await prisma.answer.findMany({
					where: { attemptId: targetAttId },
					include: { question: true }
				});
				for (const a of prismaAnswers) {
					if (a.selectedAnswer) {
						const num = a.question?.questionNumber || extractQuestionNumber(a.questionId);
						savedAnswers[a.questionId] = a.selectedAnswer;
						savedAnswers[`q-${String(num).padStart(2, '0')}`] = a.selectedAnswer;
						savedAnswers[String(num)] = a.selectedAnswer;
					}
				}
			}
		} catch (prismaErr) {
			console.warn('Prisma loadAttemptAnswers notice:', prismaErr);
		}
	}

	return {
		success: true,
		attempt: activeAttempt,
		student: studentProfile,
		savedAnswers,
		isCompleted: activeAttempt?.status === 'completed'
	};
}

/**
 * 8. SAVE ANSWER (ATOMIC ESSAY PERSISTENCE IN SUPABASE & PRISMA)
 */
export async function saveAnswer(data: {
	attemptId: string;
	questionId: string;
	selectedAnswer: string;
}) {
	const { attemptId, questionId, selectedAnswer } = data;
	const now = new Date();

	const resolvedQuestionUuid = resolveQuestionUuid(questionId);
	const questionNumber = extractQuestionNumber(questionId);
	const evalResult = evaluateQuestionAnswer(questionNumber, selectedAnswer);

	// A. SUPABASE REAL-TIME UPSERT
	if (isSupabaseConfigured && isUuid(attemptId)) {
		try {
			// Ensure question exists in Supabase to avoid FK error
			const defaultQuizId = '11111111-1111-1111-1111-111111111111';
			const refQuestion = OFFICIAL_30_QUESTIONS.find((q) => q.questionNumber === questionNumber);

			await supabaseAdmin.from('questions').upsert({
				id: resolvedQuestionUuid,
				quiz_id: defaultQuizId,
				question_number: questionNumber,
				section: refQuestion?.section || 'Materi Kaderisasi',
				question_text: refQuestion?.questionText || 'Pertanyaan essay...',
				correct_answer: refQuestion?.correctAnswer || 'Referensi jawaban...',
				explanation: refQuestion?.explanation || ''
			}, { onConflict: 'id' });

			// Upsert answer to Supabase answers table
			const { error: supaErr } = await supabaseAdmin.from('answers').upsert(
				{
					attempt_id: attemptId,
					question_id: resolvedQuestionUuid,
					selected_answer: selectedAnswer,
					is_correct: evalResult.isCorrect,
					answered_at: now.toISOString()
				},
				{ onConflict: 'attempt_id,question_id' }
			);

			if (supaErr) {
				console.error('Supabase answers upsert error:', supaErr);
			}
		} catch (supaErr) {
			console.warn('Supabase saveAnswer catch notice:', supaErr);
		}
	}

	// B. PRISMA DIRECT UPSERT
	if (isDatabaseConfigured && isUuid(attemptId) && isUuid(resolvedQuestionUuid)) {
		try {
			await prisma.answer.upsert({
				where: {
					attemptId_questionId: { attemptId, questionId: resolvedQuestionUuid }
				},
				update: {
					selectedAnswer: selectedAnswer,
					isCorrect: evalResult.isCorrect,
					answeredAt: now
				},
				create: {
					attemptId,
					questionId: resolvedQuestionUuid,
					selectedAnswer: selectedAnswer,
					isCorrect: evalResult.isCorrect,
					answeredAt: now
				}
			});
		} catch (err) {
			console.warn('Prisma saveAnswer notice:', err);
		}
	}

	return {
		success: true,
		attemptId,
		questionId,
		questionUuid: resolvedQuestionUuid,
		savedAt: now.toISOString()
	};
}

const INDONESIAN_STOPWORDS = new Set([
	'yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'adalah', 'sebagai', 'dalam',
	'dengan', 'atau', 'itu', 'ini', 'agar', 'serta', 'demi', 'secara', 'karena', 'tersebut',
	'bisa', 'akan', 'dapat', 'harus', 'maupun', 'oleh', 'juga', 'saat', 'sudah', 'lebih',
	'setiap', 'antara', 'tanpa', 'bagi', 'kepadanya', 'mereka', 'kita', 'saya', 'kamu'
]);

export function evaluateQuestionAnswer(
	questionNumber: number,
	studentAnswer: string | null | undefined
): { isCorrect: boolean; normalizedChoice: string | null; points: number } {
	if (!studentAnswer || typeof studentAnswer !== 'string') {
		return { isCorrect: false, normalizedChoice: null, points: 0 };
	}

	const raw = studentAnswer.trim();
	if (!raw || raw.length < 3) {
		return { isCorrect: false, normalizedChoice: null, points: 0 };
	}

	const q = OFFICIAL_30_QUESTIONS.find((item) => item.questionNumber === questionNumber);
	if (!q) {
		return { isCorrect: true, normalizedChoice: raw, points: 100 / 30 };
	}

	const weight = 100 / 30; // ~3.333 poin per butir

	// 1. Calculate word count & depth
	const words = raw.toLowerCase().match(/[a-z0-9]+/g) || [];
	const wordCount = words.length;

	let depthRatio = 0.4;
	if (wordCount >= 20) depthRatio = 1.0;
	else if (wordCount >= 12) depthRatio = 0.85;
	else if (wordCount >= 7) depthRatio = 0.7;
	else if (wordCount >= 4) depthRatio = 0.55;

	// 2. Extract keywords from reference answer and explanation
	const refText = `${q.correctAnswer} ${q.explanation || ''}`.toLowerCase();
	const refWords = Array.from(new Set(refText.match(/[a-z0-9]{4,}/g) || [])).filter(
		(w) => !INDONESIAN_STOPWORDS.has(w)
	);

	let matchedKeywords = 0;
	if (refWords.length > 0) {
		const studentText = raw.toLowerCase();
		for (const w of refWords) {
			if (studentText.includes(w) || (w.length >= 5 && studentText.includes(w.substring(0, w.length - 2)))) {
				matchedKeywords++;
			}
		}
	}

	const keywordRatio = refWords.length > 0 ? Math.min(1.0, (matchedKeywords / Math.min(6, refWords.length)) * 1.2) : 0.8;

	// 3. Combined essay quality ratio (0.0 to 1.0)
	let finalRatio = depthRatio * 0.35 + keywordRatio * 0.65;
	if (wordCount >= 10 && finalRatio < 0.6) {
		finalRatio = 0.6;
	}
	if (wordCount >= 25 && finalRatio < 0.8) {
		finalRatio = 0.85;
	}

	finalRatio = Math.max(0.1, Math.min(1.0, finalRatio));

	const points = Math.round(finalRatio * weight * 100) / 100;
	const isCorrect = points >= weight * 0.5;

	return {
		isCorrect,
		normalizedChoice: raw,
		points
	};
}

export const evaluateEssayItem = (qNum: number, text: string | null) => evaluateQuestionAnswer(qNum, text);

/**
 * 9. SUBMIT QUIZ ATTEMPT (SAVES ALL 30 ESSAY ANSWERS & WRITES REKAP TO SUPABASE)
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

	let answeredCount = 0;
	let correctCount = 0;
	let totalEarnedPoints = 0;

	const answersBreakdown = OFFICIAL_30_QUESTIONS.map((q) => {
		const deterministicUuid = resolveQuestionUuid(q.questionNumber);
		const rawAns =
			data.answers[q.id] ??
			data.answers[deterministicUuid] ??
			data.answers[q.questionNumber.toString()] ??
			data.answers[`num_${q.questionNumber}`] ??
			data.answers[`q-${String(q.questionNumber).padStart(2, '0')}`] ??
			null;

		const studentChoice = typeof rawAns === 'string' && rawAns.trim() !== '' ? rawAns.trim() : null;
		const evaluation = evaluateQuestionAnswer(q.questionNumber, studentChoice);

		if (studentChoice !== null) {
			answeredCount++;
			totalEarnedPoints += evaluation.points;
			if (evaluation.isCorrect) correctCount++;
		}

		return {
			questionId: deterministicUuid,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			studentAnswer: studentChoice,
			correctAnswer: q.correctAnswer,
			isCorrect: evaluation.isCorrect,
			points: evaluation.points,
			explanation: q.explanation
		};
	});

	const totalQuestions = OFFICIAL_30_QUESTIONS.length;
	const wrongCount = totalQuestions - correctCount;
	const computedScore = Math.min(100, Math.round(totalEarnedPoints));
	const score: number = computedScore;

	let attemptId = data.attemptId && isUuid(data.attemptId) ? data.attemptId : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0'));
	let studentId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'std-' + cleanNim;
	let quizId = '11111111-1111-1111-1111-111111111111';

	// =========================================================================
	// 1. SUPABASE PERSISTENCE (PROFILES, QUIZ_ATTEMPTS, ALL 30 ANSWERS)
	// =========================================================================
	if (isSupabaseConfigured) {
		try {
			// Ensure Quiz row exists
			await supabaseAdmin.from('quizzes').upsert({
				id: quizId,
				title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
				duration_minutes: 60,
				is_active: true
			}, { onConflict: 'id' });

			// Upsert Profile
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

			if (supaProf && supaProf.id) {
				studentId = supaProf.id;
			}

			// Ensure all 30 questions exist in Supabase
			const supaQuestionRows = OFFICIAL_30_QUESTIONS.map((q) => ({
				id: resolveQuestionUuid(q.questionNumber),
				quiz_id: quizId,
				question_number: q.questionNumber,
				section: q.section,
				question_text: q.questionText,
				correct_answer: q.correctAnswer,
				explanation: q.explanation || ''
			}));

			await supabaseAdmin.from('questions').upsert(supaQuestionRows, { onConflict: 'id' });

			// Upsert Attempt to Completed
			const { data: supaAtt } = await supabaseAdmin
				.from('quiz_attempts')
				.upsert(
					{
						id: attemptId,
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

			if (supaAtt && supaAtt.id) {
				attemptId = supaAtt.id;
			}

			// Upsert all 30 essay answers into Supabase answers table
			const answersPayload = answersBreakdown.map((item) => ({
				attempt_id: attemptId,
				question_id: item.questionId,
				selected_answer: item.studentAnswer,
				is_correct: item.isCorrect,
				answered_at: now.toISOString()
			}));

			const { error: batchErr } = await supabaseAdmin
				.from('answers')
				.upsert(answersPayload, { onConflict: 'attempt_id,question_id' });

			if (batchErr) {
				console.error('Supabase batch answers upsert error:', batchErr);
			}
		} catch (supaErr) {
			console.error('Supabase REST submit error:', supaErr);
		}
	}

	// =========================================================================
	// 2. PRISMA PERSISTENCE
	// =========================================================================
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
						id: isUuid(studentId) ? studentId : undefined,
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
			if (isUuid(attemptId)) {
				targetAttempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
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
						id: isUuid(attemptId) ? attemptId : undefined,
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

				for (const item of answersBreakdown) {
					if (isUuid(item.questionId) && isUuid(attemptId)) {
						try {
							await prisma.answer.upsert({
								where: {
									attemptId_questionId: { attemptId, questionId: item.questionId }
								},
								update: {
									selectedAnswer: item.studentAnswer || '',
									isCorrect: item.isCorrect,
									answeredAt: now
								},
								create: {
									attemptId,
									questionId: item.questionId,
									selectedAnswer: item.studentAnswer || '',
									isCorrect: item.isCorrect,
									answeredAt: now
								}
							});
						} catch (ansErr) {}
					}
				}

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
			console.warn('Prisma error during submit:', prismaErr);
		}
	}

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
		answeredCount,
		correctCount,
		wrongCount,
		totalQuestions,
		submittedAt: now.toISOString(),
		answersBreakdown
	};
}

/**
 * 10. GRADE ESSAY QUIZ ATTEMPT (ADMIN MANUAL EVALUATION)
 */
export async function gradeQuizAttempt(data: {
	attemptId: string;
	score: number;
	feedback?: string | null;
	questionGrades?: Array<{
		questionId: string;
		isCorrect?: boolean | null;
		score?: number;
	}>;
}) {
	const { attemptId, score, feedback, questionGrades } = data;
	const roundedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

	let correctCount = 0;
	let wrongCount = 0;

	if (questionGrades && questionGrades.length > 0) {
		for (const q of questionGrades) {
			if (q.isCorrect === true) correctCount++;
			else if (q.isCorrect === false) wrongCount++;
		}
	}

	if (isDatabaseConfigured && isUuid(attemptId)) {
		try {
			await prisma.quizAttempt.update({
				where: { id: attemptId },
				data: {
					score: roundedScore,
					correctCount: correctCount || undefined,
					wrongCount: wrongCount || undefined,
					status: 'completed'
				}
			});

			if (questionGrades && questionGrades.length > 0) {
				for (const q of questionGrades) {
					const qUuid = resolveQuestionUuid(q.questionId);
					if (isUuid(qUuid)) {
						try {
							await prisma.answer.updateMany({
								where: {
									attemptId,
									questionId: qUuid
								},
								data: {
									isCorrect: q.isCorrect ?? undefined
								}
							});
						} catch (e) {}
					}
				}
			}
		} catch (err) {
			console.warn('Prisma grade notice:', err);
		}
	}

	if (isSupabaseConfigured && isUuid(attemptId)) {
		try {
			await supabaseAdmin
				.from('quiz_attempts')
				.update({
					score: roundedScore,
					correct_count: correctCount || undefined,
					wrong_count: wrongCount || undefined,
					status: 'completed'
				})
				.eq('id', attemptId);

			if (questionGrades && questionGrades.length > 0) {
				for (const q of questionGrades) {
					const qUuid = resolveQuestionUuid(q.questionId);
					if (isUuid(qUuid)) {
						try {
							await supabaseAdmin
								.from('answers')
								.update({
									is_correct: q.isCorrect
								})
								.eq('attempt_id', attemptId)
								.eq('question_id', qUuid);
						} catch (e) {}
					}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase grade notice:', supaErr);
		}
	}

	const memoryAttempts = getMemoryAttempts();
	const existing = memoryAttempts.find((a) => a.id === attemptId);
	if (existing) {
		existing.score = roundedScore;
		existing.status = 'completed';
		if (correctCount) existing.correctCount = correctCount;
		if (wrongCount) existing.wrongCount = wrongCount;
		recordAttempt(existing);
	}

	return {
		success: true,
		attemptId,
		score: roundedScore,
		message: 'Penilaian berhasil disimpan.'
	};
}

/**
 * 11. RECALCULATE SINGLE ATTEMPT SCORE
 */
export async function recalculateAttemptById(attemptIdOrNim: string) {
	const detail = await getQuizAttemptById(attemptIdOrNim);
	if (!detail || !detail.attempt) {
		return { success: false, error: 'Data pengerjaan tidak ditemukan.' };
	}

	const { attempt, detailedQuestions } = detail;
	let correctCount = 0;
	let answeredCount = 0;
	let totalEarnedPoints = 0;

	const evaluatedAnswers = detailedQuestions.map((item) => {
		const evalRes = evaluateQuestionAnswer(item.questionNumber, item.studentAnswer);
		if (item.studentAnswer && String(item.studentAnswer).trim() !== '') {
			answeredCount++;
			totalEarnedPoints += evalRes.points;
			if (evalRes.isCorrect) correctCount++;
		}
		return {
			questionNumber: item.questionNumber,
			questionId: resolveQuestionUuid(item.questionNumber),
			studentAnswer: item.studentAnswer,
			isCorrect: evalRes.isCorrect,
			points: evalRes.points
		};
	});

	const totalQuestions = OFFICIAL_30_QUESTIONS.length;
	const wrongCount = totalQuestions - correctCount;
	const score = Math.min(100, Math.round(totalEarnedPoints));

	if (isDatabaseConfigured && isUuid(attempt.id)) {
		try {
			await prisma.quizAttempt.update({
				where: { id: attempt.id },
				data: {
					score,
					correctCount,
					wrongCount,
					totalQuestions,
					status: 'completed'
				}
			});

			for (const ans of evaluatedAnswers) {
				if (isUuid(ans.questionId)) {
					try {
						await prisma.answer.updateMany({
							where: {
								attemptId: attempt.id,
								questionId: ans.questionId
							},
							data: {
								selectedAnswer: ans.studentAnswer || undefined,
								isCorrect: ans.isCorrect
							}
						});
					} catch (e) {}
				}
			}
		} catch (prismaErr) {
			console.warn('Prisma recalculate notice:', prismaErr);
		}
	}

	if (isSupabaseConfigured && isUuid(attempt.id)) {
		try {
			await supabaseAdmin
				.from('quiz_attempts')
				.update({
					score,
					correct_count: correctCount,
					wrong_count: wrongCount,
					total_questions: totalQuestions,
					status: 'completed'
				})
				.eq('id', attempt.id);

			for (const ans of evaluatedAnswers) {
				if (isUuid(ans.questionId)) {
					try {
						await supabaseAdmin
							.from('answers')
							.update({
								selected_answer: ans.studentAnswer || undefined,
								is_correct: ans.isCorrect
							})
							.eq('attempt_id', attempt.id)
							.eq('question_id', ans.questionId);
					} catch (e) {}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase recalculate notice:', supaErr);
		}
	}

	const memoryAttempts = getMemoryAttempts();
	const existing = memoryAttempts.find(
		(a) => a.id === attempt.id || (attempt.student?.nim && a.student?.nim === attempt.student?.nim)
	);
	if (existing) {
		existing.score = score;
		existing.correctCount = correctCount;
		existing.wrongCount = wrongCount;
		existing.status = 'completed';
		recordAttempt(existing);
	}

	return {
		success: true,
		attemptId: attempt.id,
		score,
		correctCount,
		wrongCount,
		totalQuestions,
		answeredCount,
		passed: score >= 65
	};
}

/**
 * 12. RECALCULATE ALL ATTEMPTS
 */
export async function recalculateAllAttempts() {
	const allAttempts = await fetchAllRawDataFromDatabase();
	let updatedCount = 0;

	for (const att of allAttempts) {
		try {
			const res = await recalculateAttemptById(att.id);
			if (res.success) updatedCount++;
		} catch (e) {
			console.warn(`Failed to recalculate attempt ${att.id}:`, e);
		}
	}

	return {
		success: true,
		totalAttempts: allAttempts.length,
		updatedCount,
		message: `Berhasil menghitung ulang nilai ${updatedCount} dari ${allAttempts.length} data pengerjaan peserta secara akurat.`
	};
}
