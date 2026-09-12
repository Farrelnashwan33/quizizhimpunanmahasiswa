import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';
import { recordAttempt } from '$lib/server/participantStore';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { studentName, nim, programStudi, whatsapp } = body;

		if (!studentName?.trim() || !nim?.trim() || !programStudi?.trim()) {
			return json(
				{ success: false, error: 'Nama Lengkap, NIM, dan Program Studi wajib diisi.' },
				{ status: 400 }
			);
		}

		const cleanName = studentName.trim();
		const cleanNim = nim.trim();
		const cleanProdi = programStudi.trim();
		const cleanWa = whatsapp?.trim() || null;
		const studentEmail = `${cleanNim}@student.ut.ac.id`;

		// 1. Find active quiz (or default quiz)
		let quiz = await prisma.quiz.findFirst({
			where: { isActive: true },
			include: {
				questions: {
					orderBy: { questionNumber: 'asc' }
				}
			}
		});

		if (!quiz) {
			quiz = await prisma.quiz.findFirst({
				include: {
					questions: {
						orderBy: { questionNumber: 'asc' }
					}
				}
			});
		}

		// If no quiz exists in DB yet, create it with 30 questions
		if (!quiz) {
			quiz = await prisma.quiz.create({
				data: {
					id: '11111111-1111-1111-1111-111111111111',
					title: 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung',
					description: 'Uji Pemahaman, Bangun Karakter, dan Siap Berkontribusi.',
					durationMinutes: 60,
					isActive: true,
					showResult: true,
					allowRetry: false,
					questions: {
						create: OFFICIAL_30_QUESTIONS.map((q) => ({
							questionNumber: q.questionNumber,
							section: q.section,
							questionText: q.questionText,
							optionA: q.optionA,
							optionB: q.optionB,
							optionC: q.optionC,
							optionD: q.optionD,
							correctAnswer: q.correctAnswer,
							explanation: q.explanation
						}))
					}
				},
				include: {
					questions: {
						orderBy: { questionNumber: 'asc' }
					}
				}
			});
		}

		// 2. Upsert Student Profile in PostgreSQL database
		let profile = await prisma.profile.findFirst({
			where: {
				OR: [{ nim: cleanNim }, { email: studentEmail }]
			}
		});

		if (profile) {
			profile = await prisma.profile.update({
				where: { id: profile.id },
				data: {
					fullName: cleanName,
					programStudi: cleanProdi,
					whatsapp: cleanWa,
					nim: cleanNim,
					email: studentEmail
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

		// 3. Create Quiz Attempt record in PostgreSQL database with status 'in_progress'
		const totalQuestionsCount = quiz.questions?.length || 30;
		const now = new Date();

		const attempt = await prisma.quizAttempt.create({
			data: {
				quizId: quiz.id,
				studentId: profile.id,
				status: 'in_progress',
				startedAt: now,
				totalQuestions: totalQuestionsCount,
				score: null,
				correctCount: 0,
				wrongCount: 0
			}
		});

		// 4. Also store in participantStore for instant admin fallback/mirroring
		try {
			recordAttempt({
				id: attempt.id,
				quizId: quiz.id,
				studentId: profile.id,
				status: 'in_progress',
				score: null,
				correctCount: 0,
				wrongCount: 0,
				totalQuestions: totalQuestionsCount,
				startedAt: now,
				submittedAt: null,
				student: {
					id: profile.id,
					fullName: profile.fullName,
					nim: profile.nim,
					email: profile.email,
					programStudi: profile.programStudi,
					whatsapp: profile.whatsapp,
					role: 'mahasiswa',
					createdAt: profile.createdAt
				},
				quiz: {
					id: quiz.id,
					title: quiz.title
				},
				answers: []
			});
		} catch (storeErr) {
			console.warn('Store mirror warning:', storeErr);
		}

		// 5. Return sanitized questions (NO correctAnswer exposed!)
		const sanitizedQuestions = (quiz.questions && quiz.questions.length > 0
			? quiz.questions
			: OFFICIAL_30_QUESTIONS
		).map((q) => ({
			id: q.id,
			questionNumber: q.questionNumber,
			section: q.section,
			questionText: q.questionText,
			optionA: q.optionA,
			optionB: q.optionB,
			optionC: q.optionC,
			optionD: q.optionD
		}));

		return json({
			success: true,
			attemptId: attempt.id,
			studentId: profile.id,
			studentName: profile.fullName,
			nim: profile.nim,
			programStudi: profile.programStudi,
			whatsapp: profile.whatsapp,
			startedAt: attempt.startedAt.toISOString(),
			questions: sanitizedQuestions,
			totalQuestions: sanitizedQuestions.length
		});
	} catch (err: any) {
		console.error('Error in /api/quiz/start:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memulai kuis di database.' },
			{ status: 500 }
		);
	}
};
