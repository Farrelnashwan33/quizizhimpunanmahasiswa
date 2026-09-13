import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { gradeQuizAttempt } from '$lib/server/dbService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { attemptId, score, feedback, questionGrades } = body;

		if (!attemptId) {
			return json({ success: false, error: 'attemptId wajib diisi.' }, { status: 400 });
		}

		if (score === undefined || score === null || isNaN(Number(score))) {
			return json({ success: false, error: 'Nilai skor valid wajib diisi.' }, { status: 400 });
		}

		const result = await gradeQuizAttempt({
			attemptId,
			score: Number(score),
			feedback: feedback || null,
			questionGrades: Array.isArray(questionGrades) ? questionGrades : undefined
		});

		return json(result);
	} catch (err: any) {
		console.error('Error in grade API:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal menyimpan penilaian.' },
			{ status: 500 }
		);
	}
};
