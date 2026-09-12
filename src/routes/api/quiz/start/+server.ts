import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
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
		const now = new Date();

		let attemptId = 'att-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
		let studentId = 'std-' + cleanNim;
		let quizId = '11111111-1111-1111-1111-111111111111';
		let questionsList: any[] = OFFICIAL_30_QUESTIONS;

		// 1. Try PostgreSQL Database operations
		if (isDatabaseConfigured) {
			try {
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

				if (quiz) {
					quizId = quiz.id;
					if (quiz.questions && quiz.questions.length > 0) {
						questionsList = quiz.questions;
					}
				}

				// Upsert Student Profile in database
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

				studentId = profile.id;

				// Create Quiz Attempt in database
				const attempt = await prisma.quizAttempt.create({
					data: {
						quizId,
						studentId: profile.id,
						status: 'in_progress',
						startedAt: now,
						totalQuestions: questionsList.length,
						score: null,
						correctCount: 0,
						wrongCount: 0
					}
				});

				attemptId = attempt.id;
			} catch (dbErr) {
				console.warn('Database start notice (continuing with local session start):', dbErr);
			}
		}

		// 2. Record to in-memory store
		try {
			recordAttempt({
				id: attemptId,
				quizId,
				studentId,
				status: 'in_progress',
				score: null,
				correctCount: 0,
				wrongCount: 0,
				totalQuestions: questionsList.length,
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
			});
		} catch (storeErr) {
			console.warn('Store mirror warning:', storeErr);
		}

		// 3. Return sanitized questions (NO correctAnswer exposed!)
		const sanitizedQuestions = questionsList.map((q) => ({
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
			attemptId,
			studentId,
			studentName: cleanName,
			nim: cleanNim,
			programStudi: cleanProdi,
			whatsapp: cleanWa,
			startedAt: now.toISOString(),
			questions: sanitizedQuestions,
			totalQuestions: sanitizedQuestions.length
		});
	} catch (err: any) {
		console.error('Error in /api/quiz/start:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memulai kuis.' },
			{ status: 500 }
		);
	}
};
