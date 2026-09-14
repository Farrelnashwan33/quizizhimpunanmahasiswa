import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveAnswer } from '$lib/server/dbService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { attemptId, questionId, selectedAnswer } = body;

		if (!attemptId || !questionId || typeof selectedAnswer !== 'string') {
			return json(
				{ success: false, error: 'Parameter attemptId, questionId, dan selectedAnswer (string) wajib diisi.' },
				{ status: 400 }
			);
		}

		const result = await saveAnswer({
			attemptId: String(attemptId).trim(),
			questionId: String(questionId).trim(),
			selectedAnswer: String(selectedAnswer)
		});

		return json({
			success: true,
			attemptId,
			questionId,
			saved: true,
			savedAt: result.savedAt
		});
	} catch (err: any) {
		console.error('Error in save-answer API:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal menyimpan jawaban ke database.' },
			{ status: 500 }
		);
	}
};
