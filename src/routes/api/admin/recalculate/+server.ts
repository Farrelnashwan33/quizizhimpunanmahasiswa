import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { recalculateAllAttempts, recalculateAttemptById } from '$lib/server/dbService';

export const POST: RequestHandler = async ({ request }) => {
	try {
		let body: any = {};
		try {
			body = await request.json();
		} catch (e) {}

		const attemptId = body?.attemptId;

		if (attemptId) {
			const result = await recalculateAttemptById(attemptId);
			if (!result.success) {
				return json({ success: false, error: result.error || 'Gagal menghitung nilai.' }, { status: 400 });
			}
			return json({
				success: true,
				message: `Nilai berhasil dihitung ulang secara otomatis (Skor: ${result.score}/100, Benar: ${result.correctCount}/30).`,
				data: result
			});
		}

		const result = await recalculateAllAttempts();
		return json({
			success: true,
			message: result.message,
			data: result
		});
	} catch (err: any) {
		console.error('Error in recalculate API:', err);
		return json(
			{ success: false, error: err?.message || 'Gagal melakukan perhitungan ulang nilai.' },
			{ status: 500 }
		);
	}
};
