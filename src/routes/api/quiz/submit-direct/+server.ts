import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
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

		// 1. Find or create Student Profile in database
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

		// 2. Find active Quiz
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

		const questionsList = (quiz?.questions && quiz.questions.length > 0)
			? quiz.questions
			: OFFICIAL_30_QUESTIONS;

		const totalQuestions = questionsList.length;

		// 3. Find or Create Attempt
		let targetAttempt: any = null;
		if (providedAttemptId) {
			targetAttempt = await prisma.quizAttempt.findUnique({
				where: { id: providedAttemptId }
			});
		}

		if (!targetAttempt) {
			// Find most recent in_progress attempt
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
					startedAt: new Date(),
					totalQuestions
				}
			});
		}

		const attemptId = targetAttempt?.id || providedAttemptId;
		const now = new Date();

		// 4. Calculate score and build answers breakdown securely
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

		// 5. Save all Answer records and update QuizAttempt in PostgreSQL Transaction
		if (attemptId && quiz) {
			try {
				await prisma.$transaction(async (tx) => {
					// Upsert each answer
					for (const item of answersBreakdown) {
						// Only if question exists as a valid UUID in DB Question table
						const qInDb = quiz?.questions?.find((dq) => dq.id === item.questionId || dq.questionNumber === item.questionNumber);
						const actualQId = qInDb?.id || item.questionId;

						if (actualQId && actualQId.includes('-')) {
							await tx.answer.upsert({
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
						}
					}

					// Update attempt status to completed
					await tx.quizAttempt.update({
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
				});
			} catch (txErr) {
				console.error('Database transaction error on submit:', txErr);
			}
		}

		// 6. Record to in-memory store as live cache mirror
		const attemptRecord = {
			id: attemptId,
			quizId: quiz?.id || '11111111-1111-1111-1111-111111111111',
			studentId: profile.id,
			status: 'completed' as const,
			score,
			correctCount,
			wrongCount,
			totalQuestions,
			startedAt: targetAttempt?.startedAt || now,
			submittedAt: now,
			student: {
				id: profile.id,
				fullName: profile.fullName,
				nim: profile.nim,
				email: profile.email,
				programStudi: profile.programStudi,
				whatsapp: profile.whatsapp,
				role: 'mahasiswa' as const,
				createdAt: profile.createdAt
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
			studentName: profile.fullName,
			nim: profile.nim,
			programStudi: profile.programStudi,
			score,
			correctCount,
			wrongCount,
			totalQuestions,
			submittedAt: now.toISOString(),
			answersBreakdown
		});
	} catch (err: any) {
		console.error('Error submitting quiz:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal memproses pengiriman kuis.' },
			{ status: 500 }
		);
	}
};
