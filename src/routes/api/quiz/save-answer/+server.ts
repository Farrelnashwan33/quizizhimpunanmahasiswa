import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/prisma';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const { attemptId, questionId, selectedAnswer } = await request.json();

		if (!attemptId || !questionId || !selectedAnswer) {
			return json(
				{ success: false, error: 'Parameter attemptId, questionId, dan selectedAnswer wajib diisi.' },
				{ status: 400 }
			);
		}

		// Verify attempt exists and is still in_progress
		const attempt = await prisma.quizAttempt.findUnique({
			where: { id: attemptId }
		});

		if (!attempt) {
			return json(
				{ success: false, error: 'Sesi pengerjaan kuis tidak ditemukan.' },
				{ status: 404 }
			);
		}

		if (attempt.status !== 'in_progress') {
			return json(
				{ success: false, error: 'Kuis ini sudah dikumpulkan dan tidak dapat diubah lagi.' },
				{ status: 400 }
			);
		}

		// Upsert answer in PostgreSQL database
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
			{ success: false, error: err?.message || 'Gagal menyimpan jawaban otomatis.' },
			{ status: 500 }
		);
	}
};
