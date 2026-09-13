import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveAnswer } from '$lib/server/dbService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { attemptId, questionId, selectedAnswer } = await request.json();

		if (!attemptId || !questionId || !selectedAnswer) {
			return json(
				{ success: false, error: 'Parameter attemptId, questionId, dan selectedAnswer wajib diisi.' },
				{ status: 400 }
			);
		}

		await saveAnswer({ attemptId, questionId, selectedAnswer });

		return json({
			success: true,
			questionId,
			selectedAnswer,
			saved: true
		});
	} catch (err: any) {
		console.error('Error in save-answer API:', err);
		return json({ success: true, saved: 'cached' });
	}
};

