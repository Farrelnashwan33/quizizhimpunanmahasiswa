import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';
import { evaluateEssayItem, OFFICIAL_30_QUESTIONS } from '$lib/server/dbService';

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

		if (attempt.status === 'completed' && attempt.score !== null) {
			return json({
				success: true,
				alreadySubmitted: true,
				attemptId: attempt.id,
				score: attempt.score
			});
		}

		const totalQuestions = 30;

		// 2. Fetch questions from DB
		const dbQuestions = await prisma.question.findMany({
			where: { quizId: attempt.quizId },
			orderBy: { questionNumber: 'asc' }
		});

		// 3. Execute database transaction for automatic essay scoring
		const result = await prisma.$transaction(async (tx) => {
			// Save any final in-flight answers if provided
			if (finalAnswers && typeof finalAnswers === 'object') {
				for (const [questionId, selectedAnswer] of Object.entries(finalAnswers)) {
					if (selectedAnswer && typeof selectedAnswer === 'string' && selectedAnswer.trim() !== '') {
						await tx.answer.upsert({
							where: {
								attemptId_questionId: {
									attemptId,
									questionId
								}
							},
							update: {
								selectedAnswer: selectedAnswer.trim(),
								answeredAt: new Date()
							},
							create: {
								attemptId,
								questionId,
								selectedAnswer: selectedAnswer.trim(),
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
					answerMap.set(a.questionId, a.selectedAnswer);
				}
			}

			let totalRawPoints = 0;
			let correctCount = 0;

			// Evaluate each of the 30 questions
			for (const q of dbQuestions) {
				const studentText = answerMap.get(q.id) || null;
				const evaluation = evaluateEssayItem(q.questionNumber, studentText);

				if (studentText) {
					totalRawPoints += evaluation.points;
					if (evaluation.isCorrect) correctCount++;
				}

				await tx.answer.updateMany({
					where: { attemptId, questionId: q.id },
					data: { isCorrect: evaluation.isCorrect }
				});
			}

			const computedScore = Math.min(100, Math.round(totalRawPoints * 10) / 10);
			const wrongCount = totalQuestions - correctCount;

			// Update attempt record to completed with score
			const updatedAttempt = await tx.quizAttempt.update({
				where: { id: attemptId },
				data: {
					status: 'completed',
					submittedAt: new Date(),
					score: computedScore,
					correctCount,
					wrongCount,
					totalQuestions
				}
			});

			return {
				updatedAttempt,
				score: computedScore,
				correctCount,
				wrongCount
			};
		});

		return json({
			success: true,
			attemptId: result.updatedAttempt.id,
			score: result.score,
			correctCount: result.correctCount,
			wrongCount: result.wrongCount,
			totalQuestions
		});
	} catch (err: any) {
		console.error('Error in submit quiz transaction:', err);
		return json(
			{ success: false, error: err?.message || 'Terjadi kegagalan saat mengirim jawaban kuis.' },
			{ status: 500 }
		);
	}
};
