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

		const totalQuestions = 30;

		// 2. Execute database transaction for essay submission
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

			const answeredCount = savedAnswers.filter(
				(a) => a.selectedAnswer && a.selectedAnswer.trim() !== ''
			).length;

			// Update attempt record to completed
			const updatedAttempt = await tx.quizAttempt.update({
				where: { id: attemptId },
				data: {
					status: 'completed',
					submittedAt: new Date(),
					totalQuestions
				}
			});

			return {
				updatedAttempt,
				answeredCount
			};
		});

		return json({
			success: true,
			attemptId: result.updatedAttempt.id,
			score: result.updatedAttempt.score,
			answeredCount: result.answeredCount,
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
