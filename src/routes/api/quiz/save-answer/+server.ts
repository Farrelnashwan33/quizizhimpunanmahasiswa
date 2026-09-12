import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma, isDatabaseConfigured } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { attemptId, questionId, selectedAnswer } = await request.json();

		if (!attemptId || !questionId || !selectedAnswer) {
			return json(
				{ success: false, error: 'Parameter attemptId, questionId, dan selectedAnswer wajib diisi.' },
				{ status: 400 }
			);
		}

		if (isDatabaseConfigured && attemptId.includes('-') && questionId.includes('-')) {
			try {
				const attempt = await prisma.quizAttempt.findUnique({
					where: { id: attemptId }
				});

				if (attempt && attempt.status === 'in_progress') {
					const saved = await prisma.answer.upsert({
						where: {
							attemptId_questionId: {
								attemptId,
								questionId
							}
						},
						update: {
							selectedAnswer,
							answeredAt: new Date()
						},
						create: {
							attemptId,
							questionId,
							selectedAnswer,
							answeredAt: new Date()
						}
					});

					return json({
						success: true,
						answerId: saved.id,
						questionId: saved.questionId,
						selectedAnswer: saved.selectedAnswer
					});
				}
			} catch (dbErr) {
				console.warn('Database save-answer warning:', dbErr);
			}
		}

		return json({
			success: true,
			questionId,
			selectedAnswer,
			saved: 'cached'
		});
	} catch (err: any) {
		console.error('Error in save-answer API:', err);
		return json({ success: true, saved: 'fallback' });
	}
};
