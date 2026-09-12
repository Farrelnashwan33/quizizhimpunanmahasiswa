import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { attemptId, finalAnswers } = await request.json();

		if (!attemptId) {
			throw error(400, 'Attempt ID tidak valid');
		}

		// 1. Fetch attempt and verify ownership
		const attempt = await prisma.quizAttempt.findUnique({
			where: { id: attemptId },
			include: { quiz: true }
		});

		if (!attempt || attempt.studentId !== locals.user.id) {
			throw error(403, 'Akses pengerjaan kuis tidak valid');
		}

		if (attempt.status === 'completed') {
			return json({
				success: true,
				alreadySubmitted: true,
				attemptId: attempt.id,
				score: attempt.score
			});
		}

		// 2. Fetch all questions with correct answers from DB
		const questions = await prisma.question.findMany({
			where: { quizId: attempt.quizId },
			orderBy: { questionNumber: 'asc' }
		});

		const totalQuestions = questions.length || 30;

		// 3. Execute database transaction for atomic score calculation and submission
		const result = await prisma.$transaction(async (tx) => {
			// Save any final in-flight answers if provided
			if (finalAnswers && typeof finalAnswers === 'object') {
				for (const [questionId, selectedAnswer] of Object.entries(finalAnswers)) {
					if (selectedAnswer) {
						await tx.answer.upsert({
							where: {
								attemptId_questionId: {
									attemptId,
									questionId
								}
							},
							update: {
								selectedAnswer: selectedAnswer as string,
								answeredAt: new Date()
							},
							create: {
								attemptId,
								questionId,
								selectedAnswer: selectedAnswer as string,
								answeredAt: new Date()
							}
						});
					}
				}
			}

			// Fetch all saved answers for this attempt
			const savedAnswers = await tx.answer.findMany({
				where: { attemptId }
			});

			const answerMap = new Map<string, string>();
			for (const a of savedAnswers) {
				if (a.selectedAnswer) {
					answerMap.set(a.questionId, a.selectedAnswer.toUpperCase());
				}
			}

			let correctCount = 0;

			// Evaluate each question
			for (const q of questions) {
				const studentAns = answerMap.get(q.id);
				const isCorrect = studentAns === q.correctAnswer.toUpperCase();

				if (isCorrect) {
					correctCount++;
				}

				// Update answer isCorrect status in DB
				if (studentAns) {
					await tx.answer.updateMany({
						where: {
							attemptId,
							questionId: q.id
						},
						data: {
							isCorrect
						}
					});
				}
			}

			const wrongCount = totalQuestions - correctCount;
			const rawScore = (correctCount / totalQuestions) * 100;
			const score = Math.round(rawScore * 100) / 100; // 2 decimal places

			// Update attempt record to completed
			const updatedAttempt = await tx.quizAttempt.update({
				where: { id: attemptId },
				data: {
					status: 'completed',
					submittedAt: new Date(),
					score,
					correctCount,
					wrongCount,
					totalQuestions
				}
			});

			return updatedAttempt;
		});

		return json({
			success: true,
			attemptId: result.id,
			score: result.score,
			correctCount: result.correctCount,
			wrongCount: result.wrongCount,
			totalQuestions: result.totalQuestions
		});
	} catch (err: any) {
		console.error('Error in submit quiz transaction:', err);
		return json(
			{ success: false, error: err?.message || 'Terjadi kegagalan saat mengirim jawaban kuis.' },
			{ status: 500 }
		);
	}
};
