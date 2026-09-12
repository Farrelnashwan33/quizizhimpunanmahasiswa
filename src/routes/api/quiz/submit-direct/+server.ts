import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';
import { OFFICIAL_30_QUESTIONS } from '$lib/data/questions';
import { recordAttempt } from '$lib/server/participantStore';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { attemptId: providedAttemptId, studentName, nim, programStudi, whatsapp, answers } = body;

		if (!studentName?.trim() || !nim?.trim()) {
			return json(
				{ success: false, error: 'Nama Lengkap dan NIM wajib diisi.' },
				{ status: 400 }
			);
		}

		const cleanName = studentName.trim();
		const cleanNim = nim.trim();
		const cleanProdi = programStudi?.trim() || 'Sains dan Teknologi';
		const cleanWa = whatsapp?.trim() || null;
		const studentEmail = `${cleanNim}@student.ut.ac.id`;

		// 1. Get Questions list (from DB if available, fallback to OFFICIAL_30_QUESTIONS)
		let questionsList: any[] = OFFICIAL_30_QUESTIONS;
		let quiz: any = null;

		if (isDatabaseConfigured) {
			try {
				quiz = await prisma.quiz.findFirst({
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

				if (quiz?.questions && quiz.questions.length > 0) {
					questionsList = quiz.questions;
				}
			} catch (dbErr) {
				console.warn('Database query notice in submit-direct (using fallback questions):', dbErr);
			}
		}

		const totalQuestions = questionsList.length;
		const now = new Date();

		// 2. Calculate score and build answers breakdown securely on server
		let correctCount = 0;
		const answersBreakdown = questionsList.map((q: any) => {
			const studentAns = (answers?.[q.id] || answers?.[q.questionNumber] || null)?.toUpperCase() || null;
			const isCorrect = studentAns !== null && studentAns === q.correctAnswer.toUpperCase();
			if (isCorrect) {
				correctCount++;
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
				studentAnswer: studentAns,
				correctAnswer: q.correctAnswer,
				isCorrect,
				explanation: q.explanation
			};
		});

		const wrongCount = totalQuestions - correctCount;
		const rawScore = (correctCount / totalQuestions) * 100;
		const score = Math.round(rawScore * 100) / 100;
		let attemptId = providedAttemptId || 'att-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
		let studentId = 'std-' + cleanNim;

		// 3. Save to Database if configured and connected
		if (isDatabaseConfigured) {
			try {
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

				let targetAttempt: any = null;
				if (providedAttemptId) {
					targetAttempt = await prisma.quizAttempt.findUnique({
						where: { id: providedAttemptId }
					});
				}

				if (!targetAttempt) {
					targetAttempt = await prisma.quizAttempt.findFirst({
						where: {
							studentId: profile.id,
							status: 'in_progress'
						},
						orderBy: { startedAt: 'desc' }
					});
				}

				if (!targetAttempt && quiz) {
					targetAttempt = await prisma.quizAttempt.create({
						data: {
							quizId: quiz.id,
							studentId: profile.id,
							status: 'in_progress',
							startedAt: now,
							totalQuestions
						}
					});
				}

				if (targetAttempt) {
					attemptId = targetAttempt.id;

					// Upsert Answer records in database
					if (quiz?.questions) {
						for (const item of answersBreakdown) {
							const qInDb = quiz.questions.find(
								(dq: any) => dq.id === item.questionId || dq.questionNumber === item.questionNumber
							);
							const actualQId = qInDb?.id || item.questionId;

							if (actualQId && actualQId.includes('-')) {
								try {
									await prisma.answer.upsert({
										where: {
											attemptId_questionId: {
												attemptId,
												questionId: actualQId
											}
										},
										update: {
											selectedAnswer: item.studentAnswer,
											isCorrect: item.isCorrect,
											answeredAt: now
										},
										create: {
											attemptId,
											questionId: actualQId,
											selectedAnswer: item.studentAnswer,
											isCorrect: item.isCorrect,
											answeredAt: now
										}
									});
								} catch (ansErr) {
									// continue
								}
							}
						}
					}

					// Update attempt status to completed
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
			} catch (dbErr) {
				console.warn('Database save warning in submit-direct (retaining in-memory store):', dbErr);
			}
		}

		// 4. Record to in-memory store as reliable fallback/cache
		const attemptRecord = {
			id: attemptId,
			quizId: quiz?.id || '11111111-1111-1111-1111-111111111111',
			studentId,
			status: 'completed' as const,
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
				role: 'mahasiswa' as const,
				createdAt: now
			},
			quiz: {
				id: quiz?.id || '11111111-1111-1111-1111-111111111111',
				title: quiz?.title || 'Quiz Kaderisasi Tingkat I HIMA FST UT Bandung'
			},
			answers: answersBreakdown
		};

		recordAttempt(attemptRecord);

		return json({
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
		});
	} catch (err: any) {
		console.error('Error in submit-direct API:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memproses pengiriman kuis.' },
			{ status: 500 }
		);
	}
};
