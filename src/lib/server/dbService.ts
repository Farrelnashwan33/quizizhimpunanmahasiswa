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
				// Alternative table name
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

	// Extract unique prodi list
	const prodiList = Array.from(
		new Set(allAttempts.map((a) => a.student?.programStudi).filter(Boolean))
	);

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

	// Build map of student answers
	const answerMap = new Map<string, any>();

	// Add pre-loaded answers
	if (attempt.answers && attempt.answers.length > 0) {
		for (const a of attempt.answers) {
			const qId = a.questionId || a.question_id;
			const qNum = a.question?.questionNumber || a.question?.question_number || a.questionNumber;
			if (qId) answerMap.set(String(qId), a);
			if (qNum !== undefined && qNum !== null) answerMap.set(`num_${qNum}`, a);
		}
	}

	// Targeted query via Prisma if answerMap is empty or small
	if (answerMap.size < OFFICIAL_30_QUESTIONS.length && isDatabaseConfigured && attempt.id.includes('-')) {
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

	// Targeted query via Supabase REST if answerMap is still incomplete
	if (answerMap.size < OFFICIAL_30_QUESTIONS.length && isSupabaseConfigured) {
		try {
			// Query by attempt_id
			const { data: supaDirectAnswers } = await supabaseAdmin
				.from('answers')
				.select('*')
				.eq('attempt_id', attempt.id);

			if (supaDirectAnswers && supaDirectAnswers.length > 0) {
				for (const a of supaDirectAnswers) {
					const qId = a.question_id || a.questionId;
					const qNum = a.question_number || a.questionNumber;
					if (qId) answerMap.set(String(qId), a);
					if (qNum !== undefined && qNum !== null) answerMap.set(`num_${qNum}`, a);
				}
			}

			// Also try alternative table names if empty
			if (answerMap.size === 0) {
				const { data: altAnswers } = await supabaseAdmin
					.from('jawaban')
					.select('*')
					.eq('attempt_id', attempt.id);
				if (altAnswers && altAnswers.length > 0) {
					for (const a of altAnswers) {
						const qId = a.question_id || a.questionId;
						const qNum = a.question_number || a.questionNumber || a.nomor_soal;
						if (qId) answerMap.set(String(qId), a);
						if (qNum !== undefined && qNum !== null) answerMap.set(`num_${qNum}`, a);
					}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase direct answers query notice:', supaErr);
		}
	}

	// Build detailed 30 questions breakdown
	const detailedQuestions: DetailedAnswerItem[] = OFFICIAL_30_QUESTIONS.map((q) => {
		const ans =
			answerMap.get(String(q.id)) ||
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
 * 6. START QUIZ ATTEMPT
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
			console.warn('Prisma start notice:', prismaErr);
		}
	}

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

			if (supaAtt) attemptId = supaAtt.id;
		} catch (supaErr) {
			console.warn('Supabase REST start notice:', supaErr);
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
		startedAt: now.toISOString()
	};
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(val: any): boolean {
	return typeof val === 'string' && UUID_REGEX.test(val);
}

/**
 * 7. SAVE ANSWER
 */
export async function saveAnswer(data: {
	attemptId: string;
	questionId: string;
	selectedAnswer: string;
}) {
	const { attemptId, questionId, selectedAnswer } = data;
	const now = new Date();

	let resolvedQuestionId: string | null = isUuid(questionId) ? questionId : null;
	const numMatch = questionId.match(/\d+/);
	const num = numMatch ? parseInt(numMatch[0], 10) : null;
	const evalResult = num !== null ? evaluateQuestionAnswer(num, selectedAnswer) : null;

	if (!resolvedQuestionId && isDatabaseConfigured) {
		if (num !== null) {
			try {
				const q = await prisma.question.findFirst({
					where: { questionNumber: num }
				});
				if (q && isUuid(q.id)) {
					resolvedQuestionId = q.id;
				}
			} catch (e) {}
		}
	}

	if (isDatabaseConfigured && isUuid(attemptId) && resolvedQuestionId && isUuid(resolvedQuestionId)) {
		try {
			await prisma.answer.upsert({
				where: {
					attemptId_questionId: { attemptId, questionId: resolvedQuestionId }
				},
				update: {
					selectedAnswer: evalResult?.normalizedChoice || selectedAnswer,
					isCorrect: evalResult ? evalResult.isCorrect : undefined,
					answeredAt: now
				},
				create: {
					attemptId,
					questionId: resolvedQuestionId,
					selectedAnswer: evalResult?.normalizedChoice || selectedAnswer,
					isCorrect: evalResult ? evalResult.isCorrect : undefined,
					answeredAt: now
				}
			});
		} catch (err) {
			console.warn('saveAnswer prisma notice:', err);
		}
	}

	if (isSupabaseConfigured && isUuid(attemptId) && resolvedQuestionId && isUuid(resolvedQuestionId)) {
		try {
			await supabaseAdmin.from('answers').upsert(
				{
					attempt_id: attemptId,
					question_id: resolvedQuestionId,
					selected_answer: evalResult?.normalizedChoice || selectedAnswer,
					is_correct: evalResult ? evalResult.isCorrect : undefined,
					answered_at: now.toISOString()
				},
				{ onConflict: 'attempt_id,question_id' }
			);
		} catch (err) {}
	}

	return { success: true };
}

export function evaluateQuestionAnswer(
	questionNumber: number,
	studentAnswer: string | null | undefined
): { isCorrect: boolean; normalizedChoice: 'A' | 'B' | 'C' | 'D' | string | null; points: number } {
	if (!studentAnswer || typeof studentAnswer !== 'string') {
		return { isCorrect: false, normalizedChoice: null, points: 0 };
	}

	const q = OFFICIAL_30_QUESTIONS.find((item) => item.questionNumber === questionNumber);
	if (!q) {
		return { isCorrect: false, normalizedChoice: studentAnswer.trim(), points: 0 };
	}

	const raw = studentAnswer.trim();
	if (!raw) {
		return { isCorrect: false, normalizedChoice: null, points: 0 };
	}

	// Clean wrappers e.g. "A.", "(A)", "[A]", "A)", "pilihan A", "opsi A", "jawaban A"
	let cleaned = raw.replace(/^[\s\(\[\{]+|[\s\)\]\}]+$/g, '').trim();
	cleaned = cleaned.replace(/^(pilihan|opsi|jawaban|option)\s+/i, '').trim();

	const upper = cleaned.toUpperCase();
	const weight = 100 / 30; // ~3.333 poin per butir

	// 1. Direct letter check (A, B, C, D)
	if (['A', 'B', 'C', 'D'].includes(upper)) {
		const isCorrect = upper === q.correctAnswer;
		return { isCorrect, normalizedChoice: upper as any, points: isCorrect ? weight : 0 };
	}

	// 1b. Check starting with A., A), B., B), C., C), D., D)
	const prefixMatch = cleaned.match(/^([a-dA-D])[\.\)\:\-]/);
	if (prefixMatch) {
		const letter = prefixMatch[1].toUpperCase() as 'A' | 'B' | 'C' | 'D';
		const isCorrect = letter === q.correctAnswer;
		return { isCorrect, normalizedChoice: letter, points: isCorrect ? weight : 0 };
	}

	// 2. Full option text matching
	const norm = raw.toLowerCase().replace(/\s+/g, ' ').trim();
	const normA = q.optionA.toLowerCase().replace(/\s+/g, ' ').trim();
	const normB = q.optionB.toLowerCase().replace(/\s+/g, ' ').trim();
	const normC = q.optionC.toLowerCase().replace(/\s+/g, ' ').trim();
	const normD = q.optionD.toLowerCase().replace(/\s+/g, ' ').trim();

	if (norm === normA || norm.includes(normA) || normA.includes(norm)) {
		const isCorrect = q.correctAnswer === 'A';
		return { isCorrect, normalizedChoice: 'A', points: isCorrect ? weight : 0 };
	}
	if (norm === normB || norm.includes(normB) || normB.includes(norm)) {
		const isCorrect = q.correctAnswer === 'B';
		return { isCorrect, normalizedChoice: 'B', points: isCorrect ? weight : 0 };
	}
	if (norm === normC || norm.includes(normC) || normC.includes(norm)) {
		const isCorrect = q.correctAnswer === 'C';
		return { isCorrect, normalizedChoice: 'C', points: isCorrect ? weight : 0 };
	}
	if (norm === normD || norm.includes(normD) || normD.includes(norm)) {
		const isCorrect = q.correctAnswer === 'D';
		return { isCorrect, normalizedChoice: 'D', points: isCorrect ? weight : 0 };
	}

	return { isCorrect: false, normalizedChoice: raw, points: 0 };
}

// Backward-compatibility alias
export const evaluateEssayItem = (qNum: number, text: string | null) => evaluateQuestionAnswer(qNum, text);

/**
 * 8. SUBMIT QUIZ ATTEMPT (PILIHAN GANDA 30 SOAL OTOMATIS DINILAI)
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

	const answersBreakdown = OFFICIAL_30_QUESTIONS.map((q) => {
		const rawAns =
			data.answers[q.id] ??
			data.answers[q.questionNumber.toString()] ??
			data.answers[`num_${q.questionNumber}`] ??
			null;
		const studentChoice = typeof rawAns === 'string' && rawAns.trim() !== '' ? rawAns.trim() : null;

		const evaluation = evaluateQuestionAnswer(q.questionNumber, studentChoice);
		if (studentChoice !== null) {
			answeredCount++;
			if (evaluation.isCorrect) correctCount++;
		}

		return {
			questionId: q.id,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			optionA: q.optionA,
			optionB: q.optionB,
			optionC: q.optionC,
			optionD: q.optionD,
			studentAnswer: evaluation.normalizedChoice || studentChoice,
			correctAnswer: q.correctAnswer,
			isCorrect: evaluation.isCorrect,
			explanation: q.explanation
		};
	});

	const totalQuestions = OFFICIAL_30_QUESTIONS.length;
	const wrongCount = totalQuestions - correctCount;
	const computedScore = Math.min(100, Math.round((correctCount / totalQuestions) * 100));
	const score: number = computedScore;

	let attemptId = data.attemptId || 'att-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
	let studentId = 'std-' + cleanNim;
	let quizId = '11111111-1111-1111-1111-111111111111';

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

				// Fetch database questions to resolve real Question UUIDs
				const qMap = new Map<number, string>();
				try {
					const dbQuestions = await prisma.question.findMany({
						where: { quizId }
					});
					for (const dbq of dbQuestions) {
						qMap.set(dbq.questionNumber, dbq.id);
					}
				} catch (e) {}

				for (const item of answersBreakdown) {
					const realQId = isUuid(item.questionId) ? item.questionId : qMap.get(item.questionNumber);
					if (realQId && isUuid(realQId) && isUuid(attemptId)) {
						try {
							await prisma.answer.upsert({
								where: {
									attemptId_questionId: { attemptId, questionId: realQId }
								},
								update: {
									selectedAnswer: item.studentAnswer || '',
									isCorrect: item.isCorrect,
									answeredAt: now
								},
								create: {
									attemptId,
									questionId: realQId,
									selectedAnswer: item.studentAnswer || '',
									isCorrect: item.isCorrect,
									answeredAt: now
								}
							});
						} catch (ansErr) {
							console.warn('submitQuizAttempt answer upsert notice:', ansErr);
						}
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
			}
		} catch (prismaErr) {
			console.warn('Prisma error during submit:', prismaErr);
		}
	}

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

			// Insert / upsert essay answers into Supabase answers table
			for (const item of answersBreakdown) {
				if (item.questionId && item.questionId.includes('-')) {
					try {
						await supabaseAdmin.from('answers').upsert(
							{
								attempt_id: attemptId,
								question_id: item.questionId,
								selected_answer: item.studentAnswer,
								is_correct: item.isCorrect,
								answered_at: now.toISOString()
							},
							{ onConflict: 'attempt_id,question_id' }
						);
					} catch (ansErr) {}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase REST submit error:', supaErr);
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
 * 9. GRADE ESSAY QUIZ ATTEMPT (ADMIN MANUAL EVALUATION)
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

	// 1. Update in Prisma
	if (isDatabaseConfigured && attemptId.includes('-')) {
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
					if (q.questionId && q.questionId.includes('-')) {
						try {
							await prisma.answer.updateMany({
								where: {
									attemptId,
									questionId: q.questionId
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

	// 2. Update in Supabase
	if (isSupabaseConfigured && attemptId.includes('-')) {
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
					if (q.questionId && q.questionId.includes('-')) {
						try {
							await supabaseAdmin
								.from('answers')
								.update({
									is_correct: q.isCorrect
								})
								.eq('attempt_id', attemptId)
								.eq('question_id', q.questionId);
						} catch (e) {}
					}
				}
			}
		} catch (supaErr) {
			console.warn('Supabase grade notice:', supaErr);
		}
	}

	// 3. Update Memory attempts
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
		message: 'Penilaian essai berhasil disimpan.'
	};
}
