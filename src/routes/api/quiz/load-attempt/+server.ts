import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loadAttemptAnswers } from '$lib/server/dbService';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const attemptId = url.searchParams.get('attemptId') || undefined;
		const nim = url.searchParams.get('nim') || undefined;

		if (!attemptId && !nim) {
			return json({
				success: false,
				error: 'Parameter attemptId atau nim diperlukan.'
			}, { status: 400 });
		}

		const result = await loadAttemptAnswers({ attemptId, nim });
		return json(result);
	} catch (err: any) {
		console.error('Error in /api/quiz/load-attempt:', err);
		return json({
			success: false,
			error: err?.message || 'Gagal memuat data jawaban pengerjaan.'
		}, { status: 500 });
	}
};
