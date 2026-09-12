import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { attemptId, questionId, selectedAnswer } = await request.json();

		if (!attemptId || !questionId || !selectedAnswer) {
			throw error(400, 'Parameter tidak lengkap');
		}

		// Verify attempt belongs to user and is still in_progress
		const attempt = await prisma.quizAttempt.findUnique({
			where: { id: attemptId }
		});

		if (!attempt || attempt.studentId !== locals.user.id) {
			throw error(403, 'Akses kuis tidak sah');
		}

		if (attempt.status !== 'in_progress') {
			throw error(400, 'Quiz ini sudah diselesaikan dan tidak dapat diubah lagi.');
		}

		// Upsert answer in database
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
	} catch (err: any) {
		console.error('Error in save-answer API:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal menyimpan jawaban' },
			{ status: 500 }
		);
	}
};
